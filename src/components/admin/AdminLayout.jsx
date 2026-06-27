'use client';

import React, { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Users, BadgeDollarSign, CreditCard, Settings, ScrollText, LogOut, ExternalLink } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import styles from './AdminLayout.module.css';

const items = [
  ['dashboard', 'Visão geral', BarChart3], ['users', 'Usuários', Users], ['plans', 'Planos', BadgeDollarSign],
  ['payments', 'Pagamentos', CreditCard], ['settings', 'Configurações', Settings], ['audit-logs', 'Auditoria', ScrollText],
];

export default function AdminLayout({ section, onSection, children }) {
  const { user, logout, settings } = useContext(AuthContext);
  const router = useRouter();
  const signOut = () => { logout(); router.replace('/login'); };
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar} style={{ backgroundColor: 'var(--secondary-color)' }}>
        <div className={styles.brand}><img src={settings?.logo_url || '/placarpro-logo.png'} alt="" /><div><strong>{settings?.system_name || 'PlacarPro'}</strong><span>Administração</span></div></div>
        <nav>{items.map(([key, label, Icon]) => <button type="button" key={key} onClick={() => onSection(key)} className={section === key ? styles.active : ''} style={section === key ? { color: 'var(--primary-color)' } : undefined}><Icon size={19} /><span>{label}</span></button>)}</nav>
        <div className={styles.sideFooter}>
          <button type="button" onClick={() => router.push('/dashboard')}><ExternalLink size={18} />Ver plataforma</button>
          <button type="button" onClick={signOut}><LogOut size={18} />Sair</button>
        </div>
      </aside>
      <div className={styles.content}>
        <header className={styles.navbar}><div><span>Painel administrativo</span><strong>{items.find(([key]) => key === section)?.[1]}</strong></div><div className={styles.profile}><span>{user?.nome}</span><b>{user?.nome?.charAt(0)?.toUpperCase()}</b></div></header>
        <main>{children}</main>
      </div>
    </div>
  );
}
