'use client';
import dynamic from 'next/dynamic';
const NavBar = dynamic(() => import('./NavBar'), { ssr: false });
export default function NavBarClient() {
  return <NavBar />;
}
