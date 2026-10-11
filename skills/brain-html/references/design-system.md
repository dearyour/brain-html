# 추출한 디자인과 모션

기준은 command-center의 2026-10-10 소스다. 전체 원본 토큰·keyframes는 `assets/runtime/app/globals.css`, Tailwind 매핑은 `assets/runtime/tailwind.config.ts`에 있다. 글로벌 앱을 다시 탐색할 필요가 없다.

## 기본 시각 언어

| 토큰 | Monolith 값 | 역할 |
|---|---|---|
| `--bg`, `--surface` | `#0a0a0a` | 검정 면, 그래프에 공간을 양보 |
| `--surface-2` | `#141414` | hover/선택된 제어 |
| `--border` / `--border-strong` | `#242424` / `#3a3a3a` | 1px 구조선, 포커스 강조 |
| `--text` / `--text-2` / `--text-3` | `#f2f2f2` / `#9c9c9c` / `#5c5c5c` | 제목 / 보조 / 낮은 우선순위 |
| `--accent` | `#f2f2f2` | 흰 활성 pill, 주 버튼 |
| `--ok` / `--warn` / `--err` | `#2fd36f` / `#ffb000` / `#ff2d3f` | 상태 의미 |
| `--kg-tool` | `#ff2d3f` | Brain 외곽 도구 노드 |

mono 본문과 작은 uppercase eyebrow, 탭/렌즈/목록, 6px 제어·10~12px 패널 모서리를 사용한다. 큰 그래프는 넓은 빈 공간을 가진다. 원본 Brain의 그리드는 SVG 내부 기하이며 기본 테마의 배경 glow 토큰은 `none`이다. 모든 곳에 glow를 넣지 않는다. 중요한 보조 문구는 작은 dim 글씨에 숨기지 않는다.

AdPilot만 검정 `#04070a`, 26px 도트 그리드, `#ff4557` 붉은 액센트, 대기권 radial glow를 쓴다. Personas는 persona의 accent를 지식망/상단 선/조직도에 함께 적용한다.

## 공통 타이밍

| 동작 | 원본 값 |
|---|---|
| 기본 ease | `cubic-bezier(.32,.72,0,1)` |
| 등장 `.rise` | 600ms, y 10px→0, scale .992→1, 90ms stagger |
| 선 그리기 `.draw` | 1.4s, 300ms delay, `pathLength=1` |
| 가로 미터 `.fill` | 1.1s, 왼쪽 origin |
| 세로 막대 `.grow` | .9s, 아래 origin |
| 상태 halo | 2.6s ease-out |
| 퍼널 hub 호흡 | 5.5s ease-in-out |
| 페르소나 전환 | .28s, y 6px→0 |
| 카드 hover | 1px 상승 + border 변화 |

엔진별 RAF는 DOM ref/SVG transform을 갱신한다. 매 프레임 React state로 전체 노드를 다시 렌더하지 않는다. 이벤트/RAF/ResizeObserver cleanup을 유지한다. 감소된 모션에서는 진입 경로 끝 위치와 수치가 즉시 보이고 자동 회전·호흡은 멈춰야 한다. 전체 CSS guard만으로 Canvas가 멈춘다고 가정하지 않는다.

## 크기와 위계

Brain은 높이 약 650~740px 이상인 주 캔버스 + 오른쪽 250~290px 정도의 범례/목록. 좁은 화면에서는 목록을 아래로 이동한다. Doctor는 2:1 주행과 3개 보조 카드 행. Funnel은 넓은 1100 단위 SVG 좌표 공간. AdPilot은 프레임 없는 구체와 떠 있는 통계. Personas는 설명과 큰 지식망이 나란히 있는 2열이며 작은 화면에서 1열로 접힌다.

브라우저에서 긴 한국어 노드명, 아주 적은/많은 노드, 빈 데이터도 확인한다. 시각적 밀도를 얻으려고 실제 문서 수나 성과를 조작하지 않는다.
