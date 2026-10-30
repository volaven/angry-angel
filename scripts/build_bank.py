"""Reproducible PDF extraction. Preserve original question images; never infer answer keys."""
import pymupdf as fitz,pathlib,re,json,shutil,hashlib
R=pathlib.Path(__file__).resolve().parents[1];S=R/'sources';out=R/'public/exams';out.mkdir(exist_ok=True)
subjects=['국어','영어','한국사','행정법총론','행정학개론'];bank=[];report=[]
for year,book,prefix,keyfile in [(2024,'가','240323','2024년도 국가공무원 9급 공개경쟁채용 필기시험 최종정답.pdf'),(2025,'나','250405','2025-final.pdf')]:
 keydoc=fitz.open(S/keyfile);keytext='\n'.join(p.get_text() for p in keydoc);keylines=keytext.splitlines();shutil.copy2(S/keyfile,out/f'{year}-answers.pdf')
 for subject in subjects:
  ki=keylines.index(subject);assert keylines[ki+1]==book;answers=list(map(int,keylines[ki+2:ki+22]));assert len(answers)==20 and all(x in [1,2,3,4] for x in answers)
  pdf=S/f'{prefix} 국가 9급 {subject}-{book}.pdf';doc=fitz.open(pdf);sub=subjects.index(subject);stemid=f'{year}-{sub}';shutil.copy2(pdf,out/f'{stemid}.pdf')
  markers=[];columns=[];passages=[]
  for pi,p in enumerate(doc):
   w=p.rect.width;h=p.rect.height
   for side in (0,1):
    left=0 if side==0 else w/2;right=w/2 if side==0 else w
    words=p.get_text('words',clip=fitz.Rect(left,40,right,h-12));nums=[x for x in words if re.fullmatch(r'(?:[1-9]|1[0-9]|20)\.',x[4]) and abs(x[0]-(22.9 if side==0 else w/2+12.9))<9]
    if not nums:
     # Some PDFs use slightly different margins; find the consistent first numbered column.
     cand=[x for x in words if re.fullmatch(r'(?:[1-9]|1[0-9]|20)\.',x[4])]
     if cand:
      x0=min(x[0] for x in cand);nums=[x for x in cand if abs(x[0]-x0)<3]
    cols={'page':pi,'side':side,'left':left+3,'right':right-2,'top':43,'bottom':h-10,'markers':[]};ci=len(columns)
    for block in p.get_text('dict',clip=fitz.Rect(left,40,right,h-12))['blocks']:
     for line in block.get('lines',[]):
      st=''.join(span['text'] for span in line['spans']);sm=re.search(r'\[?\s*(\d+)\s*[∼～~－-]\s*(\d+)\]',st)
      if sm:passages.append({'from':int(sm[1]),'to':int(sm[2]),'column':ci,'y':line['bbox'][1]-5})
    for n in nums:
     m={'number':int(n[4][:-1]),'y':n[1]-5,'column':ci};cols['markers'].append(m);markers.append(m)
    columns.append(cols)
  # Require a unique, ordered sequence. Anything else blocks the entire source pending review.
  valid=[m['number'] for m in markers]==list(range(1,21))
  report.append({'year':year,'subject':subject,'count':len(markers),'ordered':valid,'numbers':[m['number'] for m in markers]})
  events=sorted(markers+passages,key=lambda m:(m['column'],m['y']))
  def segment(start,end,name):
   chunks=[];images=[]
   for ci in range(start['column'],end['column']+1):
    c=columns[ci];top=start['y'] if ci==start['column'] else c['top'];bottom=end['y']-4 if ci==end['column'] else c['bottom']
    if bottom<=top:continue
    rect=fitz.Rect(c['left'],top,c['right'],bottom);p=doc[c['page']];txt=p.get_text(clip=rect,sort=True).strip()
    if not txt:continue
    from PIL import Image
    pix=p.get_pixmap(matrix=fitz.Matrix(2,2),clip=rect);file=f'{name}-{ci}.webp';Image.frombytes('RGB',[pix.width,pix.height],pix.samples).save(out/file,quality=94);chunks.append(txt);images.append('/exams/'+file)
   return chunks,images
  for ix,m in enumerate(markers):
   if m['number']>20:continue
   ei=events.index(m);end=events[ei+1] if ei+1<len(events) else {'column':len(columns)-1,'y':columns[-1]['bottom']}
   chunks,images=segment(m,end,f'{stemid}-{m["number"]}')
   text='\n'.join(chunks);parts=re.split('[①②③④]',text);choices=[x.strip() for x in parts[1:5]] if len(parts)==5 else ['원문 보기 ①','원문 보기 ②','원문 보기 ③','원문 보기 ④']
   shared=[]
   for pas in passages:
    if pas['from']<=m['number']<=pas['to']:
     ep=events[events.index(pas)+1];pc,pi=segment(pas,ep,f'{stemid}-passage-{pas["from"]}');shared+=pc;images=pi+images
   bank.append({'id':f'{stemid}-{m["number"]}','year':year,'book':book,'subject':subject,'number':m['number'],'fullText':re.sub(r'\n\s*\n','\n','\n'.join(shared+[text])),'hasFigures':subject=='한국사' or (year==2024 and subject=='영어' and m['number'] in [9,12]),'stem':'\n'.join(shared+[re.sub(r'^\d+\.\s*','',parts[0])]),'choices':choices,'answer':answers[m['number']-1],'images':images,'source':f'/exams/{stemid}.pdf','sourcePage':columns[m['column']]['page']+1,'answerSource':f'/exams/{year}-answers.pdf','verified':False,'explanation':'해설 검수 대기 중입니다. 원본 정답표와 문제를 대조할 수 있습니다.','distractors':[],'explanationStatus':'pending',**({'lawNote':f'{year}년 시험 당시 기준입니다. 이후 법령 변경 검수는 아직 완료되지 않았습니다.'} if subject=='행정법총론' else {})})
(R/'src/bank.json').write_text(json.dumps(bank,ensure_ascii=False,indent=2),encoding='utf8')
(R/'reports/extraction.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report,ensure_ascii=False))
