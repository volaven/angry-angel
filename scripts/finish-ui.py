from pathlib import Path
p=Path(__file__).resolve().parents[1]/'src/main.ts'
s=p.read_text(encoding='utf8')
s=s.replace("state.run.index>0&&!confirm", "Object.keys(state.run.answers).length>0&&!confirm")
s=s.replace("function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));notice='';}","function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));notice='';queuePushSync();}")
s=s.replace("</span></footer>`;}\nfunction download", "</span></footer>`;const reaction=app.querySelector('.cutin');const explanation=app.querySelector('.explanation');if(reaction&&explanation)explanation.before(reaction);}\nfunction download")
s += '''
let pushSyncTimer:ReturnType<typeof setTimeout>|undefined, lastPushPayload='';
function queuePushSync(){
 if(!state.notification.enabled||!('serviceWorker' in navigator))return;
 const signature=JSON.stringify([wrong().length,state.settings.notifyTime,state.settings.harshPush,localDate()]);
 if(signature===lastPushPayload||pushSyncTimer)return;
 pushSyncTimer=setTimeout(async()=>{pushSyncTimer=undefined;try{
  const reg=await navigator.serviceWorker.ready;const sub=await reg.pushManager.getSubscription();
  if(!sub){state.notification.enabled=false;save();return;}
  const response=await fetch('/push-api/subscription',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+state.notification.token},body:JSON.stringify({id:state.notification.installationId,subscription:sub.toJSON(),timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,time:state.settings.notifyTime,wrongCount:wrong().length,harsh:state.settings.harshPush})});
  if(response.ok)lastPushPayload=signature;
 }catch{/* Preserve local state and retry on the next save. */}},1000);
}
queuePushSync();
'''
# Initial render invokes save; declarations must exist before it.
s=s.replace("render();if(import.meta.env.PROD", "if(import.meta.env.PROD")
s += '\nrender();\n'
p.write_text(s,encoding='utf8')
c=p.with_name('style.css');c.write_text(c.read_text(encoding='utf8')+'\n.question-panel>.cutin{position:relative;inset:auto;width:100%;margin:16px 0;box-shadow:none;grid-template-columns:70px 1fr}.question-panel>.cutin img{width:70px;height:100px}.question-panel>.cutin button{grid-column:2}.home-copy>.intro{max-width:100%}@media(max-width:700px){.home-copy>.intro{max-width:230px}.question-panel>.cutin{grid-template-columns:54px 1fr}.question-panel>.cutin img{width:54px;height:80px}}\n',encoding='utf8')
