import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';import {createHash} from 'node:crypto';
const manifest=JSON.parse(readFileSync('assets/character-v2/manifest.json','utf8'));
test('all twelve character states have complete registered layers and preserved masters',()=>{
 assert.equal(Object.keys(manifest.states).length,12);
 for(const [name,state] of Object.entries(manifest.states) as [string,any][]){
  assert.equal(state.ready,true,name);assert.ok(existsSync('public/characters/runtime/'+name+'.webp'));
  for(const key of ['body','head','arm']){const p=state[key],f=manifest.runtimeFiles.find((f:any)=>f.runtime===p.src);assert.ok(f,p.src);for(const r of [p.rect,...(p.blink?[p.blink]:[])]){assert.ok(r[0]>=0&&r[1]>=0&&r[2]>0&&r[3]>0);assert.ok(r[0]+r[2]<=f.size[0]&&r[1]+r[3]<=f.size[1]);}}
 }
 for(const f of manifest.runtimeFiles){assert.ok(existsSync(f.source));assert.equal(createHash('sha256').update(readFileSync('public'+f.runtime)).digest('hex'),f.sha256);}
});
