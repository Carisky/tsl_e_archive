'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getFile, deleteFile, updateFile, fileDownloadUrl } from '@/api/file';
import { Container, Box, Typography, Button } from '@mui/material';
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';
import { pdfjs } from 'react-pdf';

// Explicitly set PDF.js worker path so that previews work in Next.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

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
          if (['pdf', 'txt', 'png', 'jpg', 'jpeg', 'gif', 'svg'].includes(e)) {
            setUrl(fileDownloadUrl(parseInt(params.id), auth.token || ''));
          }
        })
        .catch(() => {});
    }
    return () => {};
  }, [auth, params.id, router]);

  if (!auth.user || !file) return null;

  const doDownload = () => {
    const link = document.createElement('a');
    link.href = fileDownloadUrl(file.id, auth.token || '');
    link.download = file.filename;
    link.click();
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
        {url ? (
          <DocViewer
            documents={[{ uri: url, fileType: ext }]}
            pluginRenderers={DocViewerRenderers}
            style={{ height: '80vh' }}
            config={{ header: { disableHeader: true, disableFileName: true } }}
          />
        ) : (
          <Typography>Cannot preview this file type</Typography>
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
