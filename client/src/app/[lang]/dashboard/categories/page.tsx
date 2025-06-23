'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/api/category';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function CategoriesPage() {
  const { auth, initialized } = useAuth();
  const router = useRouter();
  const params = useParams();
  const lang = Array.isArray(params.lang) ? params.lang[0] : params.lang ?? 'en';
  const { t } = useTranslation();
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [loadingCats, setLoadingCats] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    if (!auth.user) {
      router.replace(`/${lang}/login`);
    } else {
      listCategories(auth.token || '')
        .then(setCategories)
        .catch(() => {})
        .finally(() => setLoadingCats(false));
    }
  }, [initialized, auth, router]);

  if (!initialized) return null;
  if (!auth.user) return null;

  const refresh = async () => {
    setLoadingCats(true);
    const cats = await listCategories(auth.token || '');
    setCategories(cats);
    setLoadingCats(false);
  };

  const add = async () => {
    setProcessing(true);
    try {
      await createCategory(name, auth.token || '');
      setName('');
      refresh();
    } finally {
      setProcessing(false);
    }
  };

  const edit = async (id: number, current: string) => {
    const value = prompt(t('categories.newName'), current);
    if (value && value !== current) {
      setProcessing(true);
      try {
        await updateCategory(id, value, auth.token || '');
        setCategories(categories.map((c) => (c.id === id ? { ...c, name: value } : c)));
      } finally {
        setProcessing(false);
      }
    }
  };

  const remove = async (id: number) => {
    if (confirm(t('categories.deleteConfirm'))) {
      setProcessing(true);
      try {
        await deleteCategory(id, auth.token || '');
        setCategories(categories.filter((c) => c.id !== id));
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        {t('categories.title')}
      </Typography>
      {auth.user.role === 'SUPERADMIN' && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField label={t('categories.name')} fullWidth={true} value={name} onChange={(e) => setName(e.target.value)} />
          <Button variant="contained" onClick={add} disabled={!name.trim() || processing}>
            {processing ? <CircularProgress size={24} /> : t('categories.add')}
          </Button>
        </Box>
      )}
      {loadingCats ? (
        <CircularProgress />
      ) : (
        <List>
          {categories.map((c) => (
            <ListItem key={c.id} secondaryAction={
              auth.user?.role === 'SUPERADMIN' ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button onClick={() => edit(c.id, c.name)} disabled={processing}>
                    {t('categories.edit')}
                  </Button>
                  <Button onClick={() => remove(c.id)} disabled={processing}>
                    {t('categories.delete')}
                  </Button>
                </Box>
              ) : null
            }>
              <ListItemText primary={c.name} />
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
}
