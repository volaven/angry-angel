(function () {
  'use strict';
  const questions = window.DEMO_QUESTIONS;
  const params = new URLSearchParams(location.search);
  const variant = ['a', 'b', 'c'].includes(params.get('variant')) ? params.get('variant') : 'a';
  const initialIndex = Math.max(0, questions.findIndex(q => q.id === params.get('question')));
  const state = {screen: params.get('screen') === 'play' ? 'play' : 'entry', index: initialIndex, tab: 'passage', answers: {}, marks: {}, paused: false, zoom: null};
  const app = document.getElementById('app');
  const cues = new Set();
  let book = null, revision = 0, resizeTimer, lastFocus;
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const q = () => questions[state.index];
  const graded = () => Object.prototype.hasOwnProperty.call(state.answers, q().id);
  const result = () => !graded() ? 'question' : state.answers[q().id] === q().answer ? 'correct' : 'sigh';
  const paths = {left:'M19 12H5m6-6-6 6 6 6',right:'M5 12h14m-6-6 6 6-6 6',pause:'M8 5v14m8-14v14',close:'m6 6 12 12M18 6 6 18',check:'m5 12 4 4L19 6'};
  const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.right}"></path></svg>`;
  function button(text, action, css = '', attrs = '') {return `<button type="button" class="${css}" data-action="${action}" ${attrs}>${text}</button>`;}
  function notify() {if (parent !== window) parent.postMessage({type:'demo:state',variant,screen:state.screen,question:q().id}, '*');}
  function message() {return !graded() ? '조건을 확인하세요.' : state.answers[q().id] === q().answer ? '정답입니다. 근거도 기억하세요.' : '해설에서 근거를 확인하세요.';}
  function portrait(emotion = result(), animate = false) {return `<div class="avatar ${animate?'arrival':''}"><img src="assets/${emotion}.webp" alt="문제요정 시연"></div>`;}
  function character() {const key = `${q().id}/${result()}`;const fresh = !cues.has(key);cues.add(key);return `<aside class="cast" aria-label="시연의 반응"><div class="stand ${fresh ? 'arrival' : ''}"><img src="assets/${result()}.webp" alt="${result() === 'correct' ? '담담하게 칭찬하는' : result() === 'sigh' ? '한숨을 쉬는' : '문제를 안내하는'} 시연"></div><div class="bubble" role="status"><b>시연</b>${message()}</div></aside>`;}
  function titleHTML() {return '<h1 class="hero-title">합격하시든가,<br><em>쓰레기로</em><br>남으시든가.</h1>';}
  function entry() {
    const fresh = !cues.has('entry');cues.add('entry');
    const art = `<div class="stand ${fresh ? 'arrival' : ''}"><img src="assets/idle.webp" alt="기본서를 든 시연"></div>`;
    const start = button(`문제 풀기 ${icon('right')}`, 'start', 'primary');
    if (variant === 'b') return `<main class="entry-scene entry-b"><section class="book-cover">${portrait('idle',fresh)}<h1 class="hero-title">합격하시든가,<br><em>쓰레기로 남으시든가.</em></h1><p class="entry-info">국가직 9급 · 일반행정</p>${start}</section></main>`;
    if (variant === 'c') return `<main class="entry-scene entry-c"><div class="entry-copy"><p class="entry-info">국가직 9급 · 일반행정</p>${titleHTML()}<p>한 문제씩,<br>끝까지 가 보시죠.</p></div>${art}${button(`시작하기 ${icon('right')}`, 'start', 'primary entry-start')}</main>`;
    return `<main class="entry-scene entry-a"><div class="entry-copy"><p class="entry-info">국가직 9급 · 일반행정</p>${titleHTML()}<p>당신의 다음 한 문제를 위해.</p>${start}</div>${art}</main>`;
  }
  const tabs = () => `<nav class="tabs" aria-label="문제 내용">${[['passage','지문'],['answers','답안'],['explanation','해설'],['source','자료']].map(([id,label]) => button(label, 'tab:'+id, '', `aria-pressed="${state.tab===id}" ${id==='explanation'&&!graded()?'disabled':''}`)).join('')}</nav>`;
  const pageNav = () => `<nav class="page-nav" aria-label="내용 페이지">${button(icon('left'),'page:-1','','aria-label="이전 쪽"')}<span class="page-count" aria-live="polite">1 / 1</span>${button(icon('right'),'page:1','','aria-label="다음 쪽"')}</nav>`;
  function action() {return graded() ? button(`${state.index === questions.length-1 ? '다시 체험' : '다음 문제'} ${icon('right')}`, 'next', 'primary') : button(`${state.tab === 'passage' ? '답안 보기' : '지문 보기'} ${icon('right')}`, state.tab === 'passage' ? 'tab:answers' : 'tab:passage', 'primary');}
  function play() {
    const key=q().id+'/'+result(),fresh=!cues.has(key);if(variant!=='a')cues.add(key);
    const header = `<header class="hud">${button(icon('left'),'entry','icon-button back','aria-label="타이틀로 돌아가기"')}<div class="question-meta"><b>${esc(q().subject)}</b><small>${q().year} · ${q().number}번</small></div>${variant==='b'?`<div class="hud-speaker">${portrait(result(),fresh)}<p role="status">${message()}</p></div>`:''}<span class="progress">${state.index+1} / ${questions.length}</span>${button('일시정지','pause','pause')}</header>`;
    const reader = `<section class="reader" data-ready="false" aria-label="문제 읽기"><template>${content()}</template><div class="page-window" tabindex="-1" aria-label="현재 쪽"></div><div class="reader-controls">${pageNav()}<div class="action-slot">${action()}</div></div></section>`;
    const work = `<section class="work" aria-label="문제와 답안">${tabs()}${reader}</section>`;
    if (variant === 'c') return `<main class="game">${header}<div class="play-stage"><nav class="side-page-nav" aria-label="내용 페이지">${button(icon('left')+'이전','page:-1','','aria-label="이전 쪽"')}<span class="page-count" aria-live="polite">1 / 1</span>${button('다음'+icon('right'),'page:1','','aria-label="다음 쪽"')}</nav>${work}<aside class="thumb-dock" aria-label="시연과 다음 행동">${portrait(result(),fresh)}<div class="bubble" role="status"><b>시연</b>${message()}</div><div class="action-slot">${action()}</div></aside></div></main>`;
    return `<main class="game">${header}<div class="play-stage">${work}${variant==='a'?character():''}</div></main>`;
  }
  function emphasis(text, p) {
    let html = esc(text);
    (p.marks || []).forEach((mark,i) => {const n = '①②③④'[i];html = html.replace(n+esc(mark),`<span class="inline-mark"><b>${n}</b><u>${esc(mark)}</u></span>`);});
    (p.emphasis || []).forEach(mark => {html = html.replace(esc(mark),`<u>${esc(mark)}</u>`);});return html;
  }
  function imageBlock(src, label) {return `<figure class="image-page"><img src="${esc(src)}" alt="${esc(label)}"><figcaption>${button('자료 확대','zoom:'+src)}</figcaption></figure>`;}
  function content() {
    const p = q().presentation;
    if (state.tab === 'passage') return `<h1>${esc(p.instruction)}</h1>`+p.blocks.map(b => b.kind==='source' ? imageBlock(b.src,'정답 판단에 필요한 원문 자료') : `<${b.kind==='preserved'?'pre':'p'} class="passage-block">${emphasis(b.text,p)}</${b.kind==='preserved'?'pre':'p'}>`).join('')+(p.note?`<p class="source-note">${esc(p.note)}</p>`:'');
    if (state.tab === 'answers') return p.options.map((option,i) => {
      let text=esc(option);const mark=p.optionMarks && p.optionMarks[i];if(mark)text=text.replace(esc(mark),`<u>${esc(mark)}</u>`);
      const chosen=state.answers[q().id]===i+1;const right=graded()&&q().answer===i+1;
      return button(`<span class="number">${i+1}</span><span class="answer-text">${text}</span><span class="answer-state">${graded()?(right?'정답':chosen?'내 답 · 오답':''):''}</span>`, 'answer:'+(i+1), `answer ${right?'right ':''}${graded()&&chosen&&!right?'wrong ':''}${chosen?'selected':''}`,`${graded()?'disabled':''} aria-pressed="${chosen}"`);
    }).join('');
    if (state.tab === 'explanation') return `<h2>${state.answers[q().id]===q().answer?'정답입니다.':'근거를 다시 확인하세요.'} 정답 ${q().answer}번</h2><p>${esc(q().explanation)}</p>`+q().distractors.map((text,i)=>`<p><b>${i+1}번</b> ${esc(text)}</p>`).join('');
    return q().sources.map(s=>imageBlock(s.src,s.label)).join('');
  }
  function render() {
    const version=++revision;book=null;document.body.className='variant-'+variant;app.classList.toggle('paused',state.paused||document.hidden);app.dataset.variant=variant;app.dataset.screen=state.screen;app.dataset.question=q().id;app.dataset.tab=state.tab;app.dataset.graded=String(graded());app.innerHTML=state.screen==='entry'?entry():play();
    app.querySelectorAll('img').forEach(img=>{img.onerror=()=>{img.onerror=null;img.alt='그림을 불러오지 못했습니다.';};});
    if(state.paused)pauseOverlay();gate();notify();
    if(state.screen==='play'&&!rotated())document.fonts.ready.then(()=>{if(version===revision)paginate();}).catch(showError);
  }
  const rotated = () => innerHeight>=innerWidth;
  function gate() {const blocked=rotated();document.documentElement.classList.toggle('rotation-required',blocked);document.getElementById('rotation').hidden=!blocked;app.inert=blocked;return blocked;}
  function showError(error) {const win=app.querySelector('.page-window');if(win){win.innerHTML=`<p role="alert">읽기 영역을 준비하지 못했습니다. 화면을 가로로 넓히거나 다시 열어 주세요.</p>`;}console.error(error);}
  function fragment(source,start,end,total) {
    const clone=source.cloneNode(true),target=clone.querySelector('.answer-text')||clone,original=source.querySelector('.answer-text')||source;
    const walker=document.createTreeWalker(original,NodeFilter.SHOW_TEXT),nodes=[];let node;while((node=walker.nextNode()))nodes.push(node);
    const range=document.createRange();let pos=0,started=false;
    for(const n of nodes){const next=pos+n.length;if(!started&&start<=next){range.setStart(n,Math.max(0,start-pos));started=true;}if(started&&end<=next){range.setEnd(n,Math.max(0,end-pos));break;}pos=next;}
    target.replaceChildren(range.cloneContents());
    if(source.matches('.answer')&&end<total){clone.disabled=true;clone.removeAttribute('data-action');clone.setAttribute('aria-label',`${source.querySelector('.number').textContent}번 보기 계속`);clone.querySelector('.answer-state').textContent='다음 쪽에 계속';}
    if(start>0)clone.dataset.continuation='true';return clone;
  }
  function serialize(el) {return el.outerHTML.replace(/^(<pre\b[^>]*>)(\n)/,'$1\n$2');}
  function paginate() {
    if(rotated()||state.screen!=='play')return;
    try {
      const host=app.querySelector('.reader'),win=host.querySelector('.page-window'),template=host.querySelector('template');
      const h=Math.floor(win.getBoundingClientRect().height),w=win.getBoundingClientRect().width;if(h<40||w<40)throw Error('Insufficient reading area');
      win.style.setProperty('--page-height',h+'px');
      const probe=document.createElement('div');probe.className='page-window probe';probe.style.width=w+'px';probe.style.setProperty('--page-height',h+'px');host.append(probe);
      const fits=el=>{probe.replaceChildren(el);const s=getComputedStyle(el);return el.getBoundingClientRect().height+parseFloat(s.marginTop)+parseFloat(s.marginBottom)<=h-2&&el.scrollWidth<=w+1;};
      const pieces=[];const source=Array.from(template.content.children);
      source.forEach((el,block)=>{
        const text=(el.querySelector('.answer-text')||el).textContent;
        if(el.matches('figure')||fits(el.cloneNode(true))||!text.length){pieces.push({html:serialize(el),block,start:0,end:Math.max(1,text.length)});return;}
        let start=0;
        while(start<text.length){let lo=start+1,hi=text.length,best=start;
          while(lo<=hi){const mid=(lo+hi)>>1;if(fits(fragment(el,start,mid,text.length))){best=mid;lo=mid+1;}else hi=mid-1;}
          if(best===start)throw Error('Text cannot fit');
          if(best<text.length){const part=text.slice(start,best),boundaries=Array.from(part.matchAll(/[.!?。]\s|\n|\s/g));const b=boundaries[boundaries.length-1];if(b&&b.index>part.length*.75)best=start+b.index+b[0].length;}
          while(best>start&&!fits(fragment(el,start,best,text.length)))best--;
          if(best===start)throw Error('Fragment cannot fit');pieces.push({html:serialize(fragment(el,start,best,text.length)),block,start,end:best});start=best;
        }
      });
      const pages=[];let page=[];
      for(const piece of pieces){probe.innerHTML=page.concat(piece).map(p=>p.html).join('');const image=!!probe.querySelector('figure');if(page.length&&(probe.scrollHeight>h-2||image)){pages.push(page);page=[];}page.push(piece);if(image){pages.push(page);page=[];}}
      if(page.length)pages.push(page);if(!pages.length)pages.push([]);probe.remove();
      const key=q().id+'/'+state.tab,mark=state.marks[key]||{block:0,offset:0};let index=pages.findIndex(p=>p.some(part=>part.block===mark.block&&part.start<=mark.offset&&part.end>mark.offset));if(index<0)index=0;
      book={host,win,pages,index,key};draw();
    } catch(error) {app.querySelectorAll('.probe').forEach(p=>p.remove());showError(error);}
  }
  function draw() {
    if(!book)return;const parts=book.pages[book.index];book.win.innerHTML=parts.map(p=>p.html).join('');Array.from(book.win.children).forEach((el,i)=>{el.dataset.sourceBlock=parts[i].block;el.dataset.sourceStart=parts[i].start;el.dataset.sourceEnd=parts[i].end;});
    app.querySelectorAll('[data-action="page:-1"]').forEach(b=>b.disabled=book.index===0);app.querySelectorAll('[data-action="page:1"]').forEach(b=>b.disabled=book.index===book.pages.length-1);
    app.querySelectorAll('.page-count').forEach(n=>n.textContent=`${book.index+1} / ${book.pages.length}`);book.host.dataset.ready='true';book.host.dataset.pages=book.pages.length;book.host.dataset.page=book.index;
    if(parts[0])state.marks[book.key]={block:parts[0].block,offset:parts[0].start};
  }
  function turn(delta) {if(!book||state.paused||state.zoom||rotated())return;book.index=Math.max(0,Math.min(book.pages.length-1,book.index+delta));draw();}
  function reset(keepScreen=true) {state.answers={};state.marks={};state.paused=false;state.zoom=null;state.tab='passage';if(!keepScreen){state.index=initialIndex;state.screen='entry';}render();}
  function pauseOverlay() {app.classList.add('paused');const modal=document.createElement('section');modal.className='modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','일시정지');modal.innerHTML=`<div class="pause-paper"><h2>잠시 쉬어 가세요.</h2><p>읽던 쪽과 선택한 답을 보관했습니다.</p>${button('계속 풀기','resume','primary')}${button('타이틀로 돌아가기','entry')}</div>`;app.append(modal);setTimeout(()=>modal.querySelector('button').focus(),0);}
  function openZoom(src) {
    lastFocus=document.activeElement;state.zoom={src,page:0};const modal=document.createElement('section');modal.className='modal';modal.id='zoom';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','자료 확대');modal.innerHTML=`<section class="zoom-paper"><header class="zoom-toolbar"><b>자료 확대</b>${button('닫기 '+icon('close'),'zoom-close')}</header><div class="zoom-window"></div><nav class="zoom-nav">${button(icon('left'),'zoom-step:-1','','aria-label="이전 확대 구역"')}<span></span>${button(icon('right'),'zoom-step:1','','aria-label="다음 확대 구역"')}</nav></section>`;app.append(modal);paintZoom();modal.querySelector('button').focus();
  }
  function paintZoom() {
    const modal=document.getElementById('zoom');if(!modal||!state.zoom)return;const z=state.zoom,img=new Image();img.alt='문제 자료 확대';img.src=z.src;
    img.onload=()=>{if(state.zoom!==z||!modal.isConnected)return;const win=modal.querySelector('.zoom-window'),w=win.clientWidth,h=win.clientHeight;const width=Math.max(w,Math.min(img.naturalWidth,1200)),height=img.naturalHeight*width/img.naturalWidth;const cols=Math.max(1,Math.ceil((width-24)/Math.max(1,w-24))),rows=Math.max(1,Math.ceil((height-24)/Math.max(1,h-24))),total=cols*rows+1;z.page=Math.min(z.page,total-1);z.total=total;win.replaceChildren(img);
      if(z.page===0)img.style.cssText='width:100%;height:100%;object-fit:contain';else{const i=z.page-1;img.style.cssText=`width:${width}px;max-width:none;height:${height}px;left:${-Math.min(i%cols*(w-24),Math.max(0,width-w))}px;top:${-Math.min(Math.floor(i/cols)*(h-24),Math.max(0,height-h))}px`;}
      modal.querySelector('.zoom-nav span').textContent=z.page===0?'전체 보기':`확대 ${z.page} / ${total-1}`;modal.querySelector('[data-action="zoom-step:-1"]').disabled=z.page===0;modal.querySelector('[data-action="zoom-step:1"]').disabled=z.page===total-1;
    };img.onerror=()=>modal.querySelector('.zoom-window').textContent='자료를 불러오지 못했습니다. 닫고 다시 열어 주세요.';
  }
  function closeZoom() {state.zoom=null;document.getElementById('zoom')?.remove();if(lastFocus&&lastFocus.isConnected)lastFocus.focus();}
  document.addEventListener('click',event=>{
    if(rotated())return;const b=event.target.closest('[data-action]');if(!b||b.disabled)return;const raw=b.dataset.action,split=raw.indexOf(':'),action=split<0?raw:raw.slice(0,split),value=split<0?'':raw.slice(split+1);
    if(state.zoom&&!action.startsWith('zoom'))return;if(state.paused&&!['resume','entry'].includes(action))return;
    if(action==='page'){turn(Number(value));return;}if(action==='zoom'){openZoom(value);return;}if(action==='zoom-close'){closeZoom();return;}if(action==='zoom-step'){state.zoom.page=Math.max(0,Math.min(state.zoom.total-1,state.zoom.page+Number(value)));paintZoom();return;}
    if(action==='start'){state.screen='play';state.tab='passage';state.answers={};state.marks={};}
    else if(action==='entry'){state.screen='entry';state.paused=false;}
    else if(action==='tab'){if(value==='explanation'&&!graded())return;state.tab=value;}
    else if(action==='answer'){if(graded())return;state.answers[q().id]=Number(value);state.tab='explanation';}
    else if(action==='next'){if(!graded())return;if(state.index===questions.length-1){state.index=0;state.answers={};state.marks={};}else state.index++;state.tab='passage';}
    else if(action==='pause'){state.paused=true;}
    else if(action==='resume'){state.paused=false;}
    render();
  });
  document.addEventListener('keydown',event=>{
    if(rotated())return;if(event.key==='Escape'){if(state.zoom){event.preventDefault();closeZoom();}else if(state.paused){state.paused=false;render();}return;}
    const modal=app.querySelector('.modal');if(modal&&event.key==='Tab'){const all=Array.from(modal.querySelectorAll('button:not(:disabled)'));const first=all[0],last=all[all.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}return;}
    if(event.key==='PageDown'||event.key==='PageUp'){event.preventDefault();turn(event.key==='PageDown'?1:-1);}
  });
  window.addEventListener('message',event=>{
    if(event.source!==parent||!event.data||typeof event.data!=='object')return;const data=event.data;
    if(data.type==='demo:set-screen'&&['entry','play'].includes(data.screen)){if(state.screen===data.screen&&!state.paused&&!state.zoom)return;state.screen=data.screen;state.paused=false;state.zoom=null;render();}
    else if(data.type==='demo:set-question'){const index=questions.findIndex(q=>q.id===data.question);if(index>=0){if(index===state.index&&!Object.keys(state.answers).length&&!state.paused&&!state.zoom)return;state.index=index;reset();}}
    else if(data.type==='demo:reset'){state.index=0;state.screen='entry';cues.clear();reset();}
  });
  window.addEventListener('resize',()=>{gate();clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(rotated())return;if(state.zoom)paintZoom();if(state.screen==='play')paginate();},100);});
  document.addEventListener('visibilitychange',()=>app.classList.toggle('paused',document.hidden||state.paused));
  window.__DEMO__={getState:()=>JSON.parse(JSON.stringify(state)),variant};render();
})();
