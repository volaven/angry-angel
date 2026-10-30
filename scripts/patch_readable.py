from pathlib import Path
p=Path('src/main.ts');s=p.read_text(encoding='utf8')
start=s.index('<div class="question-source">');end=s.index('<div class="answers"',start)
s=s[:start]+'''<div class="question-copy">${escape((q as ExamQuestion & {fullText?:string}).fullText||q.stem)}</div><details ${(q as ExamQuestion & {hasFigures?:boolean}).hasFigures?'open':''}><summary>원문 그림·표·밑줄 확인하기</summary><div class="question-source">${q.images.map((src,i)=>`<a href="${src}" target="_blank" rel="noopener" aria-label="원문 확대"><img src="${src}" alt="${escape(i===0?q.stem:'이어지는 원문')}"></a>`).join('')}</div><small>원문을 누르면 크게 볼 수 있습니다.</small></details>'''+s[end:]
p.write_text(s,encoding='utf8')
p=Path('src/style.css');s=p.read_text(encoding='utf8');s+='\n.question-copy{white-space:pre-wrap;font-size:18px;line-height:1.9;overflow-wrap:anywhere}.question-source a{display:block}\n';p.write_text(s,encoding='utf8')
