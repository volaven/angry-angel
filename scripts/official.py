import requests,pathlib,re,zipfile
from bs4 import BeautifulSoup
root=pathlib.Path(__file__).resolve().parents[1]/'sources'
s=requests.Session();base='https://gongmuwon.gosi.kr'
for year in (2024,2025):
 r=s.post(base+'/oprut/EvmArPrblmCransGdLst.do',data={'sKeyword':str(year),'sGubun':'sTitle','testSeCd':'EXAM03'},timeout=40)
 (root/f'official-{year}.html').write_text(r.text,encoding='utf8')
 soup=BeautifulSoup(r.text,'html.parser')
 for a in soup.select('a[href]'):
  if 'fn_egov_inqire_notice' in a['href']:
   print(year,a.get_text(' ',strip=True),a['href'])
   if '최종정답' in a.get_text().replace(' ',''):
    ids=re.findall("'([^']+)'",a['href']);d=s.post(base+'/oprut/EvmArPrblmCransGdDtl.do',data={'pstId':ids[0],'bbsId':ids[1]},timeout=40)
    (root/f'key-page-{year}.html').write_text(d.text,encoding='utf8')
    ds=BeautifulSoup(d.text,'html.parser')
    for link in ds.select('a[href]'):
     if any(t in link.get_text() for t in ['pdf','PDF','hwp','다운로드']):print('FILE',link.get_text(' ',strip=True),link['href'])
with zipfile.ZipFile(root/'2024-pdfs.zip') as z:
 for i in z.infolist():
  name=i.filename
  try:name=name.encode('cp437').decode('cp949')
  except UnicodeError:pass
  if any(' '+x+'-' in name for x in ['국어','영어','한국사','행정법총론','행정학개론']):
   (root/pathlib.Path(name).name).write_bytes(z.read(i));print('PDF',name)
