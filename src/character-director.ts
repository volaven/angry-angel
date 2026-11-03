import rigs from './character-rigs.json';

type Cue='enter'|'question'|'idle'|'feedback';
type Part={src:string;rect:[number,number,number,number];dest:[number,number,number,number];blink?:[number,number,number,number];flip?:boolean};
type Rig={ready:boolean;body:Part;head:Part;arm:Part;face:[number,number];neck:[number,number];shoulder:[number,number];hand:[number,number]};
type Request={pose:string;event:Cue;key:string;reduced:boolean};

/** Presentation only. Never reads or writes grades, answers, clocks or rewards. */
export class CharacterDirector {
 readonly element=document.createElement('div');
 private canvas=document.createElement('canvas');
 private fallback=new Image();
 private layers:HTMLImageElement[]=[];
 private spec:Rig|null=null;
 private request:Request|null=null;
 private seen=new Set<string>();
 private animations:Animation[]=[];
 private raf=0;private paused=true;private clock=0;private last=0;private lastPaint=0;private cueAt=-10000;
 private observer:ResizeObserver;
 private media=matchMedia('(prefers-reduced-motion: reduce)');
 private loadVersion=0;
 constructor(){
  try{this.seen=new Set(JSON.parse(sessionStorage.getItem('siyeon-exam.motion.v1')||'[]'));}catch{this.seen=new Set();}
  this.element.className='character-stage';this.element.dataset.rig='fallback';
  this.fallback.alt='문제요정 시연';this.fallback.draggable=false;this.canvas.setAttribute('aria-hidden','true');
  this.element.append(this.fallback,this.canvas);
  this.fallback.onerror=()=>{if(!this.fallback.src.endsWith('/characters/idle.png'))this.fallback.src='/characters/idle.png';};
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(this.element);
  this.media.addEventListener('change',()=>{this.cancelMotion();this.setPaused(this.paused);this.paint();});
 }
 detach(){this.element.remove();}
 mount(slot:HTMLElement,request:Request){
  slot.replaceWith(this.element);
  const changed=this.request?.pose!==request.pose;
  this.request=request;this.element.dataset.pose=request.pose;
  if(changed)this.load(request.pose);
  if(!this.seen.has(request.key)){
   this.seen.add(request.key);if(this.seen.size>256)this.seen.delete(this.seen.values().next().value!);
   try{sessionStorage.setItem('siyeon-exam.motion.v1',JSON.stringify([...this.seen]));}catch{/* Visual history is optional when storage is unavailable. */}
   this.cueAt=this.clock;this.element.dataset.cue=request.event;
   this.element.dataset.phase=request.event;
   this.element.dataset.events=String(Number(this.element.dataset.events||0)+1);
   this.cancelMotion();
   if(!this.reduced&&(request.event==='enter'||request.event==='question')){
    const a=this.element.animate([{transform:'translateX(35px)',opacity:.2},{transform:'translateX(0)',opacity:1}],{duration:600,easing:'cubic-bezier(.16,1,.3,1)',fill:'none'});
    this.animations.push(a);a.onfinish=()=>{this.animations=this.animations.filter(x=>x!==a);};
   }
  }
  this.resize();this.setPaused(document.hidden||innerHeight>=innerWidth);
 }
 private get reduced(){return !!this.request?.reduced||this.media.matches;}
 private cancelMotion(){for(const a of this.animations)a.cancel();this.animations=[];}
 setPaused(value:boolean){
  this.paused=value;this.element.dataset.paused=String(value);
  for(const a of this.animations)value?a.pause():a.play();
  cancelAnimationFrame(this.raf);this.raf=0;this.last=0;
  if(!value&&!this.reduced&&this.element.isConnected)this.raf=requestAnimationFrame(this.tick);
 }
 private load(pose:string){
  const version=++this.loadVersion;this.element.dataset.loading='true';
  this.fallback.src=`/characters/runtime/${pose}.webp`;
  const fail=()=>{if(version===this.loadVersion){this.element.dataset.rig='fallback';this.element.dataset.loading='false';this.layers=[];this.spec=null;this.paint();}};
  const spec=(rigs as unknown as Record<string,Rig>)[pose];if(!spec?.ready){fail();return;}
  const load=(src:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=src;});
  Promise.all([spec.body,spec.arm,spec.head].map(p=>load(p.src))).then(images=>{if(version!==this.loadVersion)return;this.layers=images;this.spec=spec;this.element.dataset.rig='ready';this.element.dataset.loading='false';this.paint();}).catch(fail);
 }
 private resize(){const r=this.element.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5);const w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);if(w&&h&&(w!==this.canvas.width||h!==this.canvas.height)){this.canvas.width=w;this.canvas.height=h;}this.paint();}
 private tick=(time:number)=>{
  if(this.paused||!this.element.isConnected)return;
  if(this.last)this.clock+=Math.min(50,time-this.last);this.last=time;
  if(this.clock-this.cueAt>1000)this.element.dataset.phase='idle';
  if(time-this.lastPaint>32){this.paint();this.lastPaint=time;}
  this.raf=requestAnimationFrame(this.tick);
 };
 private paint(){
  const ctx=this.canvas.getContext('2d'),spec=this.spec,r=this.request;if(!ctx)return;
  const w=this.canvas.width,h=this.canvas.height;ctx.clearRect(0,0,w,h);if(this.layers.length!==3||!spec||!r||!w||!h)return;
  const sw=512,sh=768;
  const bust=innerHeight<=600&&document.body.dataset.screen==='play';
  // Low screens frame the face at panel width, instead of shrinking her when a longer line appears.
  const scale=bust?w/sw:Math.min(w/sw,h/sh);const x=(w-sw*scale)/2,y=bust?0:h-sh*scale;
  const age=this.clock-this.cueAt,p=Math.min(1,Math.max(0,age/1000));
  const pulse=this.reduced?0:Math.sin(Math.PI*p)*Math.sin(Math.PI*p);
  const isFeedback=r.event==='feedback';
  const rest=Math.sin(this.clock/2000)*.005;
  const headAngle=this.reduced?0:rest+(isFeedback?Math.sin(p*Math.PI*2)*.035:r.event==='question'?-pulse*.035:0);
  const armAngle=this.reduced?0:rest*.5+pulse*(isFeedback?-.055:-.035);
  const blink=!this.reduced&&this.clock%4800>4660;
  const draw=(i:number,part:Part,angle=0,anchor:[number,number]=[.5,.3],closed=false)=>{
   const rect=closed&&part.blink?part.blink:part.rect;
   ctx.save();ctx.imageSmoothingQuality='high';ctx.translate(x,y);ctx.scale(scale,scale);ctx.translate(anchor[0]*sw,anchor[1]*sh);ctx.rotate(angle);ctx.translate(-anchor[0]*sw,-anchor[1]*sh);if(part.flip){ctx.translate(part.dest[0]*2+part.dest[2],0);ctx.scale(-1,1);}ctx.drawImage(this.layers[i],...rect,...part.dest);ctx.restore();
  };
  draw(0,spec.body);draw(1,spec.arm,armAngle,spec.shoulder);draw(2,spec.head,headAngle,spec.neck,blink);
  if(isFeedback&&['correct','blush','history-blush','english-blush'].includes(r.pose)&&age>=0&&age<1000&&!this.reduced){
   ctx.save();ctx.strokeStyle='#d5b878';ctx.lineWidth=Math.max(1,scale*2);ctx.globalAlpha=1-p;
   for(let i=0;i<8;i++){const a=i*Math.PI/4,dist=20+55*p,cx=x+spec.hand[0]*sw*scale+Math.cos(a)*dist*scale,cy=y+spec.hand[1]*sh*scale+Math.sin(a)*dist*scale;ctx.beginPath();ctx.moveTo(cx-3*scale,cy);ctx.lineTo(cx+3*scale,cy);ctx.moveTo(cx,cy-3*scale);ctx.lineTo(cx,cy+3*scale);ctx.stroke();}ctx.restore();
  }
 }
}
