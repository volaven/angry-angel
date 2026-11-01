import type {ExamQuestion,StudyRun} from './model';
import {presentation,blockHTML,optionHTML} from './presentation';
import {escapeHTML as esc,renderButton as button} from './ui-contract';
import {deck,imageBlock} from './paged-reader';
export type LessonTab='passage'|'answers'|'explanation'|'source'|'map';
export function lessonView(q:ExamQuestion,r:StudyRun,tab:LessonTab,character:string){
 const p=presentation(q),graded=r.mode!=='mock'&&!!r.graded[q.id],chosen=r.answers[q.id],locked=r.lockedUntil>Date.now();
 if(tab==='explanation'&&!graded)tab='passage';
 let content='';
 if(tab==='passage'){
  content=`<h1 class="question-instruction">${esc(p.instruction)}</h1>`+p.blocks.map(b=>b.kind==='source'?imageBlock(b.src!):blockHTML({...p,blocks:[b]})).join('')+(p.note?`<p class="marked-note">${esc(p.note)}</p>`:'');
 }else if(tab==='answers'){
  content=p.options.map((_,i)=>button(`<span class="answer-number">${i+1}</span><span class="answer-text">${optionHTML(p,i)}</span><span class="answer-state">${graded?(q.answer===i+1?'✓ 정답':chosen===i+1?'× 내 답':''):chosen===i+1?'선택됨':''}</span>`,'answer:'+(i+1),`answer-card ${chosen===i+1?'selected ':''}${graded&&q.answer===i+1?'right ':''}${graded&&chosen===i+1&&q.answer!==chosen?'wrong':''}`,`${graded||locked?'disabled':''} aria-pressed="${chosen===i+1}"`)).join('');
 }else if(tab==='explanation'){
  content=`<h2>${chosen===q.answer?'정답입니다.':'다시 확인해 보세요.'} 정답 ${q.answer}번</h2><p>${esc(q.explanation)}</p>`+q.distractors.map((d,i)=>`<p><b>${i+1}번</b> ${esc(d)}</p>`).join('')+(q.lawNote?`<p>${esc(q.lawNote)}</p>`:'')+`<a href="${q.answerSource}" target="_blank" rel="noopener">최종정답 원문 ↗</a>`;
 }else if(tab==='source'){
  content=q.images.map(src=>imageBlock(src,`${q.subject} ${q.year} ${q.number}번 원문`)).join('')+`<a href="${q.source}#page=${q.sourcePage}" target="_blank" rel="noopener">원본 문제지 ${q.sourcePage}쪽 ↗</a>`;
 }else{content=r.ids.map((id,i)=>button(`${i+1}번 · ${r.answers[id]?'응답함':'미응답'}`,'goto:'+i,'map-item',`aria-current="${i===r.index?'true':'false'}"`)).join('');}
 const tabs:[LessonTab,string,boolean][]=[['passage','지문',false],['answers','답안',false],['explanation','해설',!graded],['source','자료',false]];
 if(r.mode==='mock')tabs.push(['map','문항',false]);
 return `<div class="play-header"><span>${q.subject} · ${q.year} · ${q.number}번</span><b>${r.index+1} / ${r.ids.length}</b>${r.deadline?'<strong id="clock" aria-label="시험 남은 시간"></strong>':''}</div><div class="play-grid" data-layout="exam-70-30" data-run-id="${r.id}" data-question-id="${q.id}"><section class="question-panel" aria-label="문제와 답안"><nav class="lesson-tabs" aria-label="문제 내용">${tabs.map(([id,label,disabled])=>button(label,'tab:'+id,'',`aria-pressed="${tab===id}" ${disabled?'disabled':''}`)).join('')}</nav>${locked?'<div class="lock-notice" role="status">읽기 시간 <b id="locktime">3</b>초 · 성적은 깎이지 않습니다.</div>':''}${deck(content,`${r.id}/${q.id}/${tab}`)}<footer class="lesson-actions">${r.mode==='mock'?button('이전 문제','prev','',r.index===0?'disabled':'')+button('다음 문제','mocknext','',r.index===r.ids.length-1?'disabled':'')+button('제출','submit','primary'):graded?button(r.index===r.ids.length-1?'학습 결과 보기 →':'다음 문제 →','next','primary'):tab==='passage'?button('답안 보기 →','tab:answers','primary'):button('지문 다시 보기','tab:passage','plain')}</footer></section>${character}</div>`;
}
