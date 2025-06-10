'use client';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Typography, Container } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function DashboardPage() {
  const { auth, initialized } = useAuth();
  const router = useRouter();
  const params = useParams();
  const lang = Array.isArray(params.lang) ? params.lang[0] : params.lang ?? 'en';
  const { t } = useTranslation();

  useEffect(() => {
    if (initialized && !auth.user) {
      router.replace(`/${lang}/login`);
    }
  }, [initialized, auth.user, router]);

  if (!initialized) return null;
  if (!auth.user) return null;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('dashboard.title', { role: auth.user.role })}
      </Typography>
      <Typography>{t('dashboard.welcome', { username: auth.user.username })}</Typography>
    </Container>
  );
}
