'use client';
import React from 'react';
import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useAuth } from '@/context/AuthContext';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export default function NavBar() {
  const { auth, setAuth } = useAuth();
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const lang = Array.isArray(params.lang) ? params.lang[0] : params.lang ?? 'en';
  const { t } = useTranslation();

  const switchLang = (l: string) => {
    const segments = pathname.split('/');
    if (segments.length > 1) {
      segments[1] = l;
    }
    router.push(segments.join('/'));
  };

  const handleLogout = () => {
    setAuth({ token: null, user: null });
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          TSL App
        </Typography>
        <Button color="inherit" onClick={() => switchLang('en')}>EN</Button>
        <Button color="inherit" onClick={() => switchLang('ru')}>RU</Button>
        <Button color="inherit" onClick={() => switchLang('pl')}>PL</Button>
        {auth.user ? (
          <React.Fragment>
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
            <Button color="inherit" onClick={handleLogout}>{t('navbar.logout')}</Button>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Button color="inherit" component={Link} href={`/${lang}/login`}>
              {t('navbar.login')}
            </Button>
            <Button color="inherit" component={Link} href={`/${lang}/register`}>
              {t('navbar.register')}
            </Button>
          </React.Fragment>
          )}
      </Toolbar>
    </AppBar>
  );
}
