import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {freshState,createRun,STORAGE_KEY} from '../src/model.ts';
const URL='http://127.0.0.1:4176';const UI='siyeon-exam.ui.v1';
const bank=JSON.parse(readFileSync('src/bank.json','utf8'));
const sizes=[[2038,1280],[1672,941],[1280,800],[1024,768],[844,390],[667,375],[915,364],[390,844],[360,800],[430,932],[768,1024],[1440,900]];
mkdirSync('reports/ui-v2',{recursive:true});
const browser=await chromium.launch({headless:true,channel:'msedge'});const results=[];const errors=[];
const click=(p,a)=>p.locator(`[data-action="${a}"]`).filter({visible:true}).first().click();
async function ready(p){await p.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>img.complete?Promise.resolve():new Promise(r=>{img.onload=r;img.onerror=r;})));});}
async function snap(p,name){await ready(p);await p.screenshot({path:`reports/ui-v2/${name}.png`,fullPage:true,animations:'disabled'});}
async function audit(p){return p.evaluate(()=>{
 const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}};
 const buttons=[...document.querySelectorAll('button')].filter(e=>e.getClientRects().length);
 const panel=document.querySelector('.question-panel'),char=document.querySelector('.play-grid>.character');
 const ratio=panel&&char&&!document.documentElement.classList.contains('portrait-phone')?Math.abs(panel.getBoundingClientRect().width-(panel.getBoundingClientRect().width+char.getBoundingClientRect().width)*.7):0;
 return {screen:document.body.dataset.screen,overflow:document.documentElement.scrollWidth>innerWidth,ratioError:ratio,nested:document.querySelectorAll('button button').length,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),buttons:buttons.map(b=>({action:b.dataset.action,role:b.dataset.role,name:b.getAttribute('aria-label')||b.textContent.trim(),disabled:b.disabled,bounds:rect(b)})),panel:panel?rect(panel):null,character:char?rect(char):null,landscape:document.documentElement.classList.contains('landscape-phone'),brandHidden:getComputedStyle(document.querySelector('.brand')).display==='none'};
 });}
