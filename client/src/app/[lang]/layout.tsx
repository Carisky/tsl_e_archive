import type { Metadata } from 'next';
import '../globals.css';
import NavBar from '@/components/NavBar';
import { AuthProvider } from '@/context/AuthContext';
import ThemeRegistry from '@/components/ThemeRegistry';
import TranslationProvider from '@/components/TranslationProvider';

export const metadata: Metadata = {
  title: 'TSL App',
  description: 'i18n demo',
};

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const lang = params.lang;
  return (
    <ThemeRegistry>
      <AuthProvider>
        <TranslationProvider lang={lang}>
          <NavBar />
          {children}
        </TranslationProvider>
      </AuthProvider>
    </ThemeRegistry>
  );
}
