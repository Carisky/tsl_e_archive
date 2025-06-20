'use client';
import { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
}

interface AuthContextType {
  auth: AuthState;
  setAuth: (value: AuthState) => void;
  initialized: boolean;
}

const AuthContext = createContext<AuthContextType>({
  auth: { token: null, user: null },
  setAuth: () => {},
  initialized: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuthState] = useState<AuthState>({ token: null, user: null });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setAuthState({ token, user: JSON.parse(user) });
    }
    setInitialized(true);
  }, []);

  const setAuth = (value: AuthState) => {
    setAuthState(value);
    if (value.token && value.user) {
      localStorage.setItem('token', value.token);
      localStorage.setItem('user', JSON.stringify(value.user));
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, initialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
