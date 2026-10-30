import type {ExamQuestion} from './model';
import {escapeHTML} from './ui-contract';
import records from './question-presentations.json';
export interface QuestionPresentation {kind:'choice'|'inline-marked'|'material';instruction:string;blocks:{kind:'paragraph'|'preserved'|'source';text?:string;src?:string}[];options:string[];marks?:string[];emphasis?:string[];optionMarks?:string[];note?:string;sourceStatus:string}
export function optionHTML(p:QuestionPresentation,index:number){let text=escapeHTML(p.options[index]);const mark=p.optionMarks?.[index];if(mark)text=text.replace(escapeHTML(mark),`<u>${escapeHTML(mark)}</u>`);return text;}
export function presentation(q:ExamQuestion):QuestionPresentation {return q.presentation||(records as Record<string,QuestionPresentation>)[q.id]||{kind:'material',instruction:'원문을 확인하고 답을 선택하세요.',blocks:q.images.map(src=>({kind:'source',src})),options:q.choices,sourceStatus:'original-fallback'};}
export function blockHTML(p:QuestionPresentation){return p.blocks.map(b=>{
 if(b.kind==='source')return `<figure class="material"><a href="${escapeHTML(b.src)}" target="_blank" rel="noopener" aria-label="문제 자료 원본 확대"><img src="${escapeHTML(b.src)}" alt="문제 풀이에 필요한 원문 자료"></a><figcaption>자료를 누르면 원래 크기로 볼 수 있습니다.</figcaption></figure>`;
 let text=escapeHTML(b.text);for(const [i,mark] of (p.marks||[]).entries()){const key='①②③④'[i]+escapeHTML(mark);text=text.replace(key,`<span class="inline-mark"><b>${'①②③④'[i]}</b><u>${escapeHTML(mark)}</u></span>`);}
 for(const mark of p.emphasis||[])text=text.replace(escapeHTML(mark),`<u>${escapeHTML(mark)}</u>`);
 return `<${b.kind==='preserved'?'pre':'p'} class="passage-block">${text}</${b.kind==='preserved'?'pre':'p'}>`;
 }).join('');}
