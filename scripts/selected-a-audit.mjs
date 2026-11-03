import {chromium} from '@playwright/test';
import {existsSync,mkdirSync,readFileSync,unlinkSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {freshState,createRun,STORAGE_KEY} from '../src/model.ts';

const url=process.env.AUDIT_URL||'http://127.0.0.1:4176';
const dir='reports/selected-a';
const bank=JSON.parse(readFileSync('src/bank.json','utf8'));
const questions=['2024-0-1','2024-0-17','2024-1-6','2024-0-12'].map(id=>bank.find(q=>q.id===id));
assert.ok(questions.every(q=>q?.verified),'The four comparison questions must remain verified.');
assert.equal(bank.filter(q=>q.verified).length,80);
assert.equal(bank.filter(q=>!q.verified).length,120);
const sizes=[[667,375],[844,390],[915,364],[1024,768]];
mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'msedge'});
const errors=[],checks=[],reference=[];
let activePage;
const click=(p,action)=>p.locator(`[data-action="${action}"]`).filter({visible:true}).first().click();
async function ready(p){
 await p.evaluate(()=>document.fonts.ready);
 if(await p.locator('.paged-reader').count())await p.waitForFunction(()=>[...document.querySelectorAll('.paged-reader')].every(e=>e.dataset.ready==='true'));
 await p.evaluate(()=>Promise.all([...document.images].map(i=>i.complete?Promise.resolve():new Promise(r=>{i.onload=r;i.onerror=r;}))));
 await p.waitForFunction(()=>!document.querySelector('.character-stage[data-loading="true"]'));
}
async function fixture(p,s,screen='entry'){
 await p.evaluate(f=>sessionStorage.setItem('selected-a-fixture',JSON.stringify(f)),{s,ui:{current:{screen,page:0,scroll:0,panelScroll:0},stack:[],pages:{},locations:{},reading:{},lessonTabs:{}}});
 await p.reload();await ready(p);
}
const saved=p=>p.evaluate(key=>JSON.parse(localStorage.getItem(key)),STORAGE_KEY);
async function findAction(p,action){
 const prev=p.locator('.paged-reader [data-turn="-1"]');
 while(await prev.count()&&!await prev.isDisabled())await prev.click();
 for(let n=0;n<160;n++){
  const item=p.locator(`[data-action="${action}"]`).filter({visible:true});if(await item.count())return item.first();
  const next=p.locator('.paged-reader [data-turn="1"]');if(!await next.count()||await next.isDisabled())break;await next.click();
 }
 throw Error('Action missing '+action);
}
async function bounds(p){
 const result=await p.evaluate(()=>{
  const visible=[...document.querySelectorAll('body *')].filter(e=>!e.closest('.page-probe')&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden');
  const important=visible.filter(e=>e.matches('button,input,.page-window,.hero-title,.entry-copy,.reader-controls,.dialogue,.cutin'));
  const r=e=>e.getBoundingClientRect();
  const panel=document.querySelector('.question-panel'),cast=document.querySelector('.play-grid>.character');
  return {screen:document.body.dataset.screen,
   // Noto's visible ink extends 4px below the title's line box in the approved
   // reference too. Only clipped title overflow is a defect; viewport edges are
   // still checked separately below.
   overflow:important.filter(e=>!(e.matches('.hero-title')&&getComputedStyle(e).overflow==='visible')&&(e.scrollHeight>e.clientHeight+2||e.scrollWidth>e.clientWidth+2)).map(e=>({tag:e.tagName,class:e.className,h:[e.scrollHeight,e.clientHeight],w:[e.scrollWidth,e.clientWidth]})),
   outside:important.filter(e=>r(e).bottom>innerHeight+1||r(e).right>innerWidth+1||r(e).left< -1||r(e).top< -1).map(e=>e.outerHTML.slice(0,120)),
   scroll:visible.filter(e=>['auto','scroll'].includes(getComputedStyle(e).overflowY)||['auto','scroll'].includes(getComputedStyle(e).overflowX)).map(e=>e.className),
   root:document.documentElement.scrollHeight>innerHeight||document.documentElement.scrollWidth>innerWidth,
   broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),
   nested:document.querySelectorAll('button button').length,
   ratioError:panel&&cast?Math.abs(r(panel).width-(r(panel).width+r(cast).width)*.7):null,
   body:document.querySelector('.page-window')?parseFloat(getComputedStyle(document.querySelector('.page-window')).fontSize):null,
   minimum:important.filter(e=>e.matches('.answer-card,.lesson-actions button,.entry-cta')&&r(e).height<(innerHeight<=600?72:88)-1).map(e=>e.outerHTML.slice(0,100)),
   controlMinimum:important.filter(e=>e.matches('.lesson-tabs button,.reader-controls .book-nav button')&&r(e).height<(innerHeight<=600?52:60)-1).map(e=>e.outerHTML.slice(0,100))};
 });
 for(const k of ['overflow','outside','scroll','broken','minimum','controlMinimum'])assert.deepEqual(result[k],[],`${result.screen} ${k}`);
 assert.equal(result.root,false);assert.equal(result.nested,0);
 if(result.screen==='play'){assert.ok(result.ratioError<=1,`70:30 ratio ${result.ratioError}`);assert.equal(result.body,p.viewportSize().height<=600?22:28);}
 return result;
}
async function entryGeometry(p,preview=false){return p.evaluate(preview=>{
 const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
 const copy=document.querySelector('.entry-copy'),art=document.querySelector(preview?'.entry-a>.stand':'.entry-art');
 const title=document.querySelector('.hero-title'),cta=document.querySelector(preview?'.entry-copy .primary':'.entry-cta');
 return {copy:rect(copy),art:rect(art),title:rect(title),button:rect(cta),titleFont:parseFloat(getComputedStyle(title).fontSize),buttonFont:parseFloat(getComputedStyle(cta).fontSize),ratioError:Math.abs(rect(copy).width-(rect(copy).width+rect(art).width)*.6),main:rect(document.querySelector('main'))};
 },preview);}
