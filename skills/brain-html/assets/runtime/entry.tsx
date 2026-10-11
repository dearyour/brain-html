import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrainGraphView } from './components/BrainGraphView';
import { BrainViz } from './components/BrainViz';
import { PillarRadar } from './components/PillarRadar';
import { FunnelSpace } from './components/FunnelSpace';
import { FunnelRadial } from './components/FunnelRadial';
import { PersonasViewer } from './components/PersonasViewer';
import { PersonaOrgChart } from './components/PersonaOrgChart';
import { AdPilotDeck } from './components/adpilot/AdPilotDeck';
import { SlabCard, BigStat, MeterStack, InsightCard } from './components/slab';
import { StepLine, DotMatrix } from './components/slab-charts';
import { buildKnowledgeGraph } from './lib/knowledge-graph';
import { demoMemoryGraph } from './lib/memory-core';
import { funnelSpaceModel, funnelSummary } from './lib/funnel';
import { funnelRadialModel } from './lib/funnel-radial';
import { registerNotes } from './adapters/offline';

const config = JSON.parse(document.getElementById('brain-html-config')!.textContent!);
const MODES = [
  { id: 'brain', name: 'Brain', title: '동심원 지식망', use: '관계·구조·아키텍처', detail: '노드 탐색 · 포커스 전환 · 신경망' },
  { id: 'doctor', name: '닥터', title: '다층 진단 레이더', use: '상태·역량·지표 비교', detail: '계층 분리 · 진단 코어 · 추이' },
  { id: 'funnel', name: 'Funnel', title: '전환 이동 궤도', use: '고객 여정·단계·전환', detail: '흐름 / 방사형 · 이동 · 개별 정보' },
  { id: 'adpilot', name: 'AdPilot', title: '회전 지구본', use: '지역·광고·글로벌 분포', detail: '관성 회전 · 도시 핀 · 성과' },
  { id: 'personas', name: '페르소나', title: '조직도와 지식망', use: '역할·유형·운영체계', detail: '템플릿 전환 · 조직도 · 지식 코어' },
];
const selectedModes = config.showcase ? MODES.map(m => m.id) : [config.mode, ...(config.sections ?? [])];
const modeInfo = (id: string) => MODES.find(m => m.id === id) ?? MODES[0];

function makeBrain() {
  const input = config.brain ?? { pillars: [] };
  const departments = input.pillars.map((p: any, i: number) => ({ id: p.id ?? `dept-${i}`, name: p.name, slug: p.id ?? `pillar-${i}`, tagline: p.description ?? '', color: p.color ?? '#8b7cff', order: i }));
  const agents: any[] = [], tasks: any[] = [];
  input.pillars.forEach((p: any, i: number) => (p.agents ?? []).forEach((a: any, j: number) => {
    const item = typeof a === 'string' ? { name: a } : a;
    const id = `agent-${i}-${j}`, departmentId = departments[i].id;
    agents.push({ id, departmentId, name: item.name, role: item.role ?? item.task ?? item.name, status: item.status ?? 'active', tier: j === 0 ? 'lead' : 'worker', description: item.description ?? item.task ?? '', model: '', tools: item.tools ?? [], parentId: null, instance: 'embedded' });
    tasks.push({ id: `task-${i}-${j}`, departmentId, title: item.task ?? item.name, summary: item.description ?? '', steps: item.steps ?? ['자료를 확인합니다.', '내용을 정리합니다.', '결과를 검토합니다.'], assigneeKind: 'agent', assigneeId: id });
  }));
  const graph = buildKnowledgeGraph(agents, departments, [], tasks);
  graph.nodes.forEach(n => {
    if (n.kind === 'self') n.label = input.label ?? config.title;
    if (n.kind === 'team') n.color = departments.find((d: any) => `team:${d.id}` === n.id)?.color;
  });
  // A supplied empty memory stays empty. Demo constellation is only generated for sample data.
  const memory = input.memory ?? (config.sample ? demoMemoryGraph() : { nodes: [], edges: [] });
  registerNotes(memory.nodes);
  return { graph, agents, departments, tasks, people: [], memory };
}
const brain = makeBrain();

function Brain() {
  if (!brain.agents.length) return <Empty text="표시할 관계가 없습니다. 축과 노드를 추가해 주세요." />;
  return <div className="studio-brain"><BrainGraphView {...brain} fill /></div>;
}
function Empty({ text }: { text: string }) { return <div className="studio-message" role="status">{text}</div>; }

