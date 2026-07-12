import React from 'react';
import Sidebar from '@/components/Sidebar';
import { Bell, Search } from 'lucide-react';
import styles from './DashboardLayout.module.css';

const DashboardLayout = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.mainContent}>
        <div className={styles.topbar}>
          <div className={styles.searchBox}>
            <Search size={17} />
            <span>PlacarPro Intelligence</span>
          </div>
          <button className={styles.iconButton} type="button" aria-label="Notificacoes">
            <Bell size={18} />
          </button>
        </div>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
