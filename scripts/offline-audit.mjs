import {chromium} from '@playwright/test';import assert from 'node:assert/strict';import {writeFileSync} from 'node:fs';
const b=await chromium.launch({headless:true,channel:'msedge'});const c=await b.newContext();const p=await c.newPage();p.on('pageerror',e=>console.log('PAGE',e.message));p.on('console',e=>console.log('CONSOLE',e.text()));p.on('requestfailed',r=>console.log('FAIL',r.url(),r.failure()));
await p.goto('http://127.0.0.1:4180');await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
await p.locator('[data-action="home"]').click();await p.locator('[data-action="subjects"]').click();await p.locator('[data-action="subject:영어"]').click();await p.locator('[data-action="answer:2"]').click();
await c.setOffline(true);await p.reload();await p.screenshot({path:'reports/screens/offline.png',fullPage:true});assert.equal(await p.locator('.explanation').count(),1);
const assets=await p.evaluate(async()=>{const urls=['/characters/runtime/english-blush.webp','/exams/2024-1.pdf','/exams/material-2025-1-4-0.webp'];return Promise.all(urls.map(async url=>({url,ok:(await fetch(url)).ok})));});assert.ok(assets.every(a=>a.ok));
const cachedVoice=await p.evaluate(async()=>{const keys=await caches.keys();const urls=(await Promise.all(keys.map(async k=>(await (await caches.open(k)).keys()).map(r=>r.url)))).flat();return urls.filter(u=>u.includes('/audio/')||u.includes('voice-review'));});assert.deepEqual(cachedVoice,[]);
writeFileSync('reports/offline-audit.json',JSON.stringify({browser:'Edge desktop headless',reload:true,answerRestoration:true,assets,voiceExcluded:true,physicalDevice:false},null,2));await b.close();console.log('Offline reload, restored answer, character, original PDF and voice exclusion passed');


