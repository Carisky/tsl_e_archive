'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { uploadFile } from '@/api/file';
import { listCategories } from '@/api/category';
import { Container, Typography, TextField, Button, Box, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function UploadPage() {
  const { auth, initialized } = useAuth();
  const router = useRouter();
  const params = useParams();
  const lang = Array.isArray(params.lang) ? params.lang[0] : params.lang ?? 'en';
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    if (!initialized) return;
    if (!auth.user) {
      router.replace(`/${lang}/login`);
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
    if (date) fd.append('createdAt', date);
    await uploadFile(fd, auth.token || '');
    router.push(`/${lang}/dashboard/files`);
  };

  return (
    <Container sx={{ mt: 4 }} >
      <Typography variant="h5" gutterBottom>
        {t('upload.title')}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <Select multiple fullWidth={true} value={selected} onChange={(e) => setSelected(e.target.value as number[])}>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
          ))}
        </Select>
        <TextField
          type="date"
          label={t('upload.date')}
          InputLabelProps={{ shrink: true }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Button type="submit" variant="contained">
          {t('upload.upload')}
        </Button>
      </Box>
    </Container>
  );
}
