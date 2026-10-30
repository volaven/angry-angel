from pathlib import Path
from PIL import Image
import json,hashlib
R=Path(__file__).resolve().parents[1];out=R/'public/characters/runtime';out.mkdir(exist_ok=True)
records=json.loads((R/'assets/character-manifest.json').read_text(encoding='utf8'))
anchors={
 'idle':([.50,.15],[.61,.49]),'question':([.54,.17],[.30,.12]),
 'sigh':([.50,.12],[.65,.18]),'contempt':([.51,.13],[.60,.44]),
 'ignore':([.53,.15],[.64,.46]),'correct':([.51,.14],[.74,.26]),
 'encourage':([.50,.11],[.43,.36]),'blush':([.51,.15],[.62,.48]),
 'history-idle':([.50,.13],[.59,.40]),'history-blush':([.51,.12],[.59,.40]),
 'english-idle':([.52,.14],[.62,.46]),'english-blush':([.50,.14],[.59,.43])}
for r in records:
 im=Image.open(R/Path(r['file']));bounds=im.getchannel('A').point(lambda a:255 if a>=32 else 0).getbbox();x0,y0,x1,y1=bounds
 # Anchors are normalized to the source canvas. Feet use the visible lower silhouette baseline.
 face,hand=anchors[r['id']]
 r.update({'runtime':f'/characters/runtime/{r["id"]}.webp','version':'ui-v2','silhouette':{'threshold':32,'bounds':list(bounds)},'anchors':{'face':face,'foot':[(x0+x1)/2/im.width,y1/im.height],'bubble':[.50,.76],'hand':hand},'anchorStatus':'alpha-measured silhouette; face/hand visually registered from 12-pose contact sheet','baselineType':'visible lower silhouette; cropped original poses do not contain full feet','sourcePreserved':True})
 im.resize((640,960),Image.Resampling.LANCZOS).save(out/(r['id']+'.webp'),quality=90,method=6)
 r['runtimeSHA256']=hashlib.sha256((out/(r['id']+'.webp')).read_bytes()).hexdigest()
(R/'assets/character-manifest.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf8')
(R/'src/character-slots.json').write_text(json.dumps({r['id']:{'file':r['runtime'],'anchors':r['anchors'],'bounds':r['silhouette']['bounds']} for r in records},indent=2),encoding='utf8')
print('Runtime WebP:',len(records))
