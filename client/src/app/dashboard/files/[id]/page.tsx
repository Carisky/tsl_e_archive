'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchFile } from '@/api/file';
import { Container, Typography, Box, Button } from '@mui/material';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

type Props = { params: { id: string } };

export default function FilePreviewPage({ params }: Props) {
  const { auth } = useAuth();
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [html, setHtml] = useState('');
  const [filename, setFilename] = useState('');

  useEffect(() => {
    if (!auth.user) {
      router.replace('/login');
      return;
    }
    const id = parseInt(params.id);
    if (isNaN(id)) return;
    let objectUrl: string | null = null;
    fetchFile(id, auth.token || '')
      .then(async ({ blob, filename }) => {
        setFilename(filename);
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        if (ext === 'txt') {
          setHtml(await blob.text());
        } else if (['xls', 'xlsx'].includes(ext)) {
          const buf = await blob.arrayBuffer();
          const wb = XLSX.read(buf, { type: 'array' });
          const sheet = wb.Sheets[wb.SheetNames[0]];
          setHtml(XLSX.utils.sheet_to_html(sheet));
        } else if (['docx', 'odt'].includes(ext)) {
          const buf = await blob.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer: buf });
          setHtml(result.value);
        } else {
          objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
        }
      })
      .catch(() => {});
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [auth, params.id, router]);

  if (!auth.user) return null;

  const ext = filename.split('.').pop()?.toLowerCase() || '';

  let content: JSX.Element | null = null;
  if (ext === 'txt') {
    content = (
      <Box component="pre" sx={{ whiteSpace: 'pre-wrap', overflow: 'auto' }}>
        {html}
      </Box>
    );
  } else if (['xls', 'xlsx', 'docx', 'odt'].includes(ext)) {
    content = <div dangerouslySetInnerHTML={{ __html: html }} />;
  } else if (url) {
    content = <iframe src={url} style={{ width: '100%', height: '80vh' }} />;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Button onClick={() => router.back()} sx={{ mb: 2 }}>Back</Button>
      <Typography variant="h6" gutterBottom>
        {filename}
      </Typography>
      {content}
    </Container>
  );
}
