'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Typography, Container } from '@mui/material';

export default function DashboardPage() {
  const { auth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.user) {
      router.replace('/login');
    }
  }, [auth.user, router]);

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
