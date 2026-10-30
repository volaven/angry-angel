"""Display-only migration. Never changes question IDs, answers or publication gates."""
import json,re,pathlib,hashlib
import pymupdf as fitz
from PIL import Image
R=pathlib.Path(__file__).resolve().parents[1]
bank=json.loads((R/'src/bank.json').read_text(encoding='utf8'))
out={}; audit=[]
inline={
 '2024-1-6':['Despite','those','compared','their'],
 '2025-1-12':['customized','features','laughter','including'],
 '2025-1-13':['cooking','rearranging','opening','choosing'],
}
position={'2024-1-17','2025-1-16'}
sentences={'2024-1-16','2025-1-17'}
preserve={'2024-0-7','2024-0-9','2024-0-15','2025-1-6','2025-1-7','2025-1-11','2025-1-14','2025-1-15'}
material={'2024-0-12','2024-0-15','2024-1-9','2024-1-12','2025-0-1','2025-0-2','2025-0-15','2025-0-16','2025-1-4','2025-1-6','2025-1-7','2025-1-11','2025-1-14'}
def compact(s):return re.sub(r'\s+',' ',s).strip()
raw_lines={}
for year in (2024,2025):
 for subject in (0,1):
  lookup={}
  for page in fitz.open(R/f'public/exams/{year}-{subject}.pdf'):
   for b in page.get_text('dict')['blocks']:
    for line in b.get('lines',[]):
     raw=''.join(span['text'] for span in line['spans'])
     lookup[re.sub(r'\s+','',raw)]=raw
  raw_lines[(year,subject)]=lookup
active_lookup={};english=False
def paragraphs(s,preserved=False):
 # Keep structural labels, dialogue turns and original paragraph boundaries.
 if preserved:
  lines=[];blank=0
  for line in s.splitlines():
   if not line.strip():blank+=1;continue
   if lines and blank>=2:lines.append('')
   lines.append(line.strip());blank=0
  return [{'kind':'preserved','text':'\n'.join(lines)}] if lines else []
 lines=s.splitlines(); groups=[];cur='';blank=0;prev_raw=''
 for line in lines:
  if not line.strip():blank+=1;continue
  raw=active_lookup.get(re.sub(r'\s+','',line))
  structural=bool(re.match(r'\s*(?:[A-Z가-힣]{1,5}\s*[:：]|\([A-Z가-힣]\)|[□○*])',line))
  if cur and (blank>=2 or structural or preserved or (raw is not None and raw.startswith('  '))):groups.append(cur);cur=''
  join=' ' if (english or not prev_raw or prev_raw[-1].isspace() or prev_raw.rstrip().endswith(('.',':',',','?','!'))) else ''
  cur+=(join if cur else '')+compact(raw if raw is not None else line)
  prev_raw=raw if raw is not None else line+' ';blank=0
 if cur:groups.append(cur)
 return [{'kind':'paragraph','text':g} for g in groups if g]
