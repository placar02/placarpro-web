'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BrainCircuit, LayoutDashboard, WalletCards, User, LogOut, ShieldCheck } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import styles from './Sidebar.module.css';

const navClass = (pathname, href) => pathname === href ? `${styles.navItem} ${styles.active}` : styles.navItem;

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user, settings } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <img src={settings?.logo_url || '/placarpro-logo.png'} alt={settings?.system_name || 'PlacarPro'} width="70" height="70" />
        <span className={styles.logoText}>{settings?.system_name || 'PlacarPro'}</span>
      </div>

      <nav className={styles.nav}>
        <Link href="/dashboard" className={navClass(pathname, '/dashboard')}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>

        {user?.plano === 'premium' ? (
          <Link href="/analises" className={navClass(pathname, '/analises')}>
            <BrainCircuit size={20} />
            <span>Analises</span>
          </Link>
        ) : null}

        <Link href="/planos" className={navClass(pathname, '/planos')}>
          <WalletCards size={20} />
          <span>Planos</span>
        </Link>

        <Link href="/perfil" className={navClass(pathname, '/perfil')}>
          <User size={20} />
          <span>Perfil</span>
        </Link>

        {user?.role === 'admin' ? (
          <Link href="/admin" className={navClass(pathname, '/admin')}>
            <ShieldCheck size={20} />
            <span>Admin</span>
          </Link>
        ) : null}
      </nav>

      <div className={styles.footer}>
        <button type="button" className={`${styles.navItem} ${styles.logoutButton}`} onClick={handleLogout}>
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
