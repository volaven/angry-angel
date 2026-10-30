import pathlib,zipfile,json,requests,hashlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
subjects=['국어','영어','한국사','행정법총론','행정학개론']
for year,kind in [(2025,'PDF'),(2024,'한글')]:
 p=pathlib.Path(f'C:/Users/sisio/Downloads/{year}년도 국가공무원 9급 공개경쟁채용 필기시험 문제({kind}파일).zip')
 with zipfile.ZipFile(p) as z:
  for i in z.infolist():
   name=i.filename
   try:name=name.encode('cp437').decode('cp949')
   except (UnicodeError,LookupError):pass
   if any(f' {s}-' in name for s in subjects):
    target=ROOT/'sources'/pathlib.Path(name).name;target.write_bytes(z.read(i));print(target.name)
urls={'2024-pdfs.zip':'https://www.scnu.ac.kr/common/nttFileDownload.do?fileKey=f2ce7f245648389db1864d3ae0e60b36','official.html':'https://gongmuwon.gosi.kr/oprut/EvmArPrblmCransGdLst.do','mirror2025.html':'https://www.hankukgosi.co.kr/bbs/board.php?bo_table=problems&wr_id=790','mirror2024.html':'https://www.hankukgosi.co.kr/bbs/board.php?bo_table=problems&wr_id=759'}
for name,url in urls.items():
 try:
  r=requests.get(url,timeout=35);r.raise_for_status();(ROOT/'sources'/name).write_bytes(r.content);print(name,len(r.content),r.url)
 except Exception as e:print(name,str(e))
