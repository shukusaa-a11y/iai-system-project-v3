const apiKey = import.meta.env.VITE_SERPER_API_KEY as string | undefined;

export const isSerperConfigured = Boolean(apiKey);

export const NO_KEY_MESSAGE = 'Veuillez ajouter VITE_SERPER_API_KEY dans .env pour la recherche web.';

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
}

export async function webSearch(query: string): Promise<{ results: SerperResult[]; error: boolean; message?: string }> {
  if (!apiKey) return { results: [], error: true, message: NO_KEY_MESSAGE };
  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query }),
    });
    if (!res.ok) throw new Error('Serper API error');
    const data = await res.json();
    const results: SerperResult[] = (data.organic ?? []).map((r: { title: string; link: string; snippet: string }) => ({
      title: r.title,
      link: r.link,
      snippet: r.snippet,
    }));
    return { results, error: false };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur Serper';
    return { results: [], error: true, message: msg };
  }
}
