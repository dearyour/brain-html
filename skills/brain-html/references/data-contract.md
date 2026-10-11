# 독립 HTML 데이터 계약

`scripts/render.py --data content.json`은 이 문서의 JSON을 읽는다. 최상위 `title`, `subtitle`, `eyebrow`, `brand`, `caption`, `theme`, `sample`과 선택한 모드의 데이터만 필요하다. 실제/사용자 데이터는 `sample:false`. 명시적 샘플 시연은 `sample:true`.

`--data`만 주면 누락된 모드는 빈 상태다. 샘플과 자동 혼합하지 않는다. `--sample`을 같이 주면 내장 샘플에 부분 덮어쓰며 화면은 샘플로 표시된다. `--data`가 없을 때는 모든 모드가 채워진 내장 샘플이다.

## Brain: 간단한 주제 데이터

```json
{
  "title": "제품 개발의 지식망",
  "subtitle": "조사에서 출시까지의 역할과 도구를 탐색합니다.",
  "theme": "mono",
  "sample": false,
  "brain": {
    "label": "제품 개발",
    "pillars": [
      {"id":"research","name":"사용자 조사","color":"#5ec9f8","agents":[
        {"name":"인터뷰","task":"사용자의 문제 발견","description":"인터뷰 기록을 주제별로 묶습니다.","tools":["notes","interview-guide"]},
        {"name":"가설","task":"문제 가설 정리","tools":["notes"]}
      ]},
      {"id":"build","name":"구현","color":"#9875ea","agents":[
        {"name":"프론트엔드","task":"핵심 흐름 구현","tools":["react","typescript"]}
      ]}
    ]
  }
}
```

`pillars[].agents`는 이름 문자열 또는 `{name, task?, description?, role?, tools?:string[], steps?:string[], status?}`다. `status`는 active/idle/training/planned. 각 agent에 하나의 task를 붙이고 tool 이름은 같은 축에서 공유하면 같은 노드로 합친다. renderer 내부 ID는 위치로 deterministic하게 생성한다.

선택적 `brain.memory`는 `{nodes,edges}`. node 필드: `{id,type:'folder'|'page',label,folder,excerpt,wordCount,chunks,vx,vy,cluster,links}`; vx/vy는 단위 원 안 위치. edge: `{source,target,type:'member'|'wikilink'|'similar'}`. 계약/레이아웃 함수는 `lib/memory-core.ts`. 연결은 존재하는 ID만 가리켜야 한다. 실제 데이터인데 memory를 생략하면 가짜 문서를 만들지 않는다.

## Doctor

```json
{"doctor": {
  "health":84,"warnings":2,"caption":"팀에서 제공한 종합 점수",
  "axes":[
    {"id":"research","label":"조사","color":"#5ec9f8","score":84,"roster":90,"freshness":75,"sop":80},
    {"id":"build","label":"구현","color":"#9875ea","score":72,"roster":85,"freshness":70,"sop":65},
    {"id":"release","label":"출시","color":"#65ca80","score":90,"roster":95,"freshness":90,"sop":85}
  ],
  "clusters":[{"label":"Research","pages":12},{"label":"Projects","pages":18}],
  "series":[{"label":"10/01","count":4},{"label":"10/02","count":7}],
  "insight":"커버리지의 낮은 축부터 검토합니다."
}}
```

레이더 값은 0~100. `health:null`은 미측정. 점수 공식이 없으면 정량값을 만들어 넣지 말고 사용자 수치/명확히 표기한 예시로만 시각화한다.

## Funnel

`funnel:{now?:ISO-date,journeys:[]}`. 핵심 journey:

```json
{"id":"lead-1","name":"예시 여정","venture":"vantage","status":"engaged","product":null,"amountUsd":null,"relationship":"warm","likelihood":65,"createdAt":"2026-10-01","touches":[
  {"id":"touch-1","contactId":"lead-1","seq":1,"stage":"first_touch","channel":"organic","label":"첫 방문","source":"manual","at":"2026-10-01","acquisition":"newsletter"},
  {"id":"touch-2","contactId":"lead-1","seq":2,"stage":"engaged","channel":"email","label":"자료 확인","source":"manual","at":"2026-10-02"}
]}
```

- stage/status: first_touch → engaged → nurtured → opted_in → converted.
- venture: vantage / launchpad-cohort. 독립 UI에서 그룹 A/B로 표시하는 내부 enum이다. 다른 그룹 수/이름이 필요하면 runtime 모델과 UI를 같이 확장한다.
- relationship: cold/warm/hot. likelihood 0~100.
- acquisition: instagram/youtube/newsletter/x_linkedin/form/word_of_mouth.
- `url,email,phone,person,company,role,linkedin`은 없거나 null 가능. 시각화를 위해 개인 연락처를 끌어오지 않는다.
- 실제 작업의 날짜를 쓰거나 replay 고정 시점 `now`를 지정한다.

## AdPilot

`adpilot:{campaigns:[]}`. 각 campaign:

```
id, name, objective: leads|bookings|purchases, status: active|paused,
platform, period:{from,to}, spend, impressions, clicks, leads, bookings,
purchases, revenue,
audience:{age:{label:percent},gender:{label:percent},placements:{label:percent}},
geo:[{city,country,lat,lng,leads,bookings}],
daily?:[{date,spend,leads,bookings}]
```

정확한 Zod 계약은 `assets/runtime/lib/adpilot.ts`. 나눗셈 분모가 0이면 ROAS 등은 null/대시. 위도 -90~90, 경도 -180~180. 예시 geo를 실제 고객 위치라고 말하지 않는다.

## Personas

`personas`는 배열이다. 각 항목은 `{id,order,name,archetype,tagline,summary,accent,northStar,pillars,connectors,metrics,brainUse,signaturePlay}`. pillars는 `[{name,focus,agents:string[]}]`, connectors/metrics는 문자열 배열이다. accent는 hex 색상. 고유 id를 사용한다. 작은 org cover는 최대 5개 축이며 큰 지식망은 전체 축을 사용한다.

전체 형식이 필요할 때만 `assets/examples/sample-data.json`에서 해당 모드를 읽는다. 5개 모드 전체 파일을 무조건 컨텍스트에 넣지 않는다.
