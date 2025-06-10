'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { uploadFile } from '@/api/file';
import { listCategories } from '@/api/category';
import { Container, Typography, TextField, Button, Box, Select, MenuItem } from '@mui/material';

export default function UploadPage() {
  const { auth, initialized } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    if (!initialized) return;
    if (!auth.user) {
      router.replace('/login');
    } else {
      listCategories(auth.token || '').then(setCategories).catch(() => {});
    }
  }, [initialized, auth, router]);

  if (!initialized) return null;
  if (!auth.user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('categories', selected.join(','));
    await uploadFile(fd, auth.token || '');
    router.push('/dashboard/files');
  };

  return (
    <Container sx={{ mt: 4 }} >
      <Typography variant="h5" gutterBottom>
        Upload File
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <Select multiple fullWidth={true} value={selected} onChange={(e) => setSelected(e.target.value as number[])}>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
          ))}
        </Select>
        <Button type="submit" variant="contained">
          Upload
        </Button>
      </Box>
    </Container>
  );
}
