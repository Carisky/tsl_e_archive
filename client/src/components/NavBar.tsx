'use client';
import React from 'react';
import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useAuth } from '@/context/AuthContext';

export default function NavBar() {
  const { auth, setAuth } = useAuth();

  const handleLogout = () => {
    setAuth({ token: null, user: null });
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          TSL App
        </Typography>
        {auth.user ? (
          <React.Fragment>
            <Button color="inherit" component={Link} href="/dashboard">
              Dashboard
            </Button>
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Button color="inherit" component={Link} href="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} href="/register">
              Register
            </Button>
          </React.Fragment>
          )}
      </Toolbar>
    </AppBar>
  );
}
