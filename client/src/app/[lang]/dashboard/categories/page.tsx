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

  useEffect(() => {
    if (!initialized) return;
    if (!auth.user) {
      router.replace(`/${lang}/login`);
    } else {
      listCategories(auth.token || '').then(setCategories).catch(() => {});
    }
  }, [initialized, auth, router]);

  if (!initialized) return null;
  if (!auth.user) return null;

  const refresh = async () => {
    const cats = await listCategories(auth.token || '');
    setCategories(cats);
  };

  const add = async () => {
    await createCategory(name, auth.token || '');
    setName('');
    refresh();
  };

  const edit = async (id: number, current: string) => {
    const value = prompt(t('categories.newName'), current);
    if (value && value !== current) {
      await updateCategory(id, value, auth.token || '');
      setCategories(categories.map((c) => (c.id === id ? { ...c, name: value } : c)));
    }
  };

  const remove = async (id: number) => {
    if (confirm(t('categories.deleteConfirm'))) {
      await deleteCategory(id, auth.token || '');
      setCategories(categories.filter((c) => c.id !== id));
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
          <Button variant="contained" onClick={add} disabled={!name.trim()}>
            {t('categories.add')}
          </Button>
        </Box>
      )}
      <List>
        {categories.map((c) => (
          <ListItem key={c.id} secondaryAction={
            auth.user?.role === 'SUPERADMIN' ? (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={() => edit(c.id, c.name)}>{t('categories.edit')}</Button>
                <Button onClick={() => remove(c.id)}>{t('categories.delete')}</Button>
              </Box>
            ) : null
          }>
            <ListItemText primary={c.name} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
