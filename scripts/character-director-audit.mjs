import {chromium} from '@playwright/test';import assert from 'node:assert/strict';import {readFileSync,writeFileSync} from 'node:fs';
import {freshState,createRun} from '../src/model.ts';
const bank=JSON.parse(readFileSync('src/bank.json','utf8')).filter(q=>q.verified),browser=await chromium.launch({headless:true,channel:'msedge'}),ctx=await browser.newContext({serviceWorkers: 'block',viewport:{width:1024,height:768}}),p=await ctx.newPage();
const s=freshState();s.settings.fastGuard=false;s.run=createRun(s,bank.slice(0,4),'study');
await p.addInitScript(s=>{if(!localStorage.getItem('siyeon-exam.v1')){localStorage.setItem('siyeon-exam.v1',JSON.stringify(s));localStorage.setItem('siyeon-exam.ui.v1',JSON.stringify({current:{screen:'play'},stack:[],pages:{}}));}},s);
await p.goto(process.env.AUDIT_URL||'http://127.0.0.1:4176');await p.waitForSelector('.character-stage[data-rig=ready]');await p.waitForTimeout(650);
await p.evaluate(()=>{window.savedStage=document.querySelector('.character-stage');window.events=window.savedStage.dataset.events;});
for(let n=0;n<20;n++){await p.locator('[data-action="tab:answers"]').first().click();await p.locator('[data-action="tab:passage"]').first().click();}
assert.equal(await p.evaluate(()=>window.savedStage===document.querySelector('.character-stage')),true);
assert.equal(await p.evaluate(()=>document.querySelector('.character-stage').dataset.events===window.events),true);
assert.equal(await p.locator('.character-stage canvas').count(),1);
await p.setViewportSize({width:390,height:844});await p.waitForTimeout(200);assert.equal(await p.locator('.character-stage').getAttribute('data-paused'),'true');
const frame=()=>p.locator('.character-stage canvas').evaluate(c=>c.toDataURL());const before=await frame();await p.waitForTimeout(350);assert.equal(await frame(),before);
await p.setViewportSize({width:1024,height:768});await p.waitForTimeout(300);assert.equal(await p.locator('.character-stage').getAttribute('data-paused'),'false');
await p.reload();await p.waitForSelector('.character-stage[data-rig=ready]');assert.equal(await p.locator('.character-stage').getAttribute('data-events'),null,'reload does not replay old cue');
await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(50);const still=await frame();await p.waitForTimeout(400);assert.equal(await frame(),still);assert.equal(await p.locator('.character-stage').evaluate(e=>e.getAnimations().length),0);
await p.route('**/characters/rigs/**',r=>r.abort());await p.reload();await p.waitForSelector('.character-stage[data-rig=fallback]');assert.ok(await p.locator('.character-stage img').evaluate(i=>i.complete&&i.naturalWidth>0));
writeFileSync('reports/character-director-audit.json',JSON.stringify({persistentDOM:true,twentyTabCycles:true,duplicateEvents:false,portraitFrozen:true,reloadDedup:true,reducedMotion:true,loadingFallback:true,canvasCount:1,physicalDevice:false},null,2));
await browser.close();console.log('PASS persistent character / dedup / pause / reduced motion / fallback');
