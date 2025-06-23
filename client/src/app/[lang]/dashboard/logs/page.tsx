'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { listLogs } from '@/api/log';
import { Container, Typography, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function LogsPage() {
  const { auth, initialized } = useAuth();
  const router = useRouter();
  const params = useParams();
  const lang = Array.isArray(params.lang) ? params.lang[0] : params.lang ?? 'en';
  const { t } = useTranslation();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!initialized) return;
    if (!auth.user) {
      router.replace(`/${lang}/login`);
      return;
    }
    if (auth.user.role !== 'ADMIN' && auth.user.role !== 'SUPERADMIN') {
      router.replace(`/${lang}/dashboard`);
      return;
    }
    listLogs(auth.token || '')
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [initialized, auth, router]);

  if (!initialized || !auth.user) return null;
  if (auth.user.role !== 'ADMIN' && auth.user.role !== 'SUPERADMIN') return null;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        {t('logs.title')}
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('logs.date')}</TableCell>
              <TableCell>{t('logs.user')}</TableCell>
              <TableCell>{t('logs.action')}</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((l) => (
              <TableRow key={l.id}>
                <TableCell>{new Date(l.createdAt).toLocaleString()}</TableCell>
                <TableCell>{l.user ? l.user.username : 'system'}</TableCell>
                <TableCell>{l.action}</TableCell>
                <TableCell>{l.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Container>
  );
}
