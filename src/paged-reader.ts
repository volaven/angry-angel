import {needsRotation} from './landscape';
import {escapeHTML as esc,renderButton as button} from './ui-contract';

export interface Bookmark {block:number;offset:number}
export type ReadingPositions=Record<string,Bookmark>;
interface Piece {html:string;block:number;start:number;end:number}
interface Book {host:HTMLElement;pages:Piece[][];page:number;key:string;draw:()=>void}
let books:Book[]=[];
let generation=0;
export function deck(html:string,key:string){return `<section class="paged-reader" data-book="${esc(key)}"><template>${html}</template><div class="page-window" tabindex="-1" aria-label="현재 쪽"></div><nav class="book-nav" aria-label="내용 페이지"><button type="button" data-turn="-1" aria-label="이전 쪽">← 이전</button><span class="page-count" aria-live="polite"></span><button type="button" data-turn="1" aria-label="다음 쪽">다음 →</button></nav></section>`;}

// A DOM Range preserves inline underlines, emphasis, and original whitespace.
export function textSlice(el:HTMLElement,start:number,end:number){
 const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const nodes:Text[]=[];let node:Node|null;
 while(node=walker.nextNode())nodes.push(node as Text);
 const range=document.createRange();let n=0,started=false;
 for(const text of nodes){const next=n+text.length;if(!started&&start<=next){range.setStart(text,Math.max(0,start-n));started=true;}if(started&&end<=next){range.setEnd(text,Math.max(0,end-n));return range.cloneContents();}n=next;}
 return document.createDocumentFragment();
}
function segment(el:HTMLElement,start:number,end:number,total:number){
 const clone=el.cloneNode(true) as HTMLElement;
 const target=clone.querySelector<HTMLElement>('.answer-text')||clone;
 const source=el.querySelector<HTMLElement>('.answer-text')||el;
 target.replaceChildren(textSlice(source,start,end));
 if(el.matches('.answer-card')&&end<total){clone.removeAttribute('data-action');clone.setAttribute('disabled','');clone.setAttribute('aria-label',`${el.querySelector('.answer-number')?.textContent}번 보기 계속`);clone.querySelector('.answer-state')!.textContent='다음 쪽에 계속';}
 if(start>0)clone.dataset.continuation='true';
 return clone;
}
function sourceElements(template:HTMLTemplateElement){return Array.from(template.content.children) as HTMLElement[];}
// HTML parsing discards the first LF immediately after <pre>. Escape that parser
// behavior when a preserved passage fragment starts at a blank line.
function serialized(el:HTMLElement){return el.outerHTML.replace(/^(<pre\b[^>]*>)(\n)/,'$1\n$2');}

