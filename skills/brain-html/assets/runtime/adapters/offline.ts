let notes: any[] = [];
export function registerNotes(value: any[]) { notes = value; }

// Component-local replacement, never a global fetch monkey-patch. No network IO.
export async function offlineFetch(input: string, init?: RequestInit): Promise<Pick<Response, 'ok' | 'status' | 'json'>> {
  if (init?.method && init.method !== 'GET') {
    return { ok: false, status: 405, json: async () => ({ error: '독립 HTML에서는 실행할 수 없습니다.' }) };
  }
  const url = new URL(input, 'https://brain-html.invalid');
  if (url.pathname === '/api/brain') {
    const q = (url.searchParams.get('q') ?? '').toLocaleLowerCase();
    const results = notes.filter(n => `${n.label} ${n.excerpt} ${n.folder}`.toLocaleLowerCase().includes(q)).slice(0, 20)
      .map(n => ({ title: n.label, path: `${n.folder}/${n.label}.md`, snippet: n.excerpt, excerpt: n.excerpt, score: 1, source: 'embedded' }));
    return { ok: true, status: 200, json: async () => ({ provider: 'HTML에 포함된 문서', results }) };
  }
  return { ok: true, status: 200, json: async () => ({ message: null, unavailable: true }) };
}
