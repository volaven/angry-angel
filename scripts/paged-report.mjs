import {readFileSync,writeFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const ui=read('reports/paged-audit.json'),flow=read('reports/paged-flow-audit.json'),offline=read('reports/offline.json'),assets=read('assets/ui-v3/manifest.json');
const qa=ui.checks.filter(c=>c.q),pages=qa.reduce((s,c)=>s+c.pages,0),worst=Math.max(...ui.checks.filter(c=>c.ratio!==undefined).map(c=>c.ratio),0);
const date='2026-11-02';
const text=`# 스크롤 없는 화면 · 이미지 UI 검증

검증일: ${date}. 기존 화면/저장 계약을 확장했으며 APK는 만들지 않았다.

## 구현 결과

- 시작·학습 메뉴·과목·연도·의상 선택은 고정 화면. 관리·기록·복습·결과·검수 화면은 측정 기반 페이지.
- 문제는 지문 / 답안 / 해설 / 자료, 모의고사는 문항 이동 탭 추가. 해설은 채점 후 열리고 다음 문제는 직접 선택한다.
- 가로 70:30, 모바일 세로 작은 초상과 본문. 낮은 가로 휴대전화는 페이지 이동·주요 동작을 한 줄로 배치한다.
- 실제 글꼴·소수점 너비·가용 높이로 문장/줄을 나눈다. DOM Range로 밑줄·강조와 공백을 보존한다. 긴 보기 마지막 조각만 답 선택이 가능하다.
- 큰 자료는 전체 보기와 겹치는 확대 구역으로 확인한다. 외부 PDF는 앱 페이지 규격의 예외다.
- UI 저장에 실행/문항/탭별 블록·문자 위치를 추가한다. 회전 시 해당 위치를 포함하는 페이지로 복원한다. 기존 학습 저장·정답·호감도·음성 제거 상태는 유지했다.

## 이미지

내장 image_gen.imagegen으로 배경·메뉴 그림 4종·문서 프레임·대화 프레임·버튼을 제작했다. 시연 기존 12개 원본은 그대로다.
최초 버튼의 투명 여백 문제를 고친 v2를 사용한다. 폐기 버전 원본은 보존하되 런타임에서 제외했다.

| 자산 | 앱 경로 | 용량 |
|---|---|---:|
${assets.map(a=>`| ${a.id} | ${a.runtime} | ${a.bytes.toLocaleString()} B |`).join('\n')}

원본/런타임 해시: [manifest](../assets/ui-v3/manifest.json). 제작 지시: [generation](../assets/ui-v3/generation.md).
사용 이미지 ${assets.length}종 합계 ${(assets.reduce((s,a)=>s+a.bytes,0)/1024).toFixed(1)} KiB.

## 검증 근거

- 단위 검사 14개 통과: 기존 판정/보상/잠금과 새 UI 저장·8종 자산 체크섬.
- ${ui.sizes.length}개 크기의 화면/버튼/문서 및 내부 스크롤, 넘침·잘림·깨진 이미지·중첩 버튼 검사 통과.
- 출제 가능 80문항을 667×375, 390×844, 1440×900에서 모두 검증: ${qa.length}개 문항/크기 조합, 본문·보기·해설 ${pages}페이지. 각 원본 블록과 분할된 문자열을 정확히 재조합해 누락·중복을 검사했다.
- 전체 내용 검사 ${ui.contentChecks}건. 읽던 페이지/탭 및 답안 새로고침 복원과 일시정지의 읽기 시간 정지 확인.
- 3단계 오답 반응, 정답 초기화, 복습 해결/재등록, 회전 위치, 자료 확대 ${flow.zoomTiles}개 페이지, 모의고사 답 수정/해설 비공개/제출 중복 방지/시간 초과, 빠른 응답 잠금 검증.
- 가장 긴 오답 대사를 연출 켜기/줄이기 두 상태와 12개 크기에서 추가 검사했다. 360px 세로 화면은 대사 길이에 따라 초상 행의 높이를 늘리고 본문을 다시 페이지로 나눈다. [대사 영역 검사](dialogue-layout-audit.json).
- 오프라인 새로고침, 답안·탭 복원, 8개 UI 이미지·캐릭터·문제 자료 및 원본 PDF 로딩 통과. 음성 요청/음성 캐시 없음.
- 사용자 브라우저의 실제 저장을 수정하지 않고 격리된 Edge 자동화 컨텍스트를 사용했다.

화면 크기: ${ui.sizes.map(s=>s.join('×')).join(', ')}.

원시 근거: [화면/내용](paged-audit.json), [흐름](paged-flow-audit.json), [오프라인](offline-audit.json).
전후 비교: [캡처 모음](ui-v3/index.html). 이전 v2 보고서는 당시 검증 기록이며 현재 동작의 기준은 이 문서다.

## 배포와 제한

- 빌드 캐시 ${offline.cache}, ${offline.files}개 파일, ${(offline.bytes/1048576).toFixed(2)} MiB. APK 미생성.
- Vite의 JS 청크 500 kB 초과 경고는 남아 있다. 문제은행을 포함한 기존 번들 구조이며 빌드 오류는 아니다.
- 실제 휴대전화/태블릿의 터치·키보드·브라우저 도구막대와 실제 푸시 수신은 검증하지 않았다.
- 120문항 검수 잠금 유지. 이번 검증은 지문/해설의 편집상 정확성을 새로 승인하는 작업이 아니다.

## 재현

개발 서버 4176 또는 완성 빌드 서버 4180을 실행한다. npm test, npm run test:ui, npm run test:flow, node scripts/offline-audit.mjs 순으로 실행한다.
UI 검사에 AUDIT_URL 환경변수를 지정하면 해당 서버를 사용한다. 실제 저장을 건드리지 않는 테스트 전용 브라우저다.
`;
writeFileSync('reports/paged-ui.md',text);
const pairs=[['학습 메뉴 · PC','hub-1440x900.png','home-1440x900.png'],['문제 · PC','play-1440x900.png','play-1440x900.png'],['학습 메뉴 · 휴대전화','hub-390x844.png','home-390x844.png'],['문제 · 가로 휴대전화','play-667x375.png','play-667x375.png']];
writeFileSync('reports/ui-v3/index.html',`<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>시연 UI 전후 비교</title><style>body{font:16px sans-serif;background:#172133;color:#fff1dc;margin:32px}h1{font-size:28px}section{margin:36px 0}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}img{width:100%;height:auto}a{color:#eed5a4}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style><h1>시연 · 스크롤 없는 화면</h1><p>왼쪽: 이전 v2 / 오른쪽: 페이지 UI v3. 다른 검증 실행의 비교 캡처로, 진행 기록과 날짜는 동일하지 않을 수 있습니다.</p><a href="../paged-ui.md">검증 보고서</a>${pairs.map(([label,before,after])=>`<section><h2>${label}</h2><div class="pair"><figure><figcaption>이전</figcaption><img src="../ui-v2/${before}"></figure><figure><figcaption>변경 후</figcaption><img src="${after}"></figure></div></section>`).join('')}<h2>새 서고 화면</h2><img src="entry-1440x900.png"><h2>오프라인 복원</h2><img src="offline.png"></html>`);
const inputs=['src/main.ts','src/paged-reader.ts','src/paged-ui.css','src/lesson-view.ts','src/navigation.ts','src/bank.json','src/question-presentations.json'];
writeFileSync('reports/paged-evidence.json',JSON.stringify({date,files:inputs.map(path=>({path,sha256:createHash('sha256').update(readFileSync(path)).digest('hex')})),uiAssetCount:assets.length,offline,physicalDevice:false},null,2));
console.log('Updated paged UI report and comparison gallery');
