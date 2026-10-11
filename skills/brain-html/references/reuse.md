# 독립 실행과 소스 재사용

## 패키지

- `assets/dist/runtime.js`, `styles.css`: esbuild + Tailwind로 미리 빌드. render.py가 HTML 안에 넣는다. CDN, Google Fonts, Next 서버, SQLite, localhost:4100은 불필요하다.
- `assets/runtime/`: 원본 컴포넌트·순수 함수와 독립 실행 어댑터.
- `assets/examples/style-gallery.html`: 실제 다섯 스타일 선택과 동작 예제. 파일 자체만 복사해 열 수 있다.
- `references/original-pages/`: 원본 페이지의 서버 composition 참고. API 키/DB/런타임 계정 데이터는 포함하지 않는다.
- `source-manifest.json`: 추출 시점 원본의 SHA-256과 commit. 이 해시는 수정된 독립 어댑터의 해시가 아니다.
- `build-info.json`: 빌드에 사용한 로컬 의존성 버전.

## 보존한 엔진과 변경점

Brain 카메라/force 레이아웃, Funnel SVG 궤도, Globe Canvas 구면 투영, Persona SVG 형상을 그대로 재사용했다. `entry.tsx`는 독립 shell과 데이터 주입/모드 라우터다. 원본의 업무용 버튼과 서버 데이터 생산자는 복제하지 않았다.

Next dynamic/link를 로컬 React 어댑터로 대체했다. Brain 검색은 HTML에 포함된 memory만 조회하는 component-local 어댑터다. Funnel 연락 이력 서버 조회는 unavailable 상태를 반환한다. POST는 405로 막는다. Globe coastline JSON은 번들에 포함했다. 원본 인물명과 브랜딩 그림은 기본 도형/비어 있는 담당자 맵으로 바꿨다. 이 결과를 원본 앱의 실시간 연결판이라고 설명하지 않는다.

## 소스 수정 후 빌드

기본 생성에는 Node 설치가 필요 없다. 소스 수정이 필요할 때 패키지를 작업 폴더에 복사한다. 이미 관련 의존성이 있는 프로젝트 디렉터리를 build.mjs 두 번째 인자로 넘긴다.

```bash
node /path/to/copied-brain-html/scripts/build.mjs /path/to/project-with-node_modules
python3 /path/to/copied-brain-html/scripts/render.py --mode brain --data content.json --output output.html
```

필요한 패키지는 React/ReactDOM 18, d3-force 3, lucide-react, zod 3, esbuild, postcss, Tailwind 3이다. 정확한 스냅샷 버전은 build-info.json을 사용한다. 없다면 격리된 빌드 폴더에 package.json을 만들어 일반 패키지 레지스트리로 설치한다. 사용자의 기존 프로젝트 패키지 버전을 함부로 바꾸지 않는다. 빌더는 runtime/styles와 의존성 라이선스만 갱신한다. 생성기는 출력 파일을 덮어쓰지 않으므로 새 파일명 또는 본인이 만든 임시 출력만 교체한다.

## 기존 앱에 통합

필요한 컴포넌트와 import closure를 복사하고 `@/` alias를 대상 프로젝트에 맞춘다. Next에서는 원본 Next import를 유지해도 된다. CSS 변수는 해당 페이지 wrapper에 스코프를 주며 global CSS 전체를 기존 앱에 덮어쓰지 않는다. 모션 keyframes·유틸리티와 관련 토큰만 옮기거나 대상 CSS 모듈로 옮긴다. 대상 프레임워크가 React가 아니면 같은 수학/상태 모델을 이식한다. screenshot으로만 대체하지 않는다.

출력 위치를 사용자가 정했으면 따른다. 없다면 현재 작업 폴더 안의 새 `brain-html-output/<task>/`에 만든다. 스킬 설치 폴더 안에 새 사용자 결과물을 쌓지 않는다.

## 검증

Brain 카메라를 수정하면 `node scripts/test-camera.mjs /path/to/project-with-node_modules`로 전체 트리 유지·화면 크기별 여백·코어 확대의 회귀 테스트를 실행한다(TypeScript 필요). [트리 화면 맞춤](tree-framing.md)의 브라우저 항목도 확인한다. 런타임 소스 수정은 `assets/dist`를 재빌드하고 갤러리를 새로 생성해야 HTML에 반영된다.

`python3 scripts/verify.py`는 생성/입력 보존/스크립트 이스케이프/설치 무결성의 빠른 검증이다. UI 검증은 별도다. 선택 모드에 대해 browser에서 렌더, 의미 있는 조작 1개 이상, 390px 폭에서 overflow, reduced-motion, console error를 확인한다. CSS나 JS를 바꾸면 페이지를 새로고침한다.

글로벌 설치는 `python3 scripts/install.py`. 기존 경로가 있으면 덮어쓰지 않는다. 설치 전에 경로/내용을 확인하고 사용자 의도에 맞게 업데이트한다. UI가 새 스킬을 즉시 재검색하지 않으면 새 세션에서 `$brain-html`을 호출하도록 알린다.
