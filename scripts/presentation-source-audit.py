"""Read-only source evidence check. Text identity is not a claim of human editorial approval."""
from pathlib import Path
import json,re,hashlib
import pymupdf as fitz
R=Path(__file__).resolve().parents[1]
bank=json.loads((R/'src/bank.json').read_text(encoding='utf8'));p=json.loads((R/'src/question-presentations.json').read_text(encoding='utf8'))
norm=lambda x:re.sub(r'\s+','',x)
docs={};results=[]
for q in bank:
 if not q['verified']:continue
 file=R/'public'/q['source'].lstrip('/')
 if str(file) not in docs:
  doc=fitz.open(file);docs[str(file)]=norm(''.join(page.get_text() for page in doc))
 original=docs[str(file)];lines=[s.strip() for s in (q['stem']+'\n'+'\n'.join(q['choices'])).splitlines() if s.strip()]
 unmatched=[s for s in lines if norm(s) not in original]
 results.append({'id':q['id'],'source':q['source'],'sourceSHA256':hashlib.sha256(file.read_bytes()).hexdigest(),'lineCount':len(lines),'unmatched':unmatched,'presentation':p[q['id']]['kind'],'answer':q['answer'],'sourceImageAvailable':all((R/'public'/x.lstrip('/')).exists() for x in q['images'])})
report={'questions':len(results),'lines':sum(r['lineCount'] for r in results),'unmatched':sum(len(r['unmatched']) for r in results),'records':results,'scope':'Existing enabled question text lines vs local source PDF text. Rendering, semantic correctness and editorial review are separate checks.'}
(R/'reports/presentation-source-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print('Source text:',report['questions'],'questions,',report['lines'],'lines,',report['unmatched'],'unmatched')
