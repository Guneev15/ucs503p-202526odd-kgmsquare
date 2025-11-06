// client/src/services/summaryService.ts
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export async function fetchTodaySummary(userId: string) {
  const url = `${API_BASE}/api/summary/today?user_id=${encodeURIComponent(userId)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch summary (${res.status}): ${text || res.statusText}`);
  }
  const data = await res.json();
  return data.summary;
}
export function getDailySummary() {
  throw new Error('Function not implemented.');
}
export async function fetchAllMemories(userId: string) {
  try {
    const url = `${API_BASE}/api/summary/all?user_id=${encodeURIComponent(userId)}`;
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to fetch all memories (${res.status}): ${text || res.statusText}`);
    }
    const data = await res.json();
    // Ensure we always return an array
    return Array.isArray(data.summaries) ? data.summaries : [];
  } catch (error) {
    console.error('Error in fetchAllMemories:', error);
    // Return empty array on error instead of throwing
    return [];
  }
}
export async function generateTodaySummary(userId: string) {
  const url = `${API_BASE}/api/summary/generate?user_id=${encodeURIComponent(userId)}`;
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to generate summary (${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}

export async function deleteSummary(summaryId: string) {
  const url = `${API_BASE}/api/summary/delete/${summaryId}`;
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to delete summary (${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}

