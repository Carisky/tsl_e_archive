const API_URL = process.env.NEXT_PUBLIC_API_URL;

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


export async function downloadFile(id: number, token: string) {
  const res = await fetch(`${API_URL}/files/${id}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed');
  return res.blob();
}

export async function deleteFile(id: number, token: string, force = false) {
  const url = new URL(`${API_URL}/files/${id}`);
  if (force) url.searchParams.set('force', 'true');
  const res = await fetch(url.toString(), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed');
}

export async function getFileLink(id: number, token: string): Promise<{url: string; type: string}> {
  const res = await fetch(`${API_URL}/files/${id}/link`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Cannot get link');
  return res.json();
}