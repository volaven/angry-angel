import type {ExamQuestion,StudyRun} from './model';
export type AnswerInput={kind:'blocked'}|{kind:'selection';choice:number;correct:boolean;policy:'immediate'|'submit'};
/** Pure input validation; persistence, rewards and presentation belong to the caller. */
export function answerInput(run:StudyRun|undefined,q:ExamQuestion,choice:number,now:number,paused=false):AnswerInput {
 if(paused||!run||run.finishedAt||run.ids[run.index]!==q.id||run.lockedUntil>now||!Number.isInteger(choice)||choice<1||choice>4||(run.mode!=='mock'&&run.graded[q.id]))return {kind:'blocked'};
 return {kind:'selection',choice,correct:choice===q.answer,policy:run.mode==='mock'?'submit':'immediate'};
}
