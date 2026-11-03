import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFileSync,readFileSync} from 'node:fs';
const base='http://127.0.0.1:4176/previews/mobile-ui/';
const browser=await chromium.launch({headless:true,channel:'msedge'});
const context=await browser.newContext({viewport:{width:844,height:390},serviceWorkers:'block'});
const page=await context.newPage(),errors=[],requests=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
await context.addInitScript(()=>{const sentinel='{"comparisonSentinel":true}';for(const key of ['siyeon-exam.v1','siyeon-exam.ui.v1','siyeon-exam.motion.v1']){const store=key.endsWith('motion.v1')?sessionStorage:localStorage;if(!store.getItem(key))store.setItem(key,sentinel);}});
for(const variant of ['a','b','c']){
  await page.goto(base+'player.html?variant='+variant+'&screen=entry');await page.evaluate(()=>document.fonts.ready);
  await page.locator('[data-action="start"]').click();await page.waitForFunction(()=>document.querySelector('.reader')?.dataset.ready==='true');
  await page.locator('.tabs [data-action="tab:answers"]').click();await page.waitForFunction(()=>document.querySelector('.reader')?.dataset.ready==='true');
  const answer=await page.evaluate(()=>window.DEMO_QUESTIONS[0].answer);
  let target=page.locator('[data-action="answer:'+answer+'"]');
  while(!await target.count())await page.locator('[data-action="page:1"]').filter({visible:true}).click();
  await target.click();await page.waitForFunction(()=>document.querySelector('#app').dataset.graded==='true');
  assert.equal(await page.locator('#app').getAttribute('data-tab'),'explanation');
  assert.deepEqual(await page.evaluate(()=>['siyeon-exam.v1','siyeon-exam.ui.v1'].map(k=>localStorage.getItem(k))),['{"comparisonSentinel":true}','{"comparisonSentinel":true}']);
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('siyeon-exam.motion.v1')),'{"comparisonSentinel":true}');
}
await page.goto(base+'index.html');await page.waitForFunction(()=>[...document.querySelectorAll('iframe')].every(f=>f.contentDocument?.querySelector('#app')?.dataset.screen==='entry'));
await page.locator('[data-screen="play"]').click();
for(const variant of ['a','b','c']){await page.locator('[data-variant="'+variant+'"]').click();await page.waitForFunction(v=>document.querySelector('[data-frame="'+v+'"]').contentDocument?.querySelector('.reader')?.dataset.ready==='true',variant);}
await page.locator('#reset-all').click();await page.waitForFunction(()=>[...document.querySelectorAll('iframe')].every(f=>f.contentDocument?.querySelector('#app')?.dataset.screen==='entry'));
assert.deepEqual(errors,[]);assert.equal(requests.some(u=>u.includes('/audio/')||u.endsWith('/sw.js')),false);
const external=requests.filter(u=>!u.startsWith('http://127.0.0.1:4176/'));assert.deepEqual(external,[]);
const offlineUnchanged=!readFileSync('dist/sw.js','utf8').includes('/previews/mobile-ui/');assert.equal(offlineUnchanged,true);
writeFileSync('previews/mobile-ui/reports/http-audit.json',JSON.stringify({base,variants:3,startGradeExplanation:true,shellSyncReset:true,learningStoragePreserved:true,motionStoragePreserved:true,noAudioOrServiceWorker:true,noExternalRequests:true,productionCacheExcludesComparison:offlineUnchanged,errors,physicalDevice:false},null,2));
await browser.close();console.log('PASS HTTP preview, parent messages, real-storage isolation, app cache exclusion');
