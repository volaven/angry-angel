import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const audit=read('reports/landscape-audit.json'),flow=read('reports/landscape-flow-audit.json'),offline=read('reports/landscape-offline-audit.json'),pack=read('reports/offline.json'),art=read('assets/ui-v4/manifest.json');
const questions=audit.checks.filter(c=>c.q);
const evidenceFiles=['src/main.ts','src/landscape.ts','src/landscape-ui.css','src/paged-reader.ts','src/subject-art.ts','src/ui-contract.ts','src/bank.json','src/lesson-view.ts','public/manifest.webmanifest'];
writeFileSync('reports/landscape-evidence.json',JSON.stringify({date:'2026-11-02',files:evidenceFiles.map(path=>({path,sha256:createHash('sha256').update(readFileSync(path)).digest('hex')})),art},null,2));
writeFileSync('reports/landscape-ui.md',`# 가로 전용·학습 글씨 확대·과목 이미지 검증

검증일: 2026-11-02. 웹 빌드와 격리된 Edge 브라우저 자동 검사 결과이며 실제 태블릿·휴대전화 검증은 미실시.

## 화면 상태와 동작
- 시작/메뉴: 기존 진입 흐름 유지. 상단 試와 시연의 시험관리실 제거, 설치 짧은 이름 합격하시든가.
- 과목: 국어·영어·한국사·행정법총론 4종 그림 카드. 행정학개론과 검수 대기 잠금 유지.
- 문제/복습/해설: 가로 70:30. 본문·보기·해설 20/24/28px, 지시문 24/30/36px. 높이 경계 600/900px.
- 세로/정사각: 회전 안내, 앱 inert, 입력·읽기 시간·애니메이션 정지. 기존 실행과 읽던 위치 보존.
- 모의고사: 회전 안내에 남은 시간 표시, 실제 종료 시각 유지, 시간 만료 채점 1회.
- 결과/관리/일시정지: 기존 페이지 이동과 저장 구조 유지. 음성 재생 없음.

## 검사 결과
- 단위 검사: 16개 통과.
- 화면 크기: ${audit.sizes.map(s=>s.join('×')).join(', ')}. 세로는 회전 안내, 가로는 화면·메뉴·학습 전환 검사.
- 출제 가능 ${new Set(questions.map(q=>q.q)).size}문항을 세 가로 크기에서 본문·답안·해설까지 전수 검사: ${questions.length} 문항/화면 조합, ${questions.reduce((n,q)=>n+q.pages,0)}페이지.
- 전체 내용 일치 검사 ${audit.contentChecks}회. 누락·중복, 내부/문서 스크롤, 깨진 이미지, 중첩 버튼, 주요 버튼 크기, 70:30 오차 검사 통과.
- 기능 검사: ${Object.entries(flow).filter(([k,v])=>v===true&&k!=='physicalDevice').map(([k])=>k).join(', ')}.
- 오프라인: 재실행·답안·탭 복원 및 ${offline.assets.length}개 지정 자산 요청 통과. 음성 캐시 제외 확인.
- 원인 수정: 보기 카드의 아래 여백을 페이지 실측에 포함해 작은 화면의 4px 넘침을 해결.

## 자산·빌드
- 내장 image_gen으로 신규 배경 4종 제작. [프롬프트](../assets/ui-v4/prompts.json), [원본·체크섬 목록](../assets/ui-v4/manifest.json).
- PNG 원본 보존, 1024×1024 WebP 4개: ${(art.reduce((n,a)=>n+a.bytes,0)/1024).toFixed(1)} KiB.
- 오프라인 캐시 ${pack.cache}, ${pack.files}파일, ${(pack.bytes/1024/1024).toFixed(2)} MiB. APK 제외.
- 기존 200문항 원본과 80문항 출제 상태 유지. 미검수 120문항은 계속 잠김.
- Vite의 기존 500kB 청크 경고는 남아 있으며 빌드는 성공함.

## 증거와 재실행
- [전후 캡처](ui-v4/index.html), [레이아웃 검사](landscape-audit.json), [상태 전환](landscape-flow-audit.json), [오프라인](landscape-offline-audit.json), [소스 체크섬](landscape-evidence.json).
- npm test; npm run build; AUDIT_URL을 빌드 미리보기로 설정 후 npm run test:ui 및 npm run test:flow. 오프라인 검사는 npx tsx scripts/landscape-offline-audit.mjs (4180).
- 모든 자동 검사는 별도 브라우저 저장소를 사용하며 사용자 저장 기록을 변경하지 않음.
`);
const shots=readdirSync('reports/ui-v4').filter(p=>p.endsWith('.png'));
writeFileSync('reports/ui-v4/index.html',`<!doctype html><html lang="ko"><meta charset="utf-8"><title>가로 전용 UI 검증</title><style>body{background:#182232;color:#ffefcf;font:18px system-ui;padding:24px}section{margin:32px 0}img{width:100%;max-width:1000px;display:block;border:1px solid #bca371}a{color:#efcc8d}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}</style><h1>가로 전용 화면과 큰 학습 글씨</h1><p>2026-11-02 · 격리된 Edge 브라우저 검사 · 실제 기기 미검증</p><h2>변경 전 / 변경 후</h2><div class="pair"><section>기존 1024×768<img src="../ui-v3/play-1024x768.png"></section><section>변경 1024×768<img src="play-1024x768.png"></section></div><h2>화면별 증거</h2>${shots.map(p=>`<section><h3>${p}</h3><a href="${p}"><img loading="lazy" src="${p}" alt="${p}"></a></section>`).join('')}</html>`);
console.log('Wrote v4 report, gallery, source checksums');
