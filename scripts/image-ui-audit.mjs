import {chromium} from '@playwright/test';
import {existsSync,mkdirSync,readFileSync,unlinkSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {freshState,createRun,STORAGE_KEY} from '../src/model.ts';

const url=process.env.AUDIT_URL||'http://127.0.0.1:4176',dir='reports/image-ui',homeOnly=process.env.IMAGE_UI_HOME_ONLY==='1';
const bank=JSON.parse(readFileSync('src/bank.json','utf8'));
const qs=['2024-0-1','2024-0-17','2024-1-6','2024-0-12'].map(id=>bank.find(q=>q.id===id));
assert.equal(bank.filter(q=>q.verified).length,80);assert.equal(bank.filter(q=>!q.verified).length,120);
const sizes=[[667,375],[844,390],[915,364],[1024,768]],errors=[],checks=[],skins=[],requests=[];
mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'msedge'});let activePage;
const click=(p,a)=>p.locator(`[data-action="${a}"]`).filter({visible:true}).first().click();
const saved=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),STORAGE_KEY);
async function ready(p){
 await p.evaluate(()=>document.fonts.ready);
 if(await p.locator('.paged-reader').count())await p.waitForFunction(()=>[...document.querySelectorAll('.paged-reader')].every(e=>e.dataset.ready==='true'));
 await p.waitForFunction(()=>!document.querySelector('.character-stage[data-loading="true"]'));
 await p.evaluate(()=>Promise.all([...document.images].map(i=>i.complete?Promise.resolve():new Promise(r=>{i.onload=r;i.onerror=r;}))));
}
async function load(p,s,screen='play'){
 await p.evaluate(f=>sessionStorage.setItem('image-ui-fixture',JSON.stringify(f)),{s,ui:{current:{screen,page:0,scroll:0,panelScroll:0},stack:[],pages:{},locations:{},reading:{},lessonTabs:{}}});
 await p.reload();await ready(p);
}
async function findAction(p,a){
 const prev=p.locator('.paged-reader [data-turn="-1"]');while(await prev.count()&&!await prev.isDisabled())await prev.click();
 for(let n=0;n<180;n++){const item=p.locator(`[data-action="${a}"]`).filter({visible:true});if(await item.count())return item.first();const next=p.locator('.paged-reader [data-turn="1"]');if(!await next.count()||await next.isDisabled())break;await next.click();}throw Error('Missing '+a);
}
async function bounds(p){
 const b=await p.evaluate(()=>{
  const visible=[...document.querySelectorAll('body *')].filter(e=>!e.closest('.page-probe')&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden');
  const important=visible.filter(e=>e.matches('button,input,.page-window,.entry-copy,.hero-title,.reader-controls,.dialogue,.cutin'));
  const rect=e=>e.getBoundingClientRect(),panel=document.querySelector('.question-panel'),cast=document.querySelector('.play-grid>.character');
  return {screen:document.body.dataset.screen,
   // The approved title's visible Noto ink exceeds the line box; it is not clipped.
   overflow:important.filter(e=>!(e.matches('.hero-title')&&getComputedStyle(e).overflow==='visible')&&(e.scrollHeight>e.clientHeight+2||e.scrollWidth>e.clientWidth+2)).map(e=>({class:e.className,h:[e.scrollHeight,e.clientHeight],w:[e.scrollWidth,e.clientWidth]})),
   outside:important.filter(e=>rect(e).top< -1||rect(e).left< -1||rect(e).bottom>innerHeight+1||rect(e).right>innerWidth+1).map(e=>e.outerHTML.slice(0,130)),
   scroll:visible.filter(e=>['auto','scroll'].includes(getComputedStyle(e).overflowX)||['auto','scroll'].includes(getComputedStyle(e).overflowY)).map(e=>e.className),
   broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),nested:document.querySelectorAll('button button').length,
   root:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight,
   minimum:important.filter(e=>e.matches('.entry-cta,.answer-card,.lesson-actions button')&&rect(e).height<(innerHeight<=600?72:88)-1).map(e=>e.className),
   controlMinimum:important.filter(e=>e.matches('.lesson-tabs button,.book-nav button')&&rect(e).height<(innerHeight<=600?52:60)-1).map(e=>e.className),
   ratio:panel&&cast?Math.abs(rect(panel).width-(rect(panel).width+rect(cast).width)*.7):0,
   font:document.querySelector('.page-window')?parseFloat(getComputedStyle(document.querySelector('.page-window')).fontSize):null};
 });
 for(const k of ['overflow','outside','scroll','broken','minimum','controlMinimum'])assert.deepEqual(b[k],[],b.screen+' '+k);
 assert.equal(b.root,false);assert.equal(b.nested,0);assert.ok(b.ratio<=1);
 if(b.screen==='play')assert.equal(b.font,p.viewportSize().height<=600?22:28);return b;
}
async function skin(p,selector,asset){
 const loc=p.locator(selector).filter({visible:true}).first();assert.ok(await loc.count(),'Skin target '+selector);
 const detail=await loc.evaluate(e=>{const s=getComputedStyle(e),b=getComputedStyle(e,'::before'),a=getComputedStyle(e,'::after');return {normal:s.backgroundImage+' '+s.borderImageSource,before:b.backgroundImage+' '+b.borderImageSource,after:a.backgroundImage+' '+a.borderImageSource,beforeDisplay:b.display,beforeContent:b.content,beforePointer:b.pointerEvents};});
 assert.ok([detail.normal,detail.before,detail.after].some(x=>x.includes('/ui-v6/'+asset+'.webp')),`${selector}: ${JSON.stringify(detail)}`);
 skins.push({width:p.viewportSize().width,screen:await p.locator('body').getAttribute('data-screen'),selector,asset,...detail});
}
async function allPages(p){
 await ready(p);const host=p.locator('.paged-reader');if(!await host.count()){await bounds(p);return 0;}
 const prev=host.locator('[data-turn="-1"]');while(!await prev.isDisabled())await prev.click();
 const sources=await host.evaluate(e=>[...e.querySelector('template').content.children].map(x=>({text:(x.querySelector('.answer-text')||x).textContent,image:x.querySelector('img')?.getAttribute('src')})));
 const found=new Map();let pages=0;
 do{await bounds(p);const pieces=await host.locator('.page-window').evaluate(e=>[...e.children].map(x=>({block:+x.dataset.sourceBlock,start:+x.dataset.sourceStart,text:(x.querySelector('.answer-text')||x).textContent,image:x.querySelector('img')?.getAttribute('src')})));for(const piece of pieces){if(!found.has(piece.block))found.set(piece.block,[]);found.get(piece.block).push(piece);}pages++;const next=host.locator('[data-turn="1"]');if(await next.isDisabled())break;await next.click();assert.ok(pages<180);}while(true);
 sources.forEach((source,i)=>{const pieces=found.get(i)||[];assert.ok(pieces.length,'Missing block '+i);if(source.image)assert.equal(pieces[0].image,source.image);else assert.equal(pieces.sort((a,b)=>a.start-b.start).map(x=>x.text).join(''),source.text,'Content '+i);});return pages;
}
try{
 for(const [width,height] of sizes){
  const c=await browser.newContext({viewport:{width,height},serviceWorkers:'block'}),p=await c.newPage();activePage=p;
  p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.url().includes('/ui-v6/'))requests.push({url:r.url(),status:r.status()});});
  p.on('requestfailed',r=>{if(r.url().includes('/ui-v6/'))errors.push('Asset failed: '+r.url());});
  await p.addInitScript(k=>{const f=sessionStorage.getItem('image-ui-fixture');if(f){const {s,ui}=JSON.parse(f);localStorage.setItem(k,JSON.stringify(s));localStorage.setItem('siyeon-exam.ui.v1',JSON.stringify(ui));sessionStorage.removeItem('image-ui-fixture');}},STORAGE_KEY);
  await p.goto(url);await ready(p);
  const s=freshState();s.settings.fastGuard=false;s.settings.reducedMotion=true;s.run=createRun(s,qs,'study');
  for(const screen of (homeOnly?['home']:['entry','home','subjects','settings'])){
   await load(p,s,screen);await bounds(p);
   if(screen==='entry')await skin(p,'.entry-cta','primary-button');
   if(screen==='home')await skin(p,'.menu-card','paper-panel');
   if(screen==='settings')await skin(p,'.managed','paper-panel');
   if(homeOnly||width===844||screen==='entry'&&width!==915)await p.screenshot({path:`${dir}/${screen}-${width}x${height}.png`});
   const pages=screen==='settings'?await allPages(p):0;assert.deepEqual((await saved(p)).run,JSON.parse(JSON.stringify(s.run)));checks.push({width,height,screen,pages,runPreserved:true});
  }
  for(const q of (homeOnly?[]:qs)){
   const fresh=freshState();fresh.settings.fastGuard=false;fresh.run=createRun(fresh,[q,qs.find(x=>x.id!==q.id)],'study');await load(p,fresh);
   await skin(p,'.question-panel','paper-panel');await skin(p,'.dialogue','dialogue-panel');await skin(p,'.lesson-tabs button[aria-pressed=false]:not(:disabled)','secondary-button');
   const active=p.locator('.lesson-tabs button[aria-pressed=true]');assert.ok(await active.isEnabled());await skin(p,'.lesson-tabs button[aria-pressed=true]','dialogue-panel');
   if(q.id===qs[0].id||width===844)await p.screenshot({path:`${dir}/play-${q.id}-${width}x${height}.png`});
   let pages=await allPages(p);await click(p,'tab:answers');await ready(p);await skin(p,'.answer-card','secondary-button');
   if(q.id===qs[0].id&&width===844)await p.screenshot({path:`${dir}/answers-${width}x${height}.png`});
   pages+=await allPages(p);await (await findAction(p,'answer:'+q.answer)).click();await ready(p);assert.equal((await saved(p)).attempts.length,1);assert.equal(await p.locator('[data-action="tab:explanation"]').getAttribute('aria-pressed'),'true');
   pages+=await allPages(p);await click(p,'tab:answers');await ready(p);await (await findAction(p,'answer:'+q.answer)).evaluate(e=>{if(!e.disabled)throw Error('Answer not locked');if(!e.textContent.includes('정답'))throw Error('Missing correct label');});
   const before=await saved(p);await p.reload();await ready(p);assert.deepEqual((await saved(p)).run.answers,before.run.answers);assert.deepEqual((await saved(p)).character,before.character);
   await load(p,fresh);await click(p,'tab:answers');await ready(p);const incorrect=q.answer%4+1;await (await findAction(p,'answer:'+incorrect)).click();await ready(p);await bounds(p);assert.equal((await saved(p)).wrong[q.id].active,true);
   await skin(p,'.cutin','dialogue-panel');
   if(q.id===qs[0].id)await p.screenshot({path:`${dir}/feedback-${width}x${height}.png`});
   await click(p,'tab:answers');await ready(p);await (await findAction(p,'answer:'+incorrect)).evaluate(e=>{if(!e.disabled||!e.textContent.includes('내 답'))throw Error('Wrong state not labelled and locked');});
   checks.push({width,height,question:q.id,pages,correct:true,wrong:true,disabled:true,restore:true});
  }
  await c.close();console.log('PASS image UI',width,height);
 }
 const c=await browser.newContext({viewport:{width:390,height:844}}),p=await c.newPage();activePage=p;await p.goto(url);await p.waitForSelector('.rotation-guide:not([hidden])');assert.ok(await p.locator('#app').evaluate(e=>e.inert));await p.screenshot({path:dir+'/rotation-390x844.png'});await c.close();
 for(const asset of (homeOnly?['paper-panel']:['primary-button','secondary-button','paper-panel','dialogue-panel']))assert.ok(requests.some(r=>r.url.endsWith('/'+asset+'.webp')&&r.status===200),asset+' loaded');
 assert.deepEqual(errors,[]);assert.ok(requests.every(r=>r.status<400));writeFileSync(dir+(homeOnly?'/home-audit.json':'/audit.json'),JSON.stringify({checkedAt:new Date().toISOString(),sizes,checks,skins,requests,errors,physicalDevice:false},null,2));
 for(const file of ['failure.json','failure.png'])if(existsSync(dir+'/'+file))unlinkSync(dir+'/'+file);
}catch(e){writeFileSync(dir+'/failure.json',JSON.stringify({error:e.stack,checks,skins,requests,errors},null,2));if(activePage&&!activePage.isClosed())await activePage.screenshot({path:dir+'/failure.png'}).catch(()=>{});throw e;}finally{await browser.close();}
