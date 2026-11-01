import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {needsRotation,learningType} from '../src/landscape';
import {subjectArt} from '../src/subject-art';

test('landscape-only contract includes square screens and exact font boundaries',()=>{
 assert.equal(needsRotation(390,844),true);assert.equal(needsRotation(1024,1024),true);
 assert.equal(needsRotation(844,390),false);
 assert.deepEqual([600,601,900,901].map(learningType),[{body:20,instruction:24},{body:24,instruction:30},{body:24,instruction:30},{body:28,instruction:36}]);
 const manifest=JSON.parse(readFileSync('public/manifest.webmanifest','utf8'));
 assert.equal(manifest.orientation,'landscape');assert.equal(manifest.short_name,'합격하시든가');
});
test('four subject backgrounds preserve originals and match packaged hashes',()=>{
 const assets=JSON.parse(readFileSync('assets/ui-v4/manifest.json','utf8'));
 assert.equal(Object.keys(subjectArt).length,4);assert.equal(subjectArt['행정학개론'],undefined);
 for(const item of Object.values(subjectArt)){
  const a=assets.find((a:{id:string})=>a.id===item.id);assert.ok(a);assert.ok(existsSync(a.source));
  assert.equal(createHash('sha256').update(readFileSync('public'+a.runtime)).digest('hex'),a.sha256);
 }
});
