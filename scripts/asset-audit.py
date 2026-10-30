import pathlib,json,hashlib,wave,struct,html
from PIL import Image
r=pathlib.Path(__file__).resolve().parents[1];rows=[]
for item in json.loads((r/'assets/audio/manifest.json').read_text(encoding='utf8')):
 p=r/'public/audio'/f"{item['id']}.wav"
 with wave.open(str(p),'rb') as w:
  count=w.getnframes();sr=w.getframerate();channels=w.getnchannels();raw=w.readframes(count);samples=struct.unpack('<'+'h'*(len(raw)//2),raw)
 peak=max(abs(x) for x in samples);assert sr==22050 and channels==1 and peak>100 and peak<32767
 rows.append({'id':item['id'],'duration':count/sr,'sampleRate':sr,'channels':channels,'peak':peak,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'listening':'pending'})
(r/'reports/audio-audit.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')
script=json.loads((r/'assets/audio/script.json').read_text(encoding='utf8'))
page='<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>시연 핵심 음성 검수</title><style>body{max-width:960px;margin:30px auto;padding:20px;background:#eee9e0;color:#252b3b;font-family:sans-serif}article{background:#fffaf2;border:1px solid #c9bba5;padding:20px;margin:16px 0}audio{width:100%}</style><h1>시연 핵심 음성 24개</h1><p>Qwen3-TTS · Sohee · 발음 청취 검수 대기. 자동 신호 검사만 통과한 생성본입니다.</p>'
for a in script:page+=f'<article><b>{html.escape(a["id"])}</b><p>{html.escape(a["text"])}</p><audio controls preload="none" src="/audio/{a["id"]}.wav"></audio></article>'
page+='<script>document.addEventListener("play",e=>document.querySelectorAll("audio").forEach(a=>{if(a!==e.target)a.pause()}),true)</script></html>'
(r/'public/voice-review.html').write_text(page,encoding='utf8')
assets=[]
for p in (r/'public/characters').glob('*.png'):
 im=Image.open(p);assets.append({'id':p.stem,'file':str(p.relative_to(r)),'width':im.width,'height':im.height,'mode':im.mode,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'tool':'OpenAI built-in imagegen','identityReference':'idle.png','style':'1990s cel anime adult librarian'})
(r/'assets/character-manifest.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2),encoding='utf8')
print(len(rows),'audio files checked;',len(assets),'character assets registered')
