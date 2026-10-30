import assert from 'node:assert/strict';import {writeFileSync} from 'node:fs';
const base='http://127.0.0.1:4186',id='audit-'+crypto.randomUUID(),token=crypto.randomUUID()+crypto.randomUUID();
const payload={id,subscription:{endpoint:'https://fcm.googleapis.com/fcm/send/local-audit-only',keys:{p256dh:'local-test',auth:'local-test'}},timezone:'Asia/Seoul',time:'20:00',wrongCount:3,harsh:false};
const send=(body,t=token)=>fetch(base+'/push-api/subscription',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+t},body:JSON.stringify(body)});
assert.equal((await send(payload)).status,204);assert.equal((await send({...payload,wrongCount:0})).status,204);
assert.equal((await send(payload,'x'.repeat(64))).status,403);
assert.equal((await send({...payload,subscription:{...payload.subscription,endpoint:'http://127.0.0.1/private'}})).status,400);
assert.equal((await fetch(base+'/push-api/subscription/'+id,{method:'DELETE',headers:{Authorization:'Bearer '+token}})).status,204);
writeFileSync('reports/server-audit.json',JSON.stringify({subscription:true,syncZeroCount:true,unauthorizedRejected:true,unsafeEndpointRejected:true,unsubscribe:true,actualDelivery:'not tested: no HTTPS deployment or VAPID configuration'},null,2));console.log('5 HTTP integration checks passed');
