'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { listUsers, updateUserRole } from '@/api/user';
import {
  Container,
  Typography,
  Select,
  MenuItem,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function UsersPage() {
  const { auth, initialized } = useAuth();
  const router = useRouter();
  const params = useParams();
  const lang = Array.isArray(params.lang) ? params.lang[0] : params.lang ?? 'en';
  const { t } = useTranslation();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    if (!initialized) return;
    if (!auth.user) {
      router.replace(`/${lang}/login`);
      return;
    }
    if (auth.user.role !== 'SUPERADMIN') {
      router.replace(`/${lang}/dashboard`);
      return;
    }
    listUsers(auth.token || '')
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [initialized, auth, router]);

  if (!initialized || !auth.user || auth.user.role !== 'SUPERADMIN') return null;

  const handleSelect = (id: number, value: string) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, role: value } : u)));
  };

  const save = async (id: number, role: string) => {
    setSavingId(id);
    try {
      const updated = await updateUserRole(id, role, auth.token || '');
      setUsers(users.map((u) => (u.id === id ? updated : u)));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        {t('users.title')}
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        users.map((u) => (
          <Box key={u.id} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
            <Typography sx={{ flexGrow: 1 }}>
              {u.username} ({u.email})
            </Typography>
            <Select
              size="small"
              value={u.role}
              onChange={(e) => handleSelect(u.id, e.target.value as string)}
            >
              <MenuItem value="USER">USER</MenuItem>
              <MenuItem value="ADMIN">ADMIN</MenuItem>
              <MenuItem value="SUPERADMIN">SUPERADMIN</MenuItem>
            </Select>
            <Button
              variant="contained"
              onClick={() => save(u.id, u.role)}
              disabled={savingId === u.id}
            >
              {savingId === u.id ? <CircularProgress size={24} /> : t('users.update')}
            </Button>
          </Box>
        ))
      )}
    </Container>
  );
}
