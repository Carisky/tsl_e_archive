const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function uploadFile(formData: FormData, token: string) {
  const res = await fetch(`${API_URL}/files/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export async function listFiles(query: string, token: string) {
  const url = new URL(`${API_URL}/files`);
  if (query) url.searchParams.set('q', query);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export async function listCategories(token: string) {
  const res = await fetch(`${API_URL}/files/categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}
