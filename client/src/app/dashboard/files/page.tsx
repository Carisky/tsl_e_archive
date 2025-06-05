'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { listFiles } from '@/api/file';
import { useRouter } from 'next/navigation';
import { Container, Typography, TextField, Box, List, ListItem, ListItemText, Button } from '@mui/material';

export default function FilesPage() {
  const { auth } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.user) {
      router.replace('/login');
    } else {
      listFiles('', auth.token || '').then(setFiles).catch(() => {});
    }
  }, [auth, router]);

  if (!auth.user) return null;

  const search = async () => {
    const res = await listFiles(query, auth.token || '');
    setFiles(res);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Files
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField label="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button variant="contained" onClick={search}>Search</Button>
      </Box>
      <List>
        {files.map((f) => (
          <ListItem key={f.id}>
            <ListItemText primary={f.filename} secondary={f.categories.map((c: any) => c.category.name).join(', ')} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
