# 모드별 엔진 안내

각 경로의 루트는 `assets/runtime/`이다. 선택한 모드만 읽는다. 원본 서버 페이지의 배치 참고는 `references/original-pages/<mode>.tsx`이며 직접 실행용은 아니다.

## Brain — 동심원 관계 + 포커스

- `components/BrainGraphView.tsx`: 방사형/신경망 탭, 축 필터, lazy loading.
- `components/KnowledgeGraph.tsx`: 실제 원본의 큰 엔진. SVG 880×600, d3-force, 범례/디렉터리, 5개 링, 중앙 문서 코어, 부서 트리 확장, 휠 전환, 카메라 보간, pan/zoom, fullscreen, 상세 패널.
- `lib/knowledge-graph.ts`: `self → team → task → employee/person → tool` 노드/엣지 계약. 원본 순수 builder는 일부 부서명에 색을 매핑하므로 standalone `entry.tsx`가 사용자 축 색을 다시 적용한다.
- `lib/tree-layout.ts`: `radialRestLayout`, `focusWheel`, `wheelStageGeom`, `shortestAngleDelta`, `branchPath`. 원형 그래프를 키우는 것만으로 포커스 효과를 대체하지 않는다. 선택한 축이 올라오고 다른 축은 휠처럼 회전하는 구조다.
- `lib/memory-core.ts`: 중앙 128개 샘플 메모의 유기적 군집, 2D 투영, `cameraRect`/`lerpRect`. 실제 메모가 있으면 그 노드·엣지를 넣는다.
- `components/NeuralGraph.tsx`, `lib/neural-layout.ts`: 수평 계층 네트워크, 청록/적색 다중 베지어 strand, hover 연관성 강조.

유지: 노드 크기·밝기의 티어 차이, 가는 저명도 edge, 강조한 이웃만 밝아지는 상태, 실제 선택 상세. 테스트: 목록의 항목 선택 → 상세/카메라 변화, 축 필터 → 노드와 목록 변화, 신경망 탭, 닫기/Escape, fullscreen.

트리 포커스에서는 `cameraRect`가 `treeBounds`와 `viewport`로 전체 가지를 맞춘다. 노드 선택은 이 화면 범위를 유지하며 코어·기억 상세의 확대는 별도로 유지한다. `KnowledgeGraph`의 callback ref와 `ResizeObserver`를 함께 복사해 일반 보기·전체 화면·리사이즈에서 같은 규칙이 적용되게 한다. [수정 배경과 검증](tree-framing.md).

## Doctor — 상태를 여러 계층으로 보기

- `components/PillarRadar.tsx`, `lib/pillar-radar.ts`: 520 단위 캔버스, 좌우 padding 76, radius 172, 1/3·2/3·1의 3개 다각형 그리드. score/roster/freshness/sop 4개 레이어. 마우스 가까운 계층이 1, 다른 계층은 .08 opacity. legend로도 선택.
- `components/BrainViz.tsx`, `lib/brain-viz.ts`: 520×520 진단 코어, 76 반지름 점수 arc, 108/158/210 반지름 계층, 회전 radar sweep.
- `components/slab.tsx`: `SlabCard`, `BigStat`, `MeterStack`, `InsightCard`. 큰 숫자, 구분선, 가로 미터, 단 하나의 강조 gradient 카드.
- `components/slab-charts.tsx`: stepped line + pinstripe area + 최고점 라벨, 6단 dot matrix.

유지: health=null은 미측정 기호, 0과 구분. 진단 비교 데이터가 없으면 점수를 만들지 않는다. 다른 주제에 적용할 때 roster/freshness/sop의 표시 라벨도 사용자의 실제 축으로 고친다. `entry.tsx`의 표는 같은 수치를 텍스트로 제공한다.

## Funnel — 단계별로 살아 있는 노드

- `components/FunnelSpace.tsx`: 가로 단계 허브, 입장 replay, 현재 허브에서 orbit, 정보 pulse.
- `components/FunnelRadial.tsx`: 1100×680, 중심 (550,340), 유입 부채꼴, stage별 반지름, 중심부 전환 노드.
- `lib/funnel.ts`, `lib/funnel-radial.ts`, `lib/funnel-viz.ts`: 여정 → 공간 모델, likelihood 크기/위치, quiet decay, deterministic jitter.
- `components/FunnelNodeCard.tsx`: 한 노드의 touch 이력, 현재 상태와 세부정보.

Radial: 첫 출발 지연 500ms, hop 950ms, dwell 420ms, stagger `min(340,5000/count)`. 궤도는 deterministic; 프레임별 위치는 ref에 기록하고 elapsed time에 따라 easing한다. 입력 단계는 현재 소스의 `FUNNEL_STAGES` 5개가 권위다. 오래된 소스 주석의 “4단계”를 따르지 않는다.

전환은 초록, 21일 quiet부터 색이 붉어지고 90일에 decay. 샘플에는 고정 `now`를 넣어 날짜가 지나도 시연 상태가 바뀌지 않게 한다. 다른 공정/학습 단계로 바꿀 때는 단계 라벨뿐 아니라 enum·요약·tooltip도 함께 맞춘다.

## AdPilot — 회전 지구본과 성과

- `components/adpilot/Globe.tsx`: Canvas 2D의 구면 투영이다. Three.js/WebGL이 아니다. lat/lng → 구면 벡터 → yaw/pitch → z 기반 앞면 culling/밝기. 드래그 관성, 붉은 대기권, 입체 pin, DOM city chip.
- `public/adpilot/globe-dots.json`: 실제 해안선 표본 점. standalone은 JSON을 JS에 포함하여 외부 fetch 없이 대륙이 보인다.
- `components/adpilot/AdPilotDeck.tsx`, `lib/adpilot.ts`: 캠페인 필터, 광고비, 30일 matrix, ROAS ring, 성과, audience segmented meter. 선택한 캠페인이 모두를 갱신한다.

tilt .32 rad, canvas overhang 40px, DPR cap 2, idle velocity .0016. glow는 중앙 radial gradient + limb gradient다. pin 크기는 leads 비율 제곱근에 비례한다. 의미 있는 지리 데이터가 있을 때 사용한다. 데이터가 없으면 빈 상태를 보여준다.

## Personas — 구조의 변형을 비교

- `components/PersonasViewer.tsx`: 좌/우 버튼과 화살표 키, 번호 stepper, 설명/지식망 split, 280ms 전환.
- `components/PersonaOrgChart.tsx`: 760×150, 루트 → 수평 bus → 최대 5개 축 → 하위 agent 점. 작은 표지용.
- `components/PersonaBrainGraph.tsx`: 900×760, pillar R210, agent R328, 46개 deterministic core dot, 선 위를 이동하는 `.kg-synapse`.
- `lib/personas-seed.ts`: 원본의 일반 역할 템플릿 참고. 실제 사용자/조직 데이터로 간주하지 않는다.

Personas 지식망은 가벼운 deterministic SVG다. Brain의 force graph·확대 카메라와 같은 수준의 노드 상호작용을 제공한다고 설명하지 않는다. 이 모드의 주요 조작은 페르소나 전환이다.
