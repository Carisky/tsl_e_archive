'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getFile, downloadFile, deleteFile, updateFile } from '@/api/file';
import { Container, Box, Typography, Button } from '@mui/material';

export default function FilePreviewPage({ params }: any) {
  const { auth } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<any | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [ext, setExt] = useState<string>('');

  useEffect(() => {
    if (!auth.user) {
      router.replace('/login');
    } else {
      getFile(parseInt(params.id), auth.token || '')
        .then((data) => {
          setFile(data);
          const e = data.filename.split('.').pop()?.toLowerCase() || '';
          setExt(e);
        })
        .catch(() => {});
      downloadFile(parseInt(params.id), auth.token || '')
        .then((blob) => setUrl(URL.createObjectURL(blob)))
        .catch(() => {});
    }
  }, [auth, params.id, router]);

  if (!auth.user || !file) return null;

  const doDownload = async () => {
    const blob = await downloadFile(file.id, auth.token || '');
    const durl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = durl;
    a.download = file.filename;
    a.click();
    window.URL.revokeObjectURL(durl);
  };

  const doDelete = async () => {
    if (confirm('Delete file?')) {
      await deleteFile(
        file.id,
        auth.token || '',
        auth.user!.role === 'SUPERADMIN'
      );
      router.push('/dashboard/files');
    }
  };

  const doUpdate = async () => {
    const value = prompt('New name', file.filename);
    if (value && value !== file.filename) {
      const updated = await updateFile(file.id, value, auth.token || '');
      setFile(updated);
    }
  };

  return (
    <Container sx={{ mt: 4, display: 'flex', gap: 2 }}>
      <Box sx={{ width: '70%' }}>
        {url && (
          ext === 'pdf' || ext === 'txt' ? (
            <iframe src={url} style={{ width: '100%', height: '80vh' }} />
          ) : ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif' || ext === 'svg' ? (
            <img src={url} style={{ maxWidth: '100%', maxHeight: '80vh' }} />
          ) : (
            <Typography>Cannot preview this file type</Typography>
          )
        )}
      </Box>
      <Box sx={{ width: '30%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6">{file.filename}</Typography>
        <Typography>Created: {new Date(file.createdAt).toLocaleString()}</Typography>
        <Typography>
          Categories: {file.categories.map((c: any) => c.category.name).join(', ')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button variant="contained" onClick={doDownload}>Download</Button>
          <Button variant="contained" onClick={doUpdate}>Update</Button>
          {(auth.user!.role === 'ADMIN' || auth.user!.role === 'SUPERADMIN') && (
            <Button variant="contained" color="error" onClick={doDelete}>
              Delete
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
}
