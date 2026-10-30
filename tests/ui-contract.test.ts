import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {SCREENS,isLandscapePhone} from '../src/ui-contract';
import {loadNavigation,navigate,goBack} from '../src/navigation';
import {answerInput} from '../src/activity-input';
import {freshState,createRun,answerQuestion,type ExamQuestion} from '../src/model';
import raw from '../src/bank.json';
import records from '../src/question-presentations.json';
const bank=raw as ExamQuestion[];
test('explicit screen contracts and exact landscape thresholds',()=>{
 assert.equal(Object.keys(SCREENS).length,13);assert.equal(SCREENS.play.layout,'exam-70-30');
 assert.ok(isLandscapePhone(667,375));assert.ok(isLandscapePhone(1200,600));assert.ok(!isLandscapePhone(1201,600));assert.ok(!isLandscapePhone(600,600));assert.ok(!isLandscapePhone(1440,390));
});
test('navigation preserves page and scroll without creating an assessment',()=>{
 const n=loadNavigation(null);navigate(n,'home');navigate(n,'subjects');n.current.page=1;n.current.scroll=200;n.current.panelScroll=42;navigate(n,'settings');goBack(n);
 assert.equal(n.current.screen,'subjects');assert.equal(n.current.page,1);assert.equal(n.current.scroll,200);assert.equal(n.current.panelScroll,42);
 assert.deepEqual(loadNavigation(JSON.stringify(n)),n);assert.equal(loadNavigation('bad').current.screen,'entry');
});
test('pure input blocks repeat answers, pause and wrong active question; mocks remain editable',()=>{
 const state=freshState();const qs=bank.filter(q=>q.verified).slice(0,2);state.run=createRun(state,qs,'study');const before=JSON.stringify(state);
 assert.equal(answerInput(state.run,qs[0],1,Date.now()).kind,'selection');assert.equal(JSON.stringify(state),before);
 assert.equal(answerInput(state.run,qs[1],1,Date.now()).kind,'blocked');assert.equal(answerInput(state.run,qs[0],1,Date.now(),true).kind,'blocked');
 answerQuestion(state,qs[0],1);assert.equal(answerInput(state.run,qs[0],2,Date.now()).kind,'blocked');
 state.run=createRun(state,qs,'mock');answerQuestion(state,qs[0],1);assert.equal(answerInput(state.run,qs[0],2,Date.now()).kind,'selection');
});
test('all 80 enabled questions have four display answers and resolvable source materials',()=>{
 assert.equal(Object.keys(records).length,80);assert.equal(bank.filter(q=>q.verified).length,80);
 for(const q of bank.filter(q=>q.verified)){
  const p=(records as Record<string,any>)[q.id];assert.ok(p.instruction.trim());assert.equal(p.options.length,4);assert.ok(p.options.every((x:string)=>x.trim()));
  for(const b of p.blocks)if(b.src)assert.ok(existsSync('public'+b.src),b.src);
 }
});
test('inline grammar uses exact underlined fragments, placement keeps the complete passage',()=>{
 assert.deepEqual(records['2025-1-12'].options,['customized','features','laughter','including']);
 assert.deepEqual(records['2024-1-6'].options,['Despite','those','compared','their']);
 for(const id of ['2024-1-17','2025-1-16']){const p=(records as any)[id];const text=p.blocks.map((b:any)=>b.text).join(' ');for(const c of '①②③④')assert.ok(text.includes(c));}
});
test('bank byte content and original portraits are preserved',()=>{
 assert.deepEqual(JSON.parse(readFileSync('reports/ui-refactor-baseline/bank.json','utf8')),raw);
 const manifest=JSON.parse(readFileSync('assets/character-manifest.json','utf8'));assert.equal(manifest.length,12);
 for(const a of manifest){assert.ok(existsSync(a.file));assert.ok(existsSync('public'+a.runtime));assert.equal(a.silhouette.threshold,32);assert.ok(a.sourcePreserved);}
});

