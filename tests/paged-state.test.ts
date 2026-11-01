import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {loadNavigation,navigate,goBack} from '../src/navigation';
import {CONTENT_CONTRACT} from '../src/ui-contract';
test('paged UI migrates old navigation and restores source anchors independently',()=>{
 const n=loadNavigation(JSON.stringify({current:{screen:'play',page:0,scroll:250,panelScroll:600},stack:[],pages:{}}));
 n.reading!['run/question/passage']={block:3,offset:121};n.lessonTabs!['run/question']='answers';navigate(n,'settings');goBack(n);
 const restored=loadNavigation(JSON.stringify(n));assert.equal(restored.current.screen,'play');assert.deepEqual(restored.reading,n.reading);assert.deepEqual(restored.lessonTabs,n.lessonTabs);assert.equal(CONTENT_CONTRACT.scroll,false);
});
test('eight production art assets have originals, runtime files and matching hashes',()=>{
 const assets=JSON.parse(readFileSync('assets/ui-v3/manifest.json','utf8'));assert.equal(assets.length,8);assert.equal(new Set(assets.map((a:any)=>a.id)).size,8);
 for(const a of assets){assert.ok(existsSync(a.original));const file='public'+a.runtime;assert.ok(existsSync(file));assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),a.sha256);}
});
