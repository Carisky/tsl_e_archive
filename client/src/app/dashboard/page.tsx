'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Typography, Container } from '@mui/material';

export default function DashboardPage() {
  const { auth, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !auth.user) {
      router.replace('/login');
    }
  }, [initialized, auth.user, router]);

  if (!initialized) return null;
  if (!auth.user) return null;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {auth.user.role} Dashboard
      </Typography>
      <Typography>Welcome, {auth.user.username}!</Typography>
    </Container>
  );
}
