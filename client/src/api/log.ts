const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function listLogs(token: string) {
  const res = await fetch(`${API_URL}/logs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}
