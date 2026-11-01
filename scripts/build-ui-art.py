"""Package generated originals without overwriting the source images."""
from pathlib import Path
from PIL import Image
import shutil, json, hashlib
root=Path(__file__).resolve().parents[1]
source=Path('C:/Users/sisio/.codex/generated_images/01a1845a-a6c6-7dd3-b3bb-083ca57c9b84')
items={
 'library':('5b386a61-087b-44b6-8b27-5736231b6812','Quiet cel-anime library, navy ivory burgundy, open center, no characters or text'),
 'assignment':('a59935c1-f116-42a1-ad48-aeb5f7c6ec73','Burgundy assignment folder, ivory pages, brass clip and wax seal, isolated transparent'),
 'books':('a627adf4-2697-4096-90bb-a9146fe1cc41','Three navy and burgundy academic books, ribbon, isolated transparent'),
 'exam':('340b1a90-955b-43a9-b477-e9779ae26c57','Ivory exam clipboard, brass clock, burgundy pen, isolated transparent'),
 'waste':('47047c73-449c-4cf0-bad3-17d9c9f03d71','Navy brass wastepaper basket and crumpled ivory paper, isolated transparent'),
 'frame':('b32aa5b2-92ed-437f-a2db-51db4837dc04','Front-facing ivory document frame, thin double brass rim, burgundy corners, no text'),
 'dialogue':('406f79cb-46e2-4cac-8df8-8253b619bc13','Navy dialogue panel and integrated blank nameplate, antique gold border, no text'),
 'button-v2':('33755f41-f33b-407e-acd5-3797cb7aea5e','Edge-to-edge burgundy leather action plaque, thin straight gold double rim, no transparent padding or text')}
original=root/'assets/ui-v3';runtime=root/'public/ui-v3'
original.mkdir(parents=True,exist_ok=True);runtime.mkdir(parents=True,exist_ok=True)
manifest=[]
for name,(uid,prompt) in items.items():
 src=source/f'exec-{uid}.png';dst=original/f'{name}.png'
 if not dst.exists():shutil.copy2(src,dst)
 im=Image.open(dst).convert('RGBA');size=im.size
 im.thumbnail((1920,1080) if name=='library' else (1024,1024))
 out=runtime/f'{name}.webp';im.save(out,'WEBP',quality=88,method=6)
 manifest.append(dict(id=name,tool='image_gen.imagegen',version='ui-v3',generationBrief=prompt,style='1990s cel anime; crisp dark ink, navy/ivory/burgundy/antique brass; no words, logo or watermark',original=dst.relative_to(root).as_posix(),runtime='/ui-v3/'+out.name,dimensions=size,alphaExtrema=im.getchannel('A').getextrema(),originalSha256=hashlib.sha256(dst.read_bytes()).hexdigest(),sha256=hashlib.sha256(out.read_bytes()).hexdigest(),bytes=out.stat().st_size))
(original/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print('Packaged',len(manifest),'assets;',sum(p.stat().st_size for p in runtime.glob('*')),'bytes')
