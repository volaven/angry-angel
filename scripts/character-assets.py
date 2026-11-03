from pathlib import Path
import json,hashlib
from PIL import Image
root=Path.cwd().resolve();rigs=json.loads(Path('src/character-rigs.json').read_text());used={v[k]['src'] for v in rigs.values() for k in ['body','head','arm']}
folder=(root/'public/characters/rigs').resolve()
assert folder.is_relative_to(root)
for p in folder.glob('*.webp'):
 if '/characters/rigs/'+p.name not in used:p.unlink()
files=[]
for src in sorted(used):
 p=root/'public'/src.lstrip('/');im=Image.open(p);a=im.getchannel('A');files.append({'runtime':src,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'size':list(im.size),'alpha32Bounds':a.point(lambda x:255 if x>=32 else 0).getbbox(),'source':'assets/character-v2/'+p.stem+'.png'})
Path('assets/character-v2/manifest.json').write_text(json.dumps({'tool':'image_gen.imagegen','date':'2026-11-03','version':2,'states':rigs,'runtimeFiles':files,'runtimeBytes':sum(f['bytes'] for f in files),'notes':['Original portraits and generation attempts retained.','Three shared full-body layers prevent proportions changing between reactions.','Head / closed-eye head / arm use source rectangles with registered destination positions; no text baked into artwork.','Rejected atlas body cells are not rendered.','Source PNG to lossless WebP conversion only; compositing and motion are runtime Canvas operations.']},ensure_ascii=False,indent=2),encoding='utf-8')
print(len(files),sum(f['bytes'] for f in files))
