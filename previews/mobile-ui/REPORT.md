# 모바일 UI 비교 검증 기록

검증 대상은 A·B·C의 타이틀·문제풀이와 공통 비교 셸입니다. 결과 수치와 세부 검사 목록은 아래 자동 기록 파일을 기준으로 합니다.

| 근거 | 기록된 결과 |
| --- | --- |
| [audit.json](reports/audit.json) | 2026-11-03, `file://; Edge headless`. `checks` 194개, `pages` 151, `integrityChecks` 48, `errors` 0, `failures` 0 |
| [http-audit.json](reports/http-audit.json) | HTTP의 3개 시안 시작·채점·해설, 셸 동기화·초기화, 실제 저장 키 보존, 음성·서비스 워커 요청 없음, 외부 요청 없음, 프로덕션 캐시 제외 항목 모두 `true`. `errors` 0 |
| [ASSETS.json](ASSETS.json) | 네 문항 ID, 입력 파일 해시, 재사용 자산 경로·용량·해시, 런타임 의존 범위 |
| [visual-review.json](reports/visual-review.json) | 독립 캡처 검토 `ship`, 지적 0건, 검토 범위와 한계 |
| [contrast.json](reports/contrast.json) | 선언된 단색 텍스트·배경 6쌍의 대비 5.71–13.35 : 1. 이미지 배경·비활성화된 조작 제외 |
| [design-detector.json](reports/design-detector.json) | 정규식 대체 검사 결과 `[]` |

## 자동화가 확인한 범위

[파일 검사 스크립트](../../scripts/mobile-ui-compare-audit.mjs)는 667 × 375, 844 × 390, 915 × 364, 1024 × 768에서 세 시안의 타이틀·문제풀이 경계를 확인했습니다. 화면 밖 요소, 영역 넘침, 버튼 겹침, 깨진 이미지, 최소 조작 높이, 본문 computed 글자 크기, 저장소 호출을 검사합니다.

667 × 375에서는 세 시안 × 네 문항의 지문·답안·해설·자료를 모든 쪽에 걸쳐 확인하고, 분할 전후 텍스트와 이미지 경로를 대조했습니다. 151쪽은 이 순회에서 확인한 페이지 합계이며 화면 종류 수가 아닙니다. 48회 무결성 검사는 3개 시안 × 4개 문항 × 4개 탭에 해당합니다.

정답 선택 후 해설 이동·답 잠금, A의 오답 반응과 재선택 차단, 다음 문항, 일시정지·복귀, 세로 회전 안내·입력 차단, 크기 변경 후 읽던 위치, 초기화, 영어 밑줄, 자료 확대, 모션 감소 설정, 셸의 화면·문항·크기 제어와 시안 탭을 검사했습니다. 개별 항목은 [스크립트](../../scripts/mobile-ui-compare-audit.mjs)와 [JSON](reports/audit.json)에서 확인할 수 있습니다.

[HTTP 검사 스크립트](../../scripts/mobile-ui-http-audit.mjs)는 [로컬 HTTP 주소](http://127.0.0.1:4176/previews/mobile-ui/)에서 실행했습니다. `siyeon-exam.v1`, `siyeon-exam.ui.v1`의 localStorage와 `siyeon-exam.motion.v1`의 sessionStorage에 넣은 sentinel이 보존됨을 확인했습니다. 요청 기록의 외부 URL·음성·`sw.js` 요청 여부와 생성된 `dist/sw.js`의 비교 폴더 제외 여부도 확인했습니다.

## 독립 시각 검토

[독립 UI 검토 기록](reports/visual-review.json)의 결과는 **ship**입니다. 아래 타이틀·문제풀이·비교 셸 캡처 11장에 대한 시각 검토이며 지적 사항은 없습니다.

이 검토는 정적 캡처에 대한 판단입니다. 클릭 기능, computed CSS 값, 제공되지 않은 정답·오답 상태의 시각 검증은 이 검토 범위에 포함하지 않습니다. 기능과 computed 값에 대한 근거는 위 자동화 결과로 구분합니다.

| 캡처 | A | B | C |
| --- | --- | --- | --- |
| 타이틀 844 × 390 | [A](reports/a-entry-844x390.png) | [B](reports/b-entry-844x390.png) | [C](reports/c-entry-844x390.png) |
| 문제풀이 844 × 390 | [A](reports/a-play-844x390.png) | [B](reports/b-play-844x390.png) | [C](reports/c-play-844x390.png) |
| 문제풀이 667 × 375 | [A](reports/a-play-667x375.png) | [B](reports/b-play-667x375.png) | [C](reports/c-play-667x375.png) |

비교 셸: [1440 × 1000](reports/comparison-1440x1000.png), [844 × 390](reports/comparison-844x390.png). 추가 자동 캡처: [회전 안내 390 × 844](reports/rotation-390x844.png). 회전 안내 캡처는 위 11장 독립 검토의 수에 포함하지 않습니다.

## 한계

- 정적 디자인 탐지기는 파서 의존성이 없어 정규식 대체 경로로 실행됐습니다. 결과 0건은 완전한 파서 검사나 결함 없음의 증거가 아닙니다.
- 두 자동 보고서의 `physicalDevice`는 `false`입니다. 실제 휴대전화·태블릿, 터치 도달성, 모바일 브라우저별 동작은 검증하지 않았습니다.
- 독립 시각 검토는 제공된 11장에 한정합니다. 모든 문항·모든 쪽·모든 피드백 상태를 시각 검수한 결과로 해석하지 않습니다.
- 대비 계산은 [contrast.json](reports/contrast.json)에 기록한 단색 조합만 대상으로 합니다. 이미지·그라데이션 위 글자, 비활성 조작과 전체 화면의 접근성 적합성을 검증한 결과는 아닙니다.
- 저장소 보존 검사는 위 세 키와 검사 흐름을 대상으로 합니다. 전체 실제 앱의 저장·복원 동작을 재검증한 결과는 아닙니다.

재현 명령과 실행 조건은 [README.md](README.md)의 검사 재현 절차를 따릅니다.
