(function(){
  'use strict';
  const variants=['a','b','c'];
  const questions=['2024-0-1','2024-0-17','2024-1-6','2024-0-12'];
  const screens=['entry','play'];
  const query=new URLSearchParams(location.search);
  let chosenScreen=screens.includes(query.get('screen'))?query.get('screen'):'entry';
  let chosenQuestion=questions.includes(query.get('question'))?query.get('question'):questions[0];
  let chosenVariant=variants.includes(query.get('variant'))?query.get('variant'):'a';
  const states=Object.fromEntries(variants.map(v=>[v,{screen:chosenScreen,question:chosenQuestion}]));
  const frames=Object.fromEntries(variants.map(v=>[v,document.querySelector('[data-frame="'+v+'"]')]));
  const questionSelect=document.getElementById('question-select');
  const deviceSelect=document.getElementById('device-select');
  questionSelect.value=chosenQuestion;
  function playerURL(variant,state){
    const q=new URLSearchParams({variant:variant,screen:state.screen,question:state.question});
    return 'player.html?'+q.toString();
  }
  function send(variant,message){if(frames[variant].contentWindow)frames[variant].contentWindow.postMessage(message,'*');}
  function broadcast(message){variants.forEach(v=>send(v,message));}
  function updateLinks(){
    variants.forEach(v=>{
      document.querySelector('[data-open="'+v+'"]').href=playerURL(v,states[v]);
      document.querySelector('[data-state="'+v+'"]').textContent=states[v].screen==='entry'?'타이틀':'문제풀이';
    });
    const shared=variants.every(v=>states[v].screen===states.a.screen);
    document.querySelectorAll('[data-screen]').forEach(b=>b.setAttribute('aria-pressed',String(shared&&b.dataset.screen===states.a.screen)));
    document.getElementById('sync-status').textContent=shared?'세 시안 · '+(states.a.screen==='entry'?'타이틀 화면':'문제풀이 화면'):'각 시안을 개별 체험 중';
  }
  function setVariant(v){
    chosenVariant=v;
    document.querySelectorAll('[data-panel]').forEach(p=>p.classList.toggle('active',p.dataset.panel===v));
    document.querySelectorAll('[data-variant]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.variant===v)));
    requestAnimationFrame(resizeFrames);
  }
  function resizeFrames(){
    const [width,height]=deviceSelect.value.split('x').map(Number);
    document.querySelectorAll('.device-caption').forEach(e=>e.textContent=width+' × '+height);
    variants.forEach(v=>{
      const viewport=document.querySelector('[data-viewport="'+v+'"]');
      const available=viewport.clientWidth;
      if(!available)return;
      const scale=available/width;
      frames[v].style.width=width+'px';frames[v].style.height=height+'px';frames[v].style.transform='scale('+scale+')';
      viewport.style.height=Math.ceil(height*scale)+'px';
    });
  }
  variants.forEach(v=>{
    frames[v].src=playerURL(v,states[v]);
    frames[v].addEventListener('load',()=>{
      send(v,{type:'demo:set-question',question:states[v].question});
      send(v,{type:'demo:set-screen',screen:states[v].screen});
    });
  });
  document.querySelectorAll('[data-screen]').forEach(b=>b.addEventListener('click',()=>{
    chosenScreen=b.dataset.screen;variants.forEach(v=>states[v].screen=chosenScreen);
    broadcast({type:'demo:set-screen',screen:chosenScreen});updateLinks();
  }));
  questionSelect.addEventListener('change',()=>{
    chosenQuestion=questionSelect.value;variants.forEach(v=>states[v].question=chosenQuestion);
    broadcast({type:'demo:set-question',question:chosenQuestion});updateLinks();
  });
  deviceSelect.addEventListener('change',resizeFrames);
  document.getElementById('reset-all').addEventListener('click',()=>{
    chosenScreen='entry';chosenQuestion=questions[0];questionSelect.value=chosenQuestion;
    variants.forEach(v=>{states[v]={screen:chosenScreen,question:chosenQuestion};});
    broadcast({type:'demo:reset'});updateLinks();
  });
  document.querySelectorAll('[data-variant]').forEach(b=>b.addEventListener('click',()=>setVariant(b.dataset.variant)));
  window.addEventListener('message',event=>{
    const variant=variants.find(v=>frames[v].contentWindow===event.source);
    if(!variant||!event.data||event.data.type!=='demo:state')return;
    const data=event.data;
    if(data.variant!==variant||!screens.includes(data.screen)||!questions.includes(data.question))return;
    states[variant]={screen:data.screen,question:data.question};updateLinks();
  });
  window.addEventListener('resize',resizeFrames);
  if('ResizeObserver' in window){const observer=new ResizeObserver(resizeFrames);document.querySelectorAll('.viewport').forEach(e=>observer.observe(e));}
  updateLinks();setVariant(chosenVariant);resizeFrames();
})();