export async function mountBooks(positions:ReadingPositions,save:()=>void){
 const version=++generation;if(needsRotation(innerWidth,innerHeight))return;books=[];
 await document.fonts.ready;if(version!==generation||needsRotation(innerWidth,innerHeight))return;
 for(const host of document.querySelectorAll<HTMLElement>('.paged-reader')){
  const template=host.querySelector<HTMLTemplateElement>('template')!;
  const win=host.querySelector<HTMLElement>('.page-window')!;const key=host.dataset.book!;
  const h=Math.floor(win.getBoundingClientRect().height),w=win.getBoundingClientRect().width;if(h<40||w<40)continue;
  win.style.setProperty('--page-height',h+'px');
  const probe=document.createElement('div');probe.className='page-window page-probe';probe.style.width=w+'px';probe.style.setProperty('--page-height',h+'px');host.append(probe);
  const fits=(el:HTMLElement)=>{probe.replaceChildren(el);const style=getComputedStyle(el);const occupied=el.getBoundingClientRect().height+parseFloat(style.marginTop)+parseFloat(style.marginBottom);return occupied<=h-2&&el.scrollWidth<=w+1;};
  const pieces:Piece[]=[];const originals=sourceElements(template);
  originals.forEach((el,block)=>{
   if(el.matches('figure,.image-page')){pieces.push({html:el.outerHTML,block,start:0,end:1});return;}
   const textEl=el.querySelector<HTMLElement>('.answer-text')||el;const text=textEl.textContent||'';
   const whole=el.cloneNode(true) as HTMLElement;
   if(fits(whole)||!text.length||el.matches('label,.setting-row,.atomic')){pieces.push({html:serialized(whole),block,start:0,end:Math.max(1,text.length)});return;}
   let start=0;
   while(start<text.length){
    let lo=start+1,hi=text.length,best=start;
    while(lo<=hi){const mid=(lo+hi)>>1;if(fits(segment(el,start,mid,text.length))){best=mid;lo=mid+1;}else hi=mid-1;}
    if(best===start)throw Error(`Page too small for ${key} block ${block}`);
    // Prefer a sentence/word boundary when it does not waste more than 25% of the page.
    if(best<text.length){const part=text.slice(start,best);const matches=[...part.matchAll(/[.!?。]\s|\n|\s/g)];const boundary=matches.at(-1);if(boundary&&boundary.index!>part.length*.75)best=start+boundary.index!+boundary[0].length;}
    // Boundary changes can alter grid intrinsic widths (especially bilingual answers).
    // Re-measure the exact final fragment, not just the binary-search candidate.
    while(best>start&&!fits(segment(el,start,best,text.length)))best--;
    if(best===start)throw Error(`Page cannot fit fragment ${key}/${block}`);
    pieces.push({html:serialized(segment(el,start,best,text.length)),block,start,end:best});start=best;
   }
  });
  const pages:Piece[][]=[];let current:Piece[]=[];
  for(const piece of pieces){probe.innerHTML=[...current,piece].map(p=>p.html).join('');const overflow=probe.scrollHeight>h-2;const image=probe.querySelector('figure,.image-page');if(current.length&&(overflow||image)){pages.push(current);current=[];}current.push(piece);if(image){pages.push(current);current=[];}}
  if(current.length)pages.push(current);if(!pages.length)pages.push([]);probe.remove();
  const mark=positions[key]||{block:0,offset:0};let index=pages.findIndex(page=>page.some(p=>p.block===mark.block&&p.start<=mark.offset&&p.end>mark.offset));if(index<0)index=0;
  const book:Book={host,pages,page:index,key,draw:()=>{}};
  book.draw=()=>{const page=book.pages[book.page];win.innerHTML=page.map(p=>p.html).join('');Array.from(win.children).forEach((el,i)=>{(el as HTMLElement).dataset.sourceBlock=String(page[i].block);(el as HTMLElement).dataset.sourceStart=String(page[i].start);});host.dataset.ready='true';host.dataset.page=String(book.page);host.dataset.pages=String(pages.length);host.querySelector('.page-count')!.textContent=`${book.page+1} / ${pages.length}`;
   (host.querySelector('[data-turn="-1"]') as HTMLButtonElement).disabled=book.page===0;(host.querySelector('[data-turn="1"]') as HTMLButtonElement).disabled=book.page===pages.length-1;
   if(page[0])positions[key]={block:page[0].block,offset:page[0].start};save();};
  host.onclick=e=>{if(needsRotation(innerWidth,innerHeight))return;const turn=(e.target as HTMLElement).closest<HTMLElement>('[data-turn]');if(!turn||(turn as HTMLButtonElement).disabled)return;book.page=Math.max(0,Math.min(pages.length-1,book.page+Number(turn.dataset.turn)));book.draw();};
  books.push(book);book.draw();
 }
}
export function turnFocusedPage(delta:number){const book=books.find(b=>b.host.contains(document.activeElement))||books[0];if(!book)return;book.page=Math.max(0,Math.min(book.pages.length-1,book.page+delta));book.draw();}