try{
for(const [width,height] of sizes){
 const context=await browser.newContext({viewport:{width,height}});const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
 const fixture=freshState();fixture.settings.voice=false;fixture.settings.fastGuard=false;
 await p.addInitScript(({key,fixture})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(fixture));},{key:STORAGE_KEY,fixture});
 await p.goto(URL);await snap(p,`entry-${width}x${height}`);const checks=[await audit(p)];
 const original=await p.evaluate(k=>localStorage.getItem(k),STORAGE_KEY);
 await click(p,'home');await snap(p,`hub-${width}x${height}`);checks.push(await audit(p));
 await click(p,'subjects');await click(p,'page:1');assert.equal(await p.locator('.subjects>.menu-card').count(),1);assert.ok(await p.locator('.subjects>.menu-card').isDisabled());
 await click(p,'settings');await click(p,'back');assert.equal(await p.locator('.pager span').innerText(),'2 / 2');
 assert.equal(await p.evaluate(k=>localStorage.getItem(k),STORAGE_KEY),original,'Navigation must not mutate learning state');
 await snap(p,`subjects-last-${width}x${height}`);checks.push(await audit(p));await click(p,'page:0');await click(p,'subject:국어');await snap(p,`play-${width}x${height}`);checks.push(await audit(p));
 const identity=await p.locator('.play-grid').evaluate(el=>[el.dataset.runId,el.dataset.questionId]);
 await click(p,'answer:1');const selected=await p.locator('[data-action="answer:1"]').getAttribute('aria-pressed');assert.equal(selected,'true');
 await p.locator('[data-action="answer:2"]').dispatchEvent('click');let st=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),STORAGE_KEY);assert.equal(st.run.answers[identity[1]],1);assert.equal(st.attempts.length,1);
 await snap(p,`graded-${width}x${height}`);checks.push(await audit(p));
 await p.reload();await ready(p);assert.equal(await p.locator('.explanation').count(),1);assert.deepEqual(await p.locator('.play-grid').evaluate(el=>[el.dataset.runId,el.dataset.questionId]),identity);
 const session=await p.evaluate(()=>document.documentElement.dataset.audioSession||'');const dom=await p.locator('.play-grid').elementHandle();
 await p.setViewportSize({width:height,height:width});await p.evaluate(()=>new Promise(r=>requestAnimationFrame(r)));assert.equal(await dom.evaluate(el=>el.isConnected),true);assert.equal(await p.evaluate(()=>document.documentElement.dataset.audioSession||''),session);
 await p.setViewportSize({width,height});await click(p,'pause');const paused=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),STORAGE_KEY);await p.waitForTimeout(600);const afterPause=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),STORAGE_KEY);assert.deepEqual(afterPause.run.visibleMs,paused.run.visibleMs);await click(p,'back');
 assert.deepEqual(await p.locator('.play-grid').evaluate(el=>[el.dataset.runId,el.dataset.questionId]),identity);
 for(const c of checks){assert.equal(c.overflow,false,`${width}: ${c.screen} overflow`);assert.ok(c.ratioError<=1,`${width}: ratio ${c.ratioError}`);assert.equal(c.nested,0);assert.equal(c.broken.length,0);assert.ok(c.buttons.every(b=>b.name));assert.equal(c.landscape,width>height&&height<=600&&width<=1200);assert.equal(c.brandHidden,c.landscape);for(const b of c.buttons.filter(b=>b.action.startsWith('answer:')||b.role==='primary'))assert.ok(b.bounds.height>=((width<=700&&height>=width)||(width>height&&height<=600&&width<=1200)?64:80),`${width} ${b.action} ${b.bounds.height}`);}
 results.push({width,height,checks,restored:true,rotationPreservedDOM:true,pausePreserved:true,navigationReadOnly:true});await context.close();
}
// Rendering and image availability for all enabled questions in an independent fixture.
const context=await browser.newContext({viewport:{width:1024,height:768}});
await context.addInitScript(({key,ui})=>{const raw=sessionStorage.getItem('ui-test-fixture');if(raw){const fixture=JSON.parse(raw);localStorage.setItem(key,JSON.stringify(fixture));localStorage.setItem(ui,JSON.stringify({current:{screen:'play',page:0,scroll:0,panelScroll:0},stack:[],pages:{}}));sessionStorage.removeItem('ui-test-fixture');}},{key:STORAGE_KEY,ui:UI});
const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(URL);
const all=[];for(const q of bank.filter(q=>q.verified)){
 const s=freshState();s.settings.voice=false;s.settings.fastGuard=false;s.run=createRun(s,[q],'study');
 await p.evaluate(s=>sessionStorage.setItem('ui-test-fixture',JSON.stringify(s)),s);await p.reload();await ready(p);
 assert.equal(await p.locator('.answer-card').count(),4,q.id);assert.equal(await p.locator('.question-instruction').innerText().then(x=>!!x.trim()),true);const a=await audit(p);assert.equal(a.broken.length,0,q.id);assert.equal(a.overflow,false,q.id);all.push({id:q.id,kind:await p.locator('[data-presentation]').getAttribute('data-presentation'),ratioError:a.ratioError});
 if(['2024-0-7','2024-0-15','2024-1-9','2024-1-17','2025-1-4','2025-1-12','2025-1-13','2025-0-11'].includes(q.id))await snap(p,'question-'+q.id);
}
// Mock mechanics use a local verified-question fixture, not unlocked production menus.
const qs=bank.filter(q=>q.verified).slice(0,3),s=freshState();s.settings.voice=false;s.run=createRun(s,qs,'mock');
await p.evaluate(s=>sessionStorage.setItem('ui-test-fixture',JSON.stringify(s)),s);await p.reload();await click(p,'answer:1');await click(p,'answer:2');assert.equal(await p.locator('.explanation').count(),0);let m=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),STORAGE_KEY);assert.equal(m.run.answers[qs[0].id],2);assert.equal(m.attempts.length,0);
m.run.deadline=Date.now()+1200;await p.evaluate(m=>sessionStorage.setItem('ui-test-fixture',JSON.stringify(m)),m);await p.reload();await click(p,'pause');await p.waitForFunction(()=>document.body.dataset.screen==='result');m=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),STORAGE_KEY);assert.ok(m.run.finishedAt);assert.equal(m.attempts.length,3);await p.reload();const m2=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),STORAGE_KEY);assert.deepEqual(m2.attempts,m.attempts);assert.deepEqual(m2.character,m.character);
await context.close();assert.equal(errors.length,0);
writeFileSync('reports/ui-contract-audit.json',JSON.stringify({date:new Date().toISOString(),browser:'Edge headless / isolated contexts',sizes:results,questionRender:all,mock:{fixtureOnly:true,answerEdits:true,noGradeLeak:true,pauseDoesNotExtendDeadline:true,duplicateFinishBlocked:true},errors,physicalDevice:false},null,2));console.log(`PASS: ${results.length} viewports, ${all.length} question renders, storage/navigation/rotation/pause/mock contracts`);
}catch(e){writeFileSync('reports/ui-contract-audit-failure.json',JSON.stringify({results,errors,failure:String(e.stack)},null,2));throw e;}finally{await browser.close();}