function Doctor() {
  const d = config.doctor;
  if (!d || !d.axes?.length) return <Empty text="진단할 지표가 없습니다." />;
  const clusters = d.clusters ?? [], series = d.series ?? [], warnings = d.warnings ?? 0;
  const cols = clusters.map((c: any) => ({ label: c.label, count: c.pages }));
  const total = clusters.reduce((s: number, c: any) => s + c.pages, 0);
  return <>
    <div className="grid grid-cols-[2fr_1fr] gap-6 max-[1200px]:grid-cols-1">
      <SlabCard title="축별 상태" sub="레이어를 선택해 비교" i={1}>
        <div className="min-h-[440px]"><PillarRadar axes={d.axes} health={d.health ?? null} warnings={warnings} /></div>
      </SlabCard>
      <SlabCard title="상태 규모" sub="100점 만점" className="flex flex-col" i={2}>
        <div className="flex flex-1 flex-col p-6"><BigStat value={d.health ?? undefined} display={d.health == null ? '—' : undefined} unit="/100" caption={d.caption ?? '선택한 축의 종합 상태'} />
          <MeterStack meters={d.axes.map((a: any) => ({ label: a.label, frac: a.score / 100, display: `${a.score}/100`, hue: a.color }))} />
        </div>
      </SlabCard>
    </div>
    <div className="mt-6 grid grid-cols-3 gap-6 max-[1100px]:grid-cols-1">
      <SlabCard title="활동 추이" i={3}><div className="p-6"><BigStat value={series.reduce((s: number, p: any) => s + p.count, 0)} size={30} unit="회" /></div><StepLine series={series} hue="var(--send-activity)" unit="회" /></SlabCard>
      <SlabCard title="지식 분포" i={4}><div className="flex flex-col gap-7 p-6"><BigStat value={total} size={30} unit="페이지" /><DotMatrix cols={cols} hue="var(--brain-2)" /></div></SlabCard>
      <InsightCard i={5} badge="확인 필요" value={warnings} headline={warnings ? `${warnings}개 항목 점검` : '모든 항목 정상'} body={d.insight ?? '각 축과 레이어를 비교해 다음 행동을 결정하세요.'} frac={d.health == null ? 0 : d.health / 100} />
    </div>
    <div className="mt-6 grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
      <SlabCard title="진단 코어" i={6}><div className="mx-auto max-w-[520px] p-5"><BrainViz clusters={clusters} health={d.health ?? null} supabasePages={total} version="내장형" /></div></SlabCard>
      <SlabCard title="지표 목록" sub="수치와 레이더를 함께 읽기" i={7}><div className="overflow-x-auto p-6"><table className="w-full text-left text-xs"><caption className="sr-only">진단 레이어별 데이터</caption><thead><tr><th className="py-3">축</th><th>상태</th><th>가동률</th><th>최신성</th><th>커버리지</th></tr></thead><tbody>{d.axes.map((a: any) => <tr key={a.id} className="border-t border-os-border"><th className="py-4">{a.label}</th><td>{a.score}</td><td>{a.roster}</td><td>{a.freshness}</td><td>{a.sop}</td></tr>)}</tbody></table></div></SlabCard>
    </div>
  </>;
}