def source_blocks(q):
 blocks=[]
 for src in q['images']:
  if 'passage' in src:
   if Image.open(R/'public'/src.lstrip('/')).height>100:blocks.append({'kind':'source','src':src})
   continue
  # Extract the complete source material above independent choices. Original remains linked.
  doc=fitz.open(R/'public'/q['source'].lstrip('/'));ci=int(pathlib.Path(src).stem.split('-')[-1]);p=doc[ci//2];side=ci%2;w=p.rect.width
  rect=fitz.Rect(3+side*w/2,40,(side+1)*w/2-2,p.rect.height-10)
  words=p.get_text('words',clip=rect);markers=[x for x in words if x[4]==str(q['number'])+'.' and abs(x[0]-(22.9 if side==0 else w/2+12.9))<9]
  if not markers:blocks.append({'kind':'source','src':src});continue
  top=markers[0][1]-5
  choices=[x for x in words if '①' in x[4] and x[1]>top]
  bottom=min(x[1] for x in choices)-3 if choices else p.rect.height-10
  if bottom<=top:blocks.append({'kind':'source','src':src});continue
  pix=p.get_pixmap(matrix=fitz.Matrix(2,2),clip=fitz.Rect(rect.x0,top,rect.x1,bottom));dest=f'/exams/material-{q["id"]}-{ci}.webp'
  Image.frombytes('RGB',[pix.width,pix.height],pix.samples).save(R/'public'/dest.lstrip('/'),quality=94)
  blocks.append({'kind':'source','src':dest})
 return blocks
for q in bank:
 if not q['verified']:continue
 id=q['id'];stem=q['stem'].strip();active_lookup=raw_lines[(q['year'],int(id.split('-')[1]))];english=q['subject']=='영어'
 opts=[' '.join(b['text'] for b in paragraphs(x)) for x in q['choices']]
 # Shared-passages put the actual instruction last; other questions put it first.
 shared=stem.startswith('[');lines=stem.splitlines()
 if shared and re.search(r'(?:것은|고르시오|답하시오)[.?。]?$',lines[-1].strip()) and len(lines)>2:
  instruction=lines[-1].strip();body='\n'.join(lines[1:-1])
 else:
  end=next((i for i,x in enumerate(lines) if re.search(r'[?？]|고르시오\.|답하시오\.',x)),0)
  instruction=compact(' '.join(lines[:end+1]));body='\n'.join(lines[end+1:])
 instruction=re.sub(r'^\[.*?\]\s*','',instruction)
 instruction=instruction.replace('밑줄친부분에들어갈말로가장적절한것을고르시오.','밑줄 친 부분에 들어갈 말로 가장 적절한 것을 고르시오.').replace('밑줄친부분중어법상옳지않은것을고르시오.','밑줄 친 부분 중 어법상 옳지 않은 것을 고르시오.')
 p={'kind':'choice','instruction':instruction,'blocks':paragraphs(body,id in preserve),'options':opts,'sourceStatus':'source-text-crosschecked'}
 if id in inline or id in position or id in sentences:
  # The complete marked passage is essential; never treat the split suffixes as independent answers.
  full=re.sub(r'(?m)^\s*'+str(q['number'])+r'\.\s*','',q['fullText'])
  first=full.find('\n');full=full[first+1:] if first>=0 else full
  p['kind']='inline-marked';p['blocks']=paragraphs(full)
  if id in inline:p['options']=inline[id];p['marks']=inline[id]
  elif id in position:p['options']=[f'{c} 위치 — '+compact(q['choices'][i]).lstrip(') ').split('.')[0].rstrip(' (')+'.' for i,c in enumerate('①②③④')]
  else:
   p['options']=[compact(x).split('. ')[0].rstrip('.')+'.' for x in q['choices']]
  p['sourceStatus']='inline-source-corrected'
 if id in material:
  p['kind']='material';p['blocks']=source_blocks(q);p['sourceStatus']='original-material-preserved'
 # Vocabulary target underlines are semantically essential even when no circled number exists.
 targets={'2024-1-2':'concealed','2024-1-3':'appease','2024-1-4':'play down','2024-1-5':'had the guts'}
 if id in targets:p['emphasis']=[targets[id]]
 option_marks={'2024-0-3':['허구헌','통째로','하마터면','잘록하게'],'2024-0-14':['배회(徘徊)하였다','무진장(無盡藏)하다','경청(傾聽)할','명기(明記)하지'],'2024-1-7':['still more','Once confirmed','Provided that','much news']}
 if id in option_marks:p['optionMarks']=option_marks[id]
 if id=='2024-0-9':p['options']=['(가) '+x[0]+' · (나) '+x[1]+' · (다) '+x[2] for x in [s.split() for s in q['choices']]]
 if id=='2024-0-18':
  p['kind']='inline-marked';p['options']=['㉠ 기후 위기는 날이 갈수록 심각해지고 있다.','㉡ 우리의 삶을 지속적으로 위협하는 이러한 기상 재해 앞에서 기후학자로서 자괴감이 든다.','㉢ 국가 정책 수립과 국제 협약을 체결하기 위해 힘을 기울여야 한다.','㉣ 지구가 파국으로 치닫는 것을 막을 기회는 아직 남아 있다.']
 if id=='2025-0-12':p['kind']='inline-marked';p['options']=['㉠ 표기한','㉡ 번역한','㉢ 기록한','㉣ 필사한']
 if id=='2024-0-12':p['options']=['(가) — 왜군이라는 외부의 적은 물론이고… 앞','(나) — 전란 중 겪은 원균과의 갈등도… 앞','(다) — 그뿐만 아니라 이순신은… 앞','(라) — 『난중일기』의 위대함은… 앞']
 out[id]=p
 audit.append({'id':id,'kind':p['kind'],'source':q['source'],'page':q['sourcePage'],'answerPreserved':q['answer'],'sourceStatus':p['sourceStatus'],'originalSHA256':hashlib.sha256(json.dumps(q,ensure_ascii=False,sort_keys=True).encode()).hexdigest()})
(R/'src/question-presentations.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
(R/'reports/presentation-migration.json').write_text(json.dumps({'count':len(out),'records':audit,'limitations':['80문항의 원문 텍스트 연결·표현 구조 검사와 주요 표시형·자료형의 시각 대조를 구분한다. 80문항 전체의 사람에 의한 문장 교정은 미완료.','원본 문단/서식이 중요한 13문항은 텍스트를 추정하여 다시 쓰지 않고 원문 자료를 표시한다.']},ensure_ascii=False,indent=2),encoding='utf8')
print('Presentation records:',len(out))
