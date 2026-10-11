# 검증 기록 — 2026-10-10

## 2026-10-12 · 트리 화면 맞춤 갱신

- DVERSE `/brain`에서 확인한 상단 기술 노드 잘림 수정을 독립 런타임으로 이식했다. 노드 선택 시 전체 트리 유지, 실제 SVG 크기 관찰, 전체 화면 재연결, 모바일 SVG 최소 높이를 반영했다.
- `scripts/test-camera.mjs`: 노드 선택, 일반/전체/좁은 화면과 이동한 노드의 경계, 코어·기억 확대 회귀 테스트 3개 통과.
- `scripts/build.mjs`: 1,641개 모듈 빌드. 생성용 runtime 및 내장 갤러리 재생성 후 DVERSE `public/brain-html/style-gallery.html`에 동일하게 적용했다.
- Chrome의 `http://localhost:3000/brain-html`에서 Sales 축의 에이전트 및 기술 상세 선택, 일반 보기·전체 화면 진입/종료 시 상단 도구 노드 6개가 캔버스 안에 유지됨을 확인했다.
- 390×844 및 모션 감소 설정에서 트리 화면 맞춤과 가로 넘침 없음 확인. 모바일 SVG 높이 440px. 모션 전체에 대한 신규 정지 감사는 이 변경의 검증 범위가 아니다.
- 기존 샘플 JSON과 원본 추출 해시를 보존했고, 스킬 내 갤러리와 DVERSE 페이지의 파일 동일성을 확인했다. 브라우저 콘솔 오류 없음. 임시 화면 크기·모션 설정 복원.

## 파일과 생성

- skill-creator `quick_validate.py`: `Skill is valid!`
- 독립 runtime TypeScript 검사: 통과.
- command-center `npm run typecheck`: 추출 코드 포함 통과.
- `scripts/verify.py`: 다섯 모드 HTML 생성, 사용자 JSON에 샘플 미혼입, script 종료 문자열 이스케이프, 기존 파일 덮어쓰기 방지, 임시 설치의 전체 파일 동일성 통과.
- Funnel/AdPilot/Personas 샘플을 원본 Zod 스키마로 검증: 통과.

## 브라우저

`assets/examples/style-gallery.html`을 별도 loopback 서버에서 Chrome으로 열었다. 원본 앱 서버의 API를 연결하지 않은 상태다.

- Brain: 동심원 그래프, 목록 노드 클릭 시 상세 패널과 카메라 viewBox 변화, 신경망 탭 전환 확인.
- Doctor: 레이더 4개 계층, legend 선택 시 계층 표시 변화, 미터/숫자/진단 코어 확인.
- Funnel: 5단계 flow, 32개 샘플 여정, radial 전환, 단계·유입별 요약 확인.
- AdPilot: 지구본/도시 데이터, 캠페인 필터에 따른 수치 변경, 방향키 회전 확인. 감소된 모션에서 시간차 두 screenshot의 바이트가 동일했고, 방향키 조작 후 화면이 변했다.
- Personas: 다음 페르소나 버튼으로 01/03 → 02/03과 내용/지식망 변경 확인.
- viewport 390×844에서 5개 모드의 document clientWidth와 scrollWidth가 같았다(스크롤바 제외 실제 폭 380px). 브라우저 콘솔 error/warn 0건.
- 임시 viewport 및 reduced-motion emulation은 검증 후 복원했다.

다섯 정지 미리보기는 같은 갤러리를 모션 감소 설정으로 캡처했다. 실제 데이터 API 연결, 원본 업무 실행 버튼, 픽셀 단위 동일성 검사는 이 패키지의 검증 범위가 아니다.
