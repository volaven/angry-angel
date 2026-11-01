export const needsRotation=(width:number,height:number)=>height>=width;
export function learningType(height:number){return height<=600?{body:20,instruction:24}:height<=900?{body:24,instruction:30}:{body:28,instruction:36};}

// UI-only gate. No run, answer, reward or deadline is created or rewritten.
let gate:HTMLElement|undefined;
let returnFocus:HTMLElement|null=null;
export function syncOrientation(app:HTMLElement,deadline?:number){
 const blocked=needsRotation(innerWidth,innerHeight);
 const wasBlocked=document.documentElement.classList.contains('rotation-required');
 document.documentElement.classList.toggle('rotation-required',blocked);
 if(!gate){gate=document.createElement('section');gate.className='rotation-guide';gate.setAttribute('role','status');gate.setAttribute('aria-label','가로 화면 안내');gate.tabIndex=-1;gate.innerHTML='<span class="rotate-device" aria-hidden="true">↻</span><h1>기기를 가로로 돌려 주세요</h1><p class="rotation-clock"></p>';document.body.append(gate);}
 gate.hidden=!blocked;app.inert=blocked;
 app.setAttribute('aria-hidden',String(blocked));
 const clock=gate.querySelector<HTMLElement>('.rotation-clock')!;
 clock.hidden=!deadline;
 if(deadline){const t=Math.max(0,Math.ceil((deadline-Date.now())/1000));clock.textContent=`모의고사 시간은 계속 흐릅니다 · 남은 시간 ${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}`;}
 if(blocked&&!wasBlocked){returnFocus=document.activeElement as HTMLElement;gate.focus({preventScroll:true});}
 if(!blocked&&wasBlocked&&returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
 return blocked;
}
