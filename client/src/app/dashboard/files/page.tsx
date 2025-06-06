'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { listFiles, deleteFile, fileDownloadUrl } from '@/api/file';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  ListItemIcon,
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';

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

  const iconFor = (name: string) => {
    if (name.toLowerCase().endsWith('.pdf')) return <PictureAsPdfIcon />;
    if (name.toLowerCase().endsWith('.txt')) return <ArticleIcon />;
    return <InsertDriveFileIcon />;
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Files
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField label="Search" fullWidth={true} value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button variant="contained" onClick={search}>Search</Button>
      </Box>
      <List>
        {files.map((f) => (
          <ListItem key={f.id}>
            <ListItemIcon>{iconFor(f.filename)}</ListItemIcon>
            <ListItemText primary={f.filename} secondary={f.categories.map((c: any) => c.category.name).join(', ')} />
            <Button onClick={() => router.push(`/dashboard/files/${f.id}`)}>Preview</Button>
            <Button
              onClick={() => {
                const a = document.createElement('a');
                a.href = fileDownloadUrl(f.id, auth.token || '');
                a.download = f.filename;
                a.click();
              }}
            >
              Download
            </Button>
            {(auth.user && (auth.user.role === 'ADMIN' || auth.user.role === 'SUPERADMIN')) && (
              <Button onClick={async () => {
                await deleteFile(f.id, auth.token || '', auth.user?.role === 'SUPERADMIN');
                setFiles(files.filter((x) => x.id !== f.id));
              }}>Delete</Button>
            )}
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
