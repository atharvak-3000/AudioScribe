export interface SummaryEntry {
  id: string;
  title: string;
  date: string;
  summary: string;
  callId?: string;
  createdAt: number;
}

const STORAGE_KEY = 'audioscribe_summaries';

export function saveSummary(
  title: string,
  date: string,
  summary: string,
  callId?: string
): SummaryEntry {
  const entry: SummaryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    date,
    summary,
    callId,
    createdAt: Date.now(),
  };

  const existing = getSummaries();
  const updated = [entry, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return entry;
}

export function getSummaries(): SummaryEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const parsed: SummaryEntry[] = JSON.parse(data);
    return parsed.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export function deleteSummary(id: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const existing = getSummaries();
    const filtered = existing.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

export function getSummaryById(id: string): SummaryEntry | null {
  const summaries = getSummaries();
  return summaries.find((s) => s.id === id) || null;
}
