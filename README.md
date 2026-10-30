# 합격하시든가, 쓰레기로 남으시든가

성인 공무원 수험생용 독립 웹앱. 프로젝트 상태: **구현·콘텐츠 검수 진행 중**.
원본 매쓰히어로즈 프로젝트는 수정하지 않으며 저장 키는 `siyeon-exam.v1`이다.

## 실행

```powershell
npm ci
npm run dev
```

개발 화면: http://127.0.0.1:4176

```powershell
npm run build
npx vite preview --host 127.0.0.1 --port 4180 --strictPort
```

오프라인 설치를 포함한 빌드 화면: http://127.0.0.1:4180
첫 온라인 방문에서 서비스워커 설치가 완료되어야 오프라인으로 사용할 수 있다.
`dist`는 HTTP/HTTPS 정적 서버에 배포한다. 파일을 더블클릭하는 `file://` 방식은 지원하지 않는다.

## 현재 제공 범위

- 2024 가형·2025 나형 일반행정 5과목 200문항 원문/정답 연결.
- 국어·영어 80문항은 해설과 보기별 설명을 추가하여 출제 가능.
- 한국사·행정법총론·행정학개론 120문항은 검수 대기이며 출제하지 않는다.
- 모의고사 흐름·답안 수정·시간 제한·일괄 채점은 구현했고 합성 테스트로 검증했다. 연도별 100문항 검수가 끝날 때까지 실제 기출 모의고사 시작은 잠긴다.
- 과목 학습, 오답 보관소, 일일 과제, 이어하기, 독설/순화 텍스트, 빠른 응답 감지, 호감도와 의상 해금.
- 기본 표정 8종과 보상 의상 4종. 앱용 WebP와 얼굴·손·실루엣 기준점 등록.
- 2026-10-30 요청에 따라 음성 재생·음성 조작을 제거했다. 기존 음성 원본은 보존하지만 배포 빌드·오프라인 캐시에서는 제외한다.

## 출처와 검수

첨부 ZIP의 2025 PDF와 2024 HWP를 보존했다. 2024 PDF와 최종정답은 공개 문서 사본을 확보하고 공식 게시물 메타데이터와 비교했다. 공식 서버의 첨부 직접 다운로드가 실패했으므로 **파일 크기 일치가 공식 원본의 암호학적 동일성 증명은 아니다.**

`sources/official-provenance.json`, `sources/mirror-provenance.json`, `reports/content-status.json`을 함께 확인한다. 답을 모델 추론으로 정하지 않고 최종정답 문서에서 읽었다. 해설은 별도 작성했다. 법령 해설과 시험 이후 개정 여부 확인은 남아 있다.

문제은행 재생성 시 `scripts/build_bank.py` 후 `scripts/review_english_2025.py`, `scripts/review_english_2024.py`, `scripts/review_korean_2024.py`, `scripts/apply_reviews.py` 순으로 실행한다. 2025 국어 해설은 `sources/explanations.json`에 보존되어 있다.

## 푸시 서버

Node 22 이상이 필요하다. 개발 중에는 별도 터미널에서 `cd server; npm ci; node index.mjs`를 실행한다. Vite는 `/push-api`를 4186 포트로 전달한다.

VAPID 키 생성:

```powershell
cd server
npx web-push generate-vapid-keys --json
```

키를 프로젝트 루트 `.env`에 설정한다(`.env.example` 참고). 비밀키는 브라우저 코드에 넣지 않는다.

```powershell
docker compose up --build -d
```

운영에서는 HTTPS 서버의 `/push-api/`를 `127.0.0.1:4186`으로 프록시하고 나머지는 `dist`를 제공한다. SQLite는 Docker 볼륨에 보관된다. 실제 VAPID 발송·휴대전화 수신·Docker 실행은 검증하지 않았다. 로컬 HTTP API와 예약 계산만 검증했다.

## 검증

```powershell
npm test
node --test server/scheduler.test.mjs
node scripts/server-audit.mjs
npm run test:ui
npm run test:flow
node scripts/offline-audit.mjs
```

UI 검사는 설치된 Edge를 사용한다. 개발 서버 4176, 빌드 서버 4180, 푸시 서버 4186을 먼저 실행한다. 스크린샷은 `reports/screens`에 저장된다. 실제 휴대전화 시험은 별도로 필요하다.

APK는 생성하지 않았다.


## 화면 이관 (2026-10-30)

시작 → 학습 메뉴 → 과목/연도/복습 → 문제 → 수동 다음 → 결과 흐름을 분리했다.
화면 계약은 `src/ui-contract.ts`, 메뉴 복원은 `src/navigation.ts`, 보기 입력은 `src/activity-input.ts`, 문항 표현은 `src/presentation.ts`에서 관리한다.
학습 저장 키 `siyeon-exam.v1`은 그대로 사용하고 메뉴 위치만 `siyeon-exam.ui.v1`에 별도로 보관한다.
가로 화면은 문제 70% / 시연 30%, 휴대전화 세로는 단일 열이다. 실전 모의고사 종료 시각은 일시정지해도 바뀌지 않는다.

80문항의 원본 문제은행은 수정하지 않고 `src/question-presentations.json`으로 표시용 지시문·본문·답 카드·자료를 보정한다.
자료 생성은 `.venv/Scripts/python.exe scripts/build-presentations.py`, 원문 연결 검사는 `scripts/presentation-source-audit.py`를 실행한다.
기존 한국사·법·행정학 120문항과 모의고사 시작은 계속 잠겨 있다.

검증 보고서와 화면별 대응표: [reports/ui-migration.md](reports/ui-migration.md).
전후 캡처: [reports/ui-v2/index.html](reports/ui-v2/index.html).
12개 규격의 DOM 측정은 `reports/ui-contract-audit.json`, 오프라인 확인은 `reports/offline-audit.json`에 기록한다.
실제 휴대전화/태블릿 검증과 전체 문항의 사람에 의한 교정은 별도 남아 있다.
