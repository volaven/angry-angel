import requests,pathlib,json,hashlib,zipfile
root=pathlib.Path(__file__).resolve().parents[1]/'sources';base='https://gongmuwon.gosi.kr';s=requests.Session();ledger=[]
for year,pid,kind in [(2024,4464,'answers'),(2025,4704,'answers'),(2024,4461,'questions')]:
 url=base+'/oprut/GetAtchFileLst.do';data=s.post(url,data={'atchFileId':f'BBSMSTR_000000000138_{pid}'},timeout=45).json()
 print(year,kind,json.dumps(data,ensure_ascii=False))
 for f in data:
  name=f['strgFileNm'];u=f['filePathNm'];u=u if u.startswith('http') else base+u
  r=s.get(u,timeout=90)
  if not r.ok:
   print('Unavailable',u);ledger.append({'year':year,'kind':kind,'file':name,'url':u,'postId':pid,'expectedSize':f['atchFileSz'],'status':r.status_code});continue
  p=root/f'{year}-{kind}-{name}';p.write_bytes(r.content)
  ledger.append({'year':year,'kind':kind,'file':p.name,'url':u,'postId':pid,'sha256':hashlib.sha256(r.content).hexdigest()})
(root/'official-provenance.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2),encoding='utf8')
for p in root.glob('2024-questions-*.zip'):
 with zipfile.ZipFile(p) as z:
  for i in z.infolist():
   name=i.filename
   try:name=name.encode('cp437').decode('cp949')
   except UnicodeError:pass
   if name.endswith('.pdf') and any(' '+x+'-' in name for x in ['국어','영어','한국사','행정법총론','행정학개론']):(root/pathlib.Path(name).name).write_bytes(z.read(i))
