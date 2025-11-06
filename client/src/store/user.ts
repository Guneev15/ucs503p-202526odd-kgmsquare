// Simple user id source for demo/dev
// 1) prefer VITE_USER_ID from env
// 2) fallback to localStorage key 'userId'
// 3) otherwise a constant placeholder

const DEFAULT_USER_ID = "9a1b9e1d-1234-45e7-a987-0abcde123456";

export function getUserId(): string {
  const fromEnv = (import.meta as any).env?.VITE_USER_ID as string | undefined;
  if (fromEnv && fromEnv.trim()) return fromEnv.trim();

  try {
    const ls = localStorage.getItem('userId');
    if (ls && ls.trim()) return ls.trim();
  } catch {
    // ignore
  }

  return DEFAULT_USER_ID;
}
