import requests,json,pathlib
from bs4 import BeautifulSoup
r=pathlib.Path(__file__).resolve().parents[1]/'sources';s=requests.Session();base='https://gongmuwon.gosi.kr/oprut/'
subjects=s.post(base+'EvmArChcPrblmCransSbjctLst.do',data={'testCd':'08'},timeout=40).json()
for sub in subjects:
 if sub['sbjctNm'] not in ['국어','영어','한국사','행정법총론','행정학개론']:continue
 d=s.post(base+'EvmArChcPrblmCransSbjctInqSbjctTblLst.do',data={'testCd':'08','sbjctCd':sub['sbjctCd'],'testCycl':sub['testCycl'],'hdn_curr_page':1},timeout=40).json()
 (r/f"api-{sub['sbjctNm']}.json").write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf8')
 for exam in d['list']:
  if str(exam['enfcYr']) not in ['2024','2025']:continue
  print(json.dumps(exam,ensure_ascii=False))
  params={k:exam[k] for k in ['enfcYr','planCd','cransSeCd','bktpNm','sbjctCd','testCd']}
  key=s.get(base+'GosiJungdap.do',params=params,timeout=40)
  (r/f"official-key-{exam['enfcYr']}-{sub['sbjctNm']}.html").write_text(key.text,encoding='utf8')
  print(BeautifulSoup(key.text,'html.parser').get_text(' ',strip=True)[-1500:])
