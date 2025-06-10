'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export default function NavBar() {
  const { auth, setAuth } = useAuth();
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const lang = Array.isArray(params.lang) ? params.lang[0] : params.lang ?? 'en';
  const { t } = useTranslation();

  const handleLangChange = (e: SelectChangeEvent<string>) => {
    const l = e.target.value;
    const segments = pathname.split('/');
    if (segments.length > 1) segments[1] = l;
    router.push(segments.join('/'));
  };
  const handleLogout = () => {
    setAuth({ token: null, user: null });
  };
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          TSL App
        </Typography>
        <FormControl variant="standard" sx={{ mr: 2, minWidth: 80 }}>
          <InputLabel id="lang-select-label">Lang</InputLabel>
          <Select
            labelId="lang-select-label"
            value={lang}
            onChange={handleLangChange}
            label="Lang"
          >
            <MenuItem value="en">EN</MenuItem>
            <MenuItem value="ru">RU</MenuItem>
            <MenuItem value="pl">PL</MenuItem>
          </Select>
        </FormControl>

        {auth.user ? (
          <>
            <Button color="inherit" component={Link} href={`/${lang}/dashboard`}>
              {t('navbar.dashboard')}
            </Button>
            <Button color="inherit" component={Link} href={`/${lang}/dashboard/upload`}>
              {t('navbar.upload')}
            </Button>
            <Button color="inherit" component={Link} href={`/${lang}/dashboard/files`}>
              {t('navbar.files')}
            </Button>
            {(auth.user.role === 'ADMIN' || auth.user.role === 'SUPERADMIN') && (
              <Button color="inherit" component={Link} href={`/${lang}/dashboard/categories`}>
                {t('navbar.categories')}
              </Button>
            )}
            <Button color="inherit" onClick={handleLogout}>
              {t('navbar.logout')}
            </Button>
          </>
        ) : (
          <>
            <Button color="inherit" component={Link} href={`/${lang}/login`}>
              {t('navbar.login')}
            </Button>
            <Button color="inherit" component={Link} href={`/${lang}/register`}>
              {t('navbar.register')}
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
