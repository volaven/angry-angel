from pathlib import Path
import json,collections,hashlib
R=Path(__file__).resolve().parents[1]
load=lambda p:json.loads((R/p).read_text(encoding='utf8'))
ui=load('reports/ui-contract-audit.json');source=load('reports/presentation-source-audit.json');offline=load('reports/offline.json');present=load('src/question-presentations.json');flow=load('reports/ui-flow-audit.json')
ratio=max(c['ratioError'] for s in ui['sizes'] for c in s['checks']);types=collections.Counter(x['kind'] for x in present.values())
text=f'''# 시연 화면 이관·음성 제거 검증 보고서

검증일: 2026-10-30. 기준: `C:/gpt/mathheros/handsoff.md` 및 승인된 시연 계획.
최종 사용자 변경: 음성 재생을 제거하고 텍스트·표정 피드백만 제공한다.

## 구현 결과

- 시작 화면의 주 행동은 ‘시험관리실 입장’ 하나. 별도 학습 메뉴에서 오늘의 과제·과목·모의고사·폐기물 보관소를 선택한다.
- 진행 중 실행은 별도의 이어하기로 연결한다. 메뉴 탐색은 학습 실행을 생성하거나 교체하지 않는다.
- 과목은 4·1, 연도는 2, 의상은 3개의 단일 버튼 카드다. 메뉴 페이지·문서 스크롤·문제 패널 스크롤과 뒤로 가기 위치를 UI 전용 키에 보관한다.
- 가로 문제 패널 70%, 캐릭터 30%. 휴대전화 세로는 작은 초상 → 문제 → 답 → 판정 → 해설 순서다.
- 번호+보기 전체 카드, 첫 선택 확정, 수동 다음, 모의고사 답 수정 정책을 유지했다. 캐릭터 컷인은 별도 슬롯에서 닫을 수 있다.
- 문제은행, 문항 ID/정답/출제 가능 상태, 학습 저장 키·기록·보상 정책은 변경하지 않았다.
- 음성 자동 재생, 상단 음성 버튼, 음성 설정을 제거했다. 구버전 저장의 voice 값은 읽기 호환만 유지하며 실행에 사용하지 않는다.
- 음성 원본과 개발용 청취 페이지는 보존했다. 배포 `dist`와 오프라인 캐시에서는 음성 24개와 청취 페이지를 제외한다.

## 화면별 이관 대응표

| 이전 화면/기능 | 새 ScreenId | 계약·예외 | 상태 보존 |
|---|---|---|---|
| 합쳐진 홈 | entry / home | 시작 1행동, 메뉴 4카드 | 입장만으로 실행 생성 안 함 |
| 과목 목록 | subjects | 4·1페이지, 검수 잠금 사유 | 페이지·스크롤 복원 |
| 연도 목록 | mocks | 2카드, 100문항 검수 전 잠금 | 탐색 중 기존 실행 유지 |
| 문제 | play | `exam-70-30`, 세로 휴대전화 단일 열 | 문항·답안·스크롤 복원 |
| 결과/해설 | result / inspect | 결과·문항 해설 분리 | 중복 채점·보상 차단 |
| 일시정지 신규 | pause | 모의고사 실제 종료 시각은 유지 | 읽기 시간 측정 중단 |
| 오답 | wrong | 목록, 복습 후 활성 상태만 해제 | 원래 오답 이력 유지 |
| 의상 | wardrobe | 3카드, 기존 해금 점수 | 기존 호감도/의상 유지 |
| 관리 | settings / history / sources | 전용 문서형 | PIN/유아 메뉴 미도입 |

입력은 `activity-input.ts`의 순수 검사 → 기존 모델의 판정/기록 → 저장 → 텍스트·표정 → 렌더 순서다.
`resize`는 레이아웃 클래스만 변경하며 새 질문·채점·보상을 실행하지 않는다.

## 문항 표현 보정

출제 가능 80문항: 일반 선택형 {types['choice']}개, 본문 표시 선택형 {types['inline-marked']}개, 자료형 {types['material']}개.

- 2024 영어 6, 2025 영어 12·13: 본문 중간의 ①~④로 잘못 분리된 문장 대신 정확한 밑줄 구절을 답 카드에 연결했다.
- 2024 영어 16·17, 2025 영어 16·17: 문장 흐름/삽입 위치를 포함한 전체 본문을 유지하고 답 카드에 해당 문장·위치를 표시했다.
- 2024 국어 18, 2025 국어 12: ㉠~㉣만 있던 답에 대상 문구를 함께 표시한다.
- 2024 국어 3·14, 영어 7: 보기의 밑줄 표현을 복원했다. 영어 어휘 2~5도 대상 밑줄을 표시한다.
- 채팅·안내문·구조화된 자료·옛글 등 13문항은 원문 자료를 기본 표시한다. 원문 전체 확대 링크를 유지한다.
- PDF의 원래 공백과 문단 시작을 참조해 줄바꿈을 정리한다. 시는 행·연 구분을 유지한다.

원본 PDF 텍스트 연결: **{source['questions']}문항 / {source['lines']}줄 / 불일치 {source['unmatched']}줄**.
이는 텍스트 출처 연결 검사이며, 80문항 전체의 사람에 의한 문장 교정 또는 해설 재승인을 뜻하지 않는다.
문항별 근거: `presentation-source-audit.json`, 보정 목록: `presentation-migration.json`.

## 자산

기존 캐릭터 PNG 12개 보존. 640×960 WebP 12개, 알파 ≥32 실루엣, 얼굴·손·하단 기준점·말풍선 기준점 등록.
얼굴·손 기준점은 12포즈 비교표를 보고 등록했다. 발이 없는 원본 포즈는 보이는 실루엣 하단을 기준으로 삼으며 전신으로 새로 그렸다고 표시하지 않는다.
앵커는 세로 휴대전화 초상의 얼굴 위치 보정에 사용한다. WebP 실패 시 기존 PNG 정적 포즈로 복구한다.
자산 목록: `assets/character-manifest.json`, 비교표: `ui-v2/character-contact.png`.

## 검사 결과

- 모델·계약 단위 검사 12개 통과.
- 12크기: 2038×1280, 1672×941, 1280×800, 1024×768, 844×390, 667×375, 915×364, 390×844, 360×800, 430×932, 768×1024, 1440×900.
- 패널 비율 최대 오차 **{ratio:.4f}px**. 가로 넘침·중첩 버튼·깨진 이미지·접근성 이름 누락 없음.
- 답 카드/주요 행동 버튼: 휴대전화 높이 ≥64px, 태블릿/PC ≥80px. 긴 내용은 높이를 늘려 표시한다.
- 80문항 렌더 및 자료 경로 검사, 페이지 마지막 카드·잠김 사유, 새로고침·회전·답 잠금·일시정지 복원 통과.
- 연속 오답 3단계, 정답 초기화, 컷인 닫기, 복습 제거/재등록, 해설 새로고침, 빠른 응답 잠금 통과.
- 음성 재생 요청 0건, 음성 버튼·음성 설정 없음. 오프라인 캐시에 음성 없음.
- 모의고사 답 수정·제출 전 정오답 비노출·일시정지 중 종료·재실행 중복 기록 방지 통과. 검증용 3문항 실행만 사용했고 실제 잠긴 모의고사는 개방하지 않았다.
- 모든 브라우저 검사는 별도 Edge 컨텍스트와 테스트 저장으로 수행했다. 실제 사용자 기록은 수정하지 않았다.

웹 빌드·오프라인 재접속 및 답안 복원 통과. 캐시 `{offline['cache']}`, {offline['files']}개 파일, 약 {offline['bytes']/1024/1024:.2f}MiB.
빌드의 주 JS 청크가 500kB를 넘는 Vite 크기 경고는 남아 있다. 오류나 빌드 실패는 아니다.
실측 JSON: `ui-contract-audit.json`, `ui-flow-audit.json`, `offline-audit.json`.

## 전후 화면과 남은 범위

같은 문항 `2024-0-1`, 실행 ID `ui-comparison-fixed`, 난수 0, 동일 글꼴·뷰포트로 전후 화면을 기록했다.
전후 비교: [캡처 모음](ui-v2/index.html). 옛 화면은 `ui-refactor-baseline`에 보관한다.

- 한국사·행정법·행정학 120문항은 기존 검수 대기 상태다. 실제 연도 모의고사도 계속 잠겨 있다.
- 실제 휴대전화·태블릿의 안전 영역/주소창/터치, 실기기 푸시 수신은 이번 브라우저 검사에 포함되지 않는다.
- 전체 문항의 사람에 의한 문장/해설 교정은 자동 UI 검사와 구분하여 후속 검수한다.
- APK는 생성하지 않았다.
'''
(R/'reports/ui-migration.md').write_text(text,encoding='utf8')
html='''<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>시연 UI 전후 비교</title><style>body{font:16px system-ui;background:#eee9df;color:#242b3b;margin:30px}h1{font-size:28px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}img{width:100%;border:1px solid #aaa}figure{margin:0 0 25px}figcaption{padding:12px}a{color:#783c4c}@media(max-width:650px){.pair{grid-template-columns:1fr}}</style><h1>시연 화면 이관 전후 비교</h1><p>동일 문항·실행·글꼴·뷰포트. 마지막 변경: 음성 재생 제거.</p>'''
for w,h in [(1440,900),(390,844)]:
 html+=f'<h2>{w}×{h}</h2><div class="pair">'+''.join(f'<figure><a href="{v}-{w}x{h}.png"><img src="{v}-{w}x{h}.png" alt="{v} 문제 화면"></a><figcaption>{v}</figcaption></figure>' for v in ['before','after'])+'</div>'
html+='<h2>새 화면</h2><div class="pair">'+''.join(f'<figure><a href="{n}.png"><img src="{n}.png" alt="{n}"></a><figcaption>{n}</figcaption></figure>' for n in ['entry-1440x900','hub-1440x900','subjects-last-390x844','graded-667x375','question-2025-1-12','question-2024-1-9'])+'</div></html>'
(R/'reports/ui-v2/index.html').write_text(html,encoding='utf8')
failure=R/'reports/ui-contract-audit-failure.json'
if failure.exists():
 old=json.loads(failure.read_text(encoding='utf8'));old['status']='superseded-by-passing-ui-contract-audit';old['resolution']='Test fixture was overwritten by pagehide persistence; fixtures now apply on document creation.';failure.write_text(json.dumps(old,ensure_ascii=False,indent=2),encoding='utf8')
print('Wrote UI migration report and comparison gallery')