try{
 for(const [width,height] of sizes){
  const ctx=await browser.newContext({viewport:{width,height}});const p=await ctx.newPage();activePage=p;
  p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(key=>{const f=sessionStorage.getItem('selected-a-fixture');if(f){const {s,ui}=JSON.parse(f);localStorage.setItem(key,JSON.stringify(s));localStorage.setItem('siyeon-exam.ui.v1',JSON.stringify(ui));sessionStorage.removeItem('selected-a-fixture');}},STORAGE_KEY);
  await p.goto(url);await ready(p);
  const state=freshState();state.settings.fastGuard=false;state.run=createRun(state,questions,'study');
  await fixture(p,state);
  const geometry=await entryGeometry(p);assert.ok(geometry.ratioError<=1,`entry 60:40 ${geometry.ratioError}`);assert.equal(geometry.main.y,0);assert.equal(geometry.main.height,height);
  await bounds(p);await p.screenshot({path:`${dir}/entry-${width}x${height}.png`});
  const ref=await ctx.newPage();await ref.goto(url+'/previews/mobile-ui/player.html?variant=a&screen=entry&question=2024-0-1');await ref.evaluate(()=>document.fonts.ready);
  const original=await entryGeometry(ref,true);reference.push({width,height,reference:original,applied:geometry});await ref.close();
  const before=await saved(p);await click(p,'home');await ready(p);assert.equal(await p.locator('body').getAttribute('data-screen'),'home');assert.deepEqual((await saved(p)).run,before.run);
  await click(p,'settings');await ready(p);assert.equal(await p.locator('body').getAttribute('data-screen'),'settings');assert.deepEqual((await saved(p)).run,before.run);
  await click(p,'back');await ready(p);assert.equal(await p.locator('body').getAttribute('data-screen'),'home');assert.deepEqual((await saved(p)).run,before.run);
  checks.push({width,height,entry:true,referenceGeometry:true,navigationPreservesRun:true});
  for(const question of questions){
   const s=freshState();s.settings.fastGuard=false;s.run=createRun(s,[question,questions.find(q=>q.id!==question.id)],'study');await fixture(p,s,'play');
   await bounds(p);await p.screenshot({path:`${dir}/play-${question.id}-${width}x${height}.png`});
   const runId=(await saved(p)).run.id;await click(p,'tab:answers');await ready(p);await (await findAction(p,'answer:'+question.answer)).click();await ready(p);
   let after=await saved(p);assert.equal(after.run.id,runId);assert.equal(after.run.answers[question.id],question.answer);assert.equal(after.run.graded[question.id],true);assert.equal(after.attempts.length,1);
   assert.equal(await p.locator('[data-action="tab:explanation"]').getAttribute('aria-pressed'),'true');await bounds(p);
   await click(p,'tab:answers');await ready(p);assert.ok(await p.locator('.answer-card').first().isDisabled());
   await p.reload();await ready(p);assert.equal((await saved(p)).run.id,runId);assert.deepEqual((await saved(p)).run.answers,after.run.answers);assert.equal((await saved(p)).attempts.length,1);
   await p.setViewportSize({width:390,height:844});await p.waitForSelector('.rotation-guide:not([hidden])');assert.equal(await p.locator('#app').evaluate(e=>e.inert),true);assert.equal((await saved(p)).run.id,runId);
   await p.setViewportSize({width,height});await ready(p);assert.equal((await saved(p)).run.id,runId);assert.deepEqual((await saved(p)).run.answers,after.run.answers);
   await fixture(p,s,'play');await click(p,'tab:answers');await ready(p);const wrong=question.answer%4+1;await (await findAction(p,'answer:'+wrong)).click();await ready(p);
   after=await saved(p);assert.equal(after.run.answers[question.id],wrong);assert.equal(after.wrong[question.id].active,true);assert.equal(after.run.wrongStreak,1);assert.equal(after.attempts.length,1);await bounds(p);
   if(question.id===questions[0].id)await p.screenshot({path:`${dir}/wrong-${width}x${height}.png`});
   checks.push({width,height,question:question.id,correct:true,wrong:true,answerLock:true,saveRestore:true,rotationPreservesRun:true});
  }
  await ctx.close();console.log('PASS A selection',width,height);
 }
 const portrait=await browser.newContext({viewport:{width:390,height:844}});const p=await portrait.newPage();activePage=p;await p.goto(url);await p.waitForSelector('.rotation-guide:not([hidden])');assert.equal(await p.locator('#app').evaluate(e=>e.inert),true);await p.screenshot({path:`${dir}/rotation-390x844.png`});await portrait.close();
 assert.deepEqual(errors,[]);writeFileSync(`${dir}/audit.json`,JSON.stringify({checkedAt:new Date().toISOString(),sizes,checks,reference,errors,verifiedQuestions:80,lockedQuestions:120,physicalDevice:false},null,2));
 for(const file of [`${dir}/failure.json`,`${dir}/failure.png`])if(existsSync(file))unlinkSync(file);
 console.log('PASS selected A geometry, navigation, answer grading and preservation');
}catch(error){
 writeFileSync(`${dir}/failure.json`,JSON.stringify({error:error.stack,checks,reference,errors},null,2));
 if(activePage&&!activePage.isClosed())await activePage.screenshot({path:`${dir}/failure.png`}).catch(()=>{});
 throw error;
}finally{await browser.close();}
