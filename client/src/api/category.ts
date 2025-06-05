const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function listCategories(token: string) {
  const res = await fetch(`${API_URL}/files/categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export async function createCategory(name: string, token: string) {
  const res = await fetch(`${API_URL}/files/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export async function updateCategory(id: number, name: string, token: string) {
  const res = await fetch(`${API_URL}/files/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export async function deleteCategory(id: number, token: string) {
  const res = await fetch(`${API_URL}/files/categories/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed');
}
