# 서고 이미지 UI

2026-11-04 · 제작 도구: 내장 `image_gen.imagegen` · 버전 ui-v6.

| PNG 원본 | WebP 경로 | 사용처 |
|---|---|---|
| primary-button.png | /ui-v6/primary-button.webp | 문제 풀기·다음 문제·이어하기·주요 행동 |
| secondary-button.png | /ui-v6/secondary-button.webp | 답안 카드·일반 탭·페이지 이동·보조 조작 |
| paper-panel.png | /ui-v6/paper-panel.webp | 문제·설정·결과 패널·메뉴 카드·과목 이름 영역 |
| dialogue-panel.png | /ui-v6/dialogue-panel.webp | 시연 말풍선·상단 띠·상단 조작·선택한 탭 |

전체 제작 프롬프트와 생성 원본 경로는 [button-generation.json](button-generation.json), [frame-generation.json](frame-generation.json)에 보관한다. [manifest.json](manifest.json)은 크기·사용처·SHA-256·앱 용량을 기록한다.

WebP 4개 합계 309,840바이트. PNG 원본을 보존하며 `scripts/build-ui-skin.py`는 크기·구도를 바꾸지 않고 WebP 형식으로 인코딩한다. 원본에 글자나 번호를 합성하지 않았다. 실제 문구와 입력은 HTML이다.

`src/image-ui.css`가 고정 모서리 9분할 이미지를 가상 요소에 표시하므로 이미지 파일 자체는 클릭을 가로채지 않는다. 기존 캐릭터·서고·과목 그림은 그대로 사용한다.
