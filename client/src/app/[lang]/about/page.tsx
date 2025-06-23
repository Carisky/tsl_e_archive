'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Typography, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function Page() {
  const { t } = useTranslation();
  const advantages = t('about.advantages', { returnObjects: true }) as string[];



  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('about.title')}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        {t('about.intro')}
      </Typography>

      <Box component={List}>
        {advantages.map((item, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </Box>
    </Container>
  );
}
