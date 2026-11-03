"""Encode generated PNG masters as WebP; do not crop, repaint or resize art."""
from pathlib import Path
from PIL import Image
import hashlib, json

root = Path(__file__).resolve().parents[1]
source = root / 'assets/ui-v6'
runtime = root / 'public/ui-v6'
runtime.mkdir(parents=True, exist_ok=True)
uses = {
    'primary-button': '주요 시작·다음 행동 버튼',
    'secondary-button': '보조 버튼·답안 카드·비활성 탭',
    'paper-panel': '문제·관리 패널·메뉴 카드·과목 이름 영역',
    'dialogue-panel': '시연 말풍선·상단 띠·상단 버튼·선택 탭',
}
rows = []
for name, usage in uses.items():
    original = source / (name + '.png')
    output = runtime / (name + '.webp')
    with Image.open(original) as image:
        size = image.size
        image.save(output, 'WEBP', quality=92, method=6)
    rows.append({
        'id': name, 'tool': 'image_gen.imagegen', 'version': 'ui-v6',
        'original': original.relative_to(root).as_posix(),
        'runtime': '/ui-v6/' + output.name, 'dimensions': list(size),
        'sha256': hashlib.sha256(output.read_bytes()).hexdigest(),
        'originalSha256': hashlib.sha256(original.read_bytes()).hexdigest(),
        'bytes': output.stat().st_size, 'usage': usage,
        'processing': 'WebP encoding only; original dimensions and composition preserved',
        'promptRecord': 'button-generation.json' if 'button' in name else 'frame-generation.json',
    })
(source / 'manifest.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'assets': len(rows), 'runtimeBytes': sum(r['bytes'] for r in rows)}, ensure_ascii=False))
