import {chromium} from '@playwright/test';import {readFileSync,writeFileSync} from 'node:fs';
import {freshState,createRun,STORAGE_KEY} from '../src/model.ts';
const bank=JSON.parse(readFileSync('src/bank.json','utf8'));const state=freshState();state.settings.voice=false;state.settings.fastGuard=false;state.run=createRun(state,bank.filter(q=>q.verified&&q.subject==='국어').slice(0,10),'study');state.run.id='ui-comparison-fixed';
const b=await chromium.launch({headless:true,channel:'msedge'});
for(const [width,height] of [[1440,900],[390,844]])for(const version of ['before','after']){
 const context=await b.newContext({viewport:{width,height}});await context.addInitScript(({state,key,version})=>{localStorage.setItem(key,JSON.stringify(state));Math.random=()=>0;if(version==='after')localStorage.setItem('siyeon-exam.ui.v1',JSON.stringify({current:{screen:'play',page:0,scroll:0,panelScroll:0},stack:[],pages:{}}));},{state,key:STORAGE_KEY,version});
 const p=await context.newPage();await p.goto(version==='before'?'http://127.0.0.1:4176/reports/ui-refactor-baseline/index.html':'http://127.0.0.1:4176');if(version==='before')await p.locator('[data-action="continue"]').click();
 await p.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
 await p.screenshot({path:`reports/ui-v2/${version}-${width}x${height}.png`,fullPage:true,animations:'disabled'});await context.close();
}
await b.close();writeFileSync('reports/ui-v2/comparison-state.json',JSON.stringify({runId:state.run.id,questionId:state.run.ids[0],voice:false,random:0,viewports:[[1440,900],[390,844]],screenshots:['before-1440x900.png','after-1440x900.png','before-390x844.png','after-390x844.png']},null,2));