function Funnel() {
  const [radial, setRadial] = useState(false);
  const [replay, setReplay] = useState(0);
  const [venture, setVenture] = useState('all');
  const input = config.funnel ?? {};
  const journeys = useMemo(() => (input.journeys ?? []).filter((j: any) => venture === 'all' || j.venture === venture), [venture]);
  const now = new Date(input.now ?? new Date().toISOString());
  const summary = funnelSummary(journeys);
  const converted = journeys.filter((j: any) => j.status === 'converted');
  return <>
    <div className="studio-controls mb-5"><select aria-label="고객 그룹" value={venture} onChange={e => setVenture(e.target.value)}><option value="all">전체 고객</option><option value="vantage">그룹 A</option><option value="launchpad-cohort">그룹 B</option></select>
      <button aria-pressed={!radial} onClick={() => setRadial(false)}>흐름</button><button aria-pressed={radial} onClick={() => setRadial(true)}>방사형</button><button onClick={() => setReplay(n => n + 1)}>이동 다시 보기</button>
    </div>
    <SlabCard i={1}>{journeys.length ? <div key={`${radial}-${replay}`} className="p-2">{radial ? <FunnelRadial model={funnelRadialModel(journeys, now)} /> : <FunnelSpace nodes={funnelSpaceModel(journeys, now)} summary={summary} />}</div> : <Empty text="표시할 고객 여정이 없습니다." />}</SlabCard>
    <div className="mt-6 grid grid-cols-3 gap-6 max-[1000px]:grid-cols-1"><SlabCard title="전체 여정"><div className="p-6"><BigStat value={journeys.length} unit="개" /></div></SlabCard><SlabCard title="전환"><div className="p-6"><BigStat value={converted.length} unit="개" caption={journeys.length ? `${Math.round(converted.length / journeys.length * 100)}% 전환율` : '—'} /></div></SlabCard><InsightCard badge="흐름 요약" value={converted.reduce((s: number, j: any) => s + (j.amountUsd ?? 0), 0)} kind="usd" headline="전환된 여정의 합계" body="노드를 선택하면 이동 이력과 현재 단계를 확인할 수 있습니다." /></div>
  </>;
}
function Adpilot() {
  const campaigns = config.adpilot?.campaigns ?? [];
  const cities = new Map<string, any>();
  campaigns.forEach((c: any) => c.geo.forEach((g: any) => {
    const key = `${g.city}, ${g.country}`, prev = cities.get(key);
    cities.set(key, { name: key, leads: (prev?.leads ?? 0) + g.leads, bookings: (prev?.bookings ?? 0) + g.bookings });
  }));
  return <div className="studio-adpilot" data-adpilot><AdPilotDeck campaigns={campaigns} syncedAt={null} />
    <details className="mt-6 text-xs"><summary className="cursor-pointer py-3">전체 캠페인 지역별 수치 · {cities.size}개 도시</summary><div className="grid grid-cols-3 gap-3 max-[700px]:grid-cols-1">{[...cities.values()].map(g => <div key={g.name} className="border-t border-os-border py-3">{g.name}<br /><span className="text-os-muted">리드 {g.leads} · 예약 {g.bookings}</span></div>)}</div></details>
  </div>;
}
function Personas() {
  const personas = config.personas ?? [];
  return personas.length ? <><PersonasViewer personas={personas} /><div className="mt-6 grid grid-cols-2 gap-4 max-[1000px]:grid-cols-1">{personas.map((p: any) => <SlabCard key={p.id} title={p.name}><PersonaOrgChart persona={p} /></SlabCard>)}</div></> : <Empty text="표시할 페르소나가 없습니다." />;
}
const views: Record<string, React.ComponentType> = { brain: Brain, doctor: Doctor, funnel: Funnel, adpilot: Adpilot, personas: Personas };
function App() {
  const [mode, setMode] = useState(config.mode ?? 'brain');
  const [theme, setTheme] = useState(config.theme ?? 'mono');
  const [message, setMessage] = useState('');
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => {
    const handler = (e: any) => selectedModes.includes(e.detail) ? setMode(e.detail) : setMessage('이 링크는 원본 앱의 기능입니다. 이 HTML에는 선택한 시각화만 포함되어 있습니다.');
    window.addEventListener('brain-html:navigate', handler);
    return () => window.removeEventListener('brain-html:navigate', handler);
  }, []);
  const View = views[mode], info = modeInfo(mode);
  return <div className="studio-shell">
    <aside className="studio-rail"><div className="studio-logo">◎<br />{config.brand ?? 'BRAIN / HTML'}</div><small>VISUAL SYSTEMS</small><nav className="studio-nav" aria-label="시각화 스타일">{MODES.filter(m => selectedModes.includes(m.id)).map(m => <button key={m.id} aria-current={mode === m.id ? 'page' : undefined} onClick={() => { setMode(m.id); setMessage(''); }}>{m.name}<span>{m.title}</span></button>)}</nav><small className="studio-foot">{config.sample ? '● 샘플 데이터' : '● 제공된 데이터'}<br />{config.caption ?? '관계를 탐색하고 흐름을 읽습니다.'}</small></aside>
    <main className="studio-main"><div className="studio-top"><small>{config.brand ?? 'brain-html'} / {mode}</small><div className="studio-controls"><select aria-label="테마" value={theme} onChange={e => setTheme(e.target.value)}><option value="mono">Monolith · 원본</option><option value="dark">Phosphor</option><option value="midnight">Midnight</option><option value="ember">Ember</option><option value="mono-light">Daylight</option></select></div></div>
      {config.showcase && <div className="studio-chooser" aria-label="다섯 가지 스타일 선택">{MODES.map(m => <button key={m.id} className="studio-choice" aria-pressed={mode === m.id} onClick={() => setMode(m.id)}><b>{m.name} / {m.title}</b><span>{m.use}</span><span>{m.detail}</span></button>)}</div>}
      <header className="studio-head"><div><div className="studio-eyebrow">// {config.showcase ? info.use : config.eyebrow ?? info.use}</div><h1>{config.showcase ? info.name.toUpperCase() : config.title}</h1><p>{config.showcase ? info.detail : config.subtitle}</p></div><span className="studio-pill">{config.sample ? '샘플 데이터' : '제공된 데이터'}</span></header>
      {message && <Empty text={message} />}<section key={mode} aria-label={`${info.name} 시각화`}><View /></section>
      {!config.showcase && (config.sections ?? []).filter((id: string) => id !== mode).map((id: string) => { const Support = views[id]; return <section key={id} className="studio-support" aria-label={`${modeInfo(id).name} 보조 시각화`}><h2>{modeInfo(id).title}</h2><Support /></section>; })}
    </main>
  </div>;
}
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: string }> {
  state = { error: '' };
  static getDerivedStateFromError(error: Error) { return { error: error.message }; }
  render() { return this.state.error ? <main style={{ padding: 40 }}><h1>데이터 형식을 확인해 주세요</h1><pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error}</pre></main> : this.props.children; }
}
createRoot(document.getElementById('root')!).render(<ErrorBoundary><App /></ErrorBoundary>);