// This adapter makes existing management views paged without changing their actions.
export function documentDeck(html:string,key:string){
 const root=document.createElement('div');root.innerHTML=html;const blocks:string[]=[];
 const walk=(el:Element)=>{
  if(el.matches('img')){blocks.push(imageBlock(el.getAttribute('src')!,el.getAttribute('alt')||'원문'));return;}
  if(el.matches('label,button,.wrong-list article,.stats>div')||!el.children.length||el.matches('p,h1,h2,h3,strong,a')){if(el.matches('summary'))blocks.push(`<h2>${el.innerHTML}</h2>`);else blocks.push(el.outerHTML);return;}
  if(el.matches('.section-title')){blocks.push(`<h1>${el.querySelector('h1')?.innerHTML||''}</h1>`);const p=el.querySelector('p');if(p)blocks.push(p.outerHTML);return;}
  Array.from(el.children).forEach(walk);
 };
 Array.from(root.children).forEach(walk);return deck(blocks.join(''),key);
}
export function imageBlock(src:string,alt='문제 자료'){return `<figure class="image-page"><img src="${esc(src)}" alt="${esc(alt)}"><figcaption>${button('자료 확대','zoom:'+src,'image-zoom')}</figcaption></figure>`;}

let zoomSource='',zoomPage=0,zoomReturn:HTMLElement|null=null;
export function closeZoom(){document.querySelector('.material-viewer')?.remove();zoomReturn?.focus({preventScroll:true});zoomSource='';}
export function isZoomOpen(){return !!zoomSource;}
export function openZoom(src:string){zoomReturn=document.activeElement as HTMLElement;zoomSource=src;zoomPage=0;drawZoom();}
export function refreshZoom(){if(zoomSource)drawZoom();}
function drawZoom(){
 document.querySelector('.material-viewer')?.remove();const overlay=document.createElement('dialog');overlay.className='material-viewer';overlay.setAttribute('aria-label','원문 자료 확대');
 overlay.innerHTML=`<header><b>자료 확대</b>${button('닫기','zoom-close','icon')}</header><div class="zoom-window"></div><nav><button type="button" data-zoom-step="-1">← 이전</button><span></span><button type="button" data-zoom-step="1">다음 →</button></nav>`;document.body.append(overlay);overlay.showModal();
 overlay.addEventListener('cancel',e=>{e.preventDefault();closeZoom();});
 const img=new Image();img.alt='원문 확대 자료';img.src=zoomSource;
 img.onload=()=>{const win=overlay.querySelector<HTMLElement>('.zoom-window')!;const w=win.clientWidth,h=win.clientHeight;const zoomWidth=Math.max(w,Math.min(img.naturalWidth,1200));const scale=zoomWidth/img.naturalWidth;const ih=img.naturalHeight*scale;const cols=Math.max(1,Math.ceil((zoomWidth-24)/(w-24))),rows=Math.max(1,Math.ceil((ih-24)/(h-24)));const total=cols*rows+1;zoomPage=Math.min(total-1,zoomPage);
  const draw=()=>{win.replaceChildren(img);if(zoomPage===0){img.style.cssText='width:100%;height:100%;object-fit:contain';}else{const i=zoomPage-1;img.style.cssText=`position:absolute;width:${zoomWidth}px;max-width:none;height:${ih}px;left:${-Math.min((i%cols)*(w-24),Math.max(0,zoomWidth-w))}px;top:${-Math.min(Math.floor(i/cols)*(h-24),Math.max(0,ih-h))}px`;}overlay.querySelector('nav span')!.textContent=zoomPage===0?'전체 보기':`확대 ${zoomPage} / ${total-1}`;const controls=overlay.querySelectorAll<HTMLButtonElement>('[data-zoom-step]');controls[0].disabled=zoomPage===0;controls[1].disabled=zoomPage===total-1;};
  overlay.querySelectorAll<HTMLButtonElement>('[data-zoom-step]').forEach(b=>b.onclick=()=>{zoomPage+=Number(b.dataset.zoomStep);draw();});draw();};
 img.onerror=()=>{overlay.querySelector('.zoom-window')!.textContent='자료를 불러오지 못했습니다. 닫고 다시 열어 주세요.';};
}
