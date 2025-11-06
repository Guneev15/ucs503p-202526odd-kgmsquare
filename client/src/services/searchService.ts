const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export async function searchMemories(userId: string, query: string): Promise<string> {
  const url = `${API_BASE}/api/search/memories?user_id=${encodeURIComponent(userId)}&query=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Search failed (${res.status}): ${text || res.statusText}`);
  }
  const data = await res.json();
  // server returns { result: string }
  return data.result as string;
}
