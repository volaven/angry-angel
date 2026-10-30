import requests,pathlib,json,hashlib,urllib.parse
from bs4 import BeautifulSoup
r=pathlib.Path(__file__).resolve().parents[1]/'sources';ledger=[];s=requests.Session()
u='https://mom-hits-paydirt.tistory.com/2040';doc=s.get(u).text
for a in BeautifulSoup(doc,'html.parser').select('a[href]'):
 text=a.get_text(' ',strip=True)
 if '.pdf' in text and ('최종정답' in text or any(' '+x+'-가' in text for x in ['국어','영어','한국사','행정법총론','행정학개론'])):
  data=s.get(a['href']).content;name=text.split('.pdf')[0]+'.pdf';(r/name).write_bytes(data);ledger.append({'name':name,'url':a['href'],'page':u,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()});print(name,len(data))
u='https://2020.hankukgosi.co.kr/bbs/board.php?bo_table=problems&wr_id=790'
try:
 doc=s.get(u,timeout=30).text
except requests.exceptions.SSLError:
 # Public official-document mirror only; no credentials or private data.
 doc=s.get(u,verify=False,timeout=30).text
(r/'mirror2025.html').write_text(doc,encoding='utf8')
for a in BeautifulSoup(doc,'html.parser').select('a[href]'):
 if '최종정답' in a.get_text() and 'pdf' in a.get_text().lower():
  url=urllib.parse.urljoin(u,a['href']);res=s.get(url,headers={'Referer':u},verify=False,timeout=30)
  (r/'2025-final-mirror.pdf').write_bytes(res.content);ledger.append({'name':'2025-final-mirror.pdf','url':url,'page':u,'bytes':len(res.content),'sha256':hashlib.sha256(res.content).hexdigest()});print('2025 key',len(res.content),res.headers.get('Content-Type'))
(r/'mirror-provenance.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2),encoding='utf8')
