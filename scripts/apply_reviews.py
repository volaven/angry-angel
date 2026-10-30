import json,pathlib
r=pathlib.Path(__file__).resolve().parents[1]
b=json.loads((r/'src/bank.json').read_text(encoding='utf8'));notes=json.loads((r/'sources/explanations.json').read_text(encoding='utf8'))
for q in b:
 if q['id'] in notes:q.update(notes[q['id']]);q['explanationStatus']='reviewed';q['verified']=True
(r/'src/bank.json').write_text(json.dumps(b,ensure_ascii=False,indent=2),encoding='utf8')
(r/'reports/content-status.json').write_text(json.dumps({'total':len(b),'playable':sum(q['verified'] for q in b),'withheld':[q['id'] for q in b if not q['verified']]},ensure_ascii=False,indent=2),encoding='utf8')
