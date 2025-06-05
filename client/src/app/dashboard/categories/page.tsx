'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  List,
  ListItem,
  ListItemText,
  Box,
} from '@mui/material';

export default function CategoriesPage() {
  const { auth } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (!auth.user) {
      router.replace('/login');
    } else if (auth.user.role !== 'SUPERADMIN') {
      router.replace('/dashboard');
    } else {
      listCategories(auth.token || '')
        .then(setCategories)
        .catch(() => {});
    }
  }, [auth, router]);

  if (!auth.user || auth.user.role !== 'SUPERADMIN') return null;

  const handleCreate = async () => {
    const cat = await createCategory(name, auth.token || '');
    setCategories([...categories, cat]);
    setName('');
  };

  const handleUpdate = async () => {
    if (editId === null) return;
    const cat = await updateCategory(editId, editName, auth.token || '');
    setCategories(categories.map((c) => (c.id === cat.id ? cat : c)));
    setEditId(null);
    setEditName('');
  };

  const handleDelete = async (id: number) => {
    await deleteCategory(id, auth.token || '');
    setCategories(categories.filter((c) => c.id !== id));
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Categories
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="New category"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button variant="contained" onClick={handleCreate}>
          Create
        </Button>
      </Box>

      <List>
        {categories.map((cat) => (
          <ListItem key={cat.id} sx={{ gap: 1 }}>
            {editId === cat.id ? (
              <>
                <TextField
                  size="small"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <Button onClick={handleUpdate}>Save</Button>
                <Button
                  onClick={() => {
                    setEditId(null);
                    setEditName('');
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <ListItemText primary={cat.name} />
                <Button
                  onClick={() => {
                    setEditId(cat.id);
                    setEditName(cat.name);
                  }}
                >
                  Edit
                </Button>
                <Button onClick={() => handleDelete(cat.id)}>Delete</Button>
              </>
            )}
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
