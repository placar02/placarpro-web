'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import { User, Lock, Mail } from 'lucide-react';
import styles from './Perfil.module.css';
import { AuthContext } from '../contexts/AuthContext';

const Perfil = () => {
  const { user, logout } = React.useContext(AuthContext);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  return (
    <DashboardLayout>
      <div className={styles.header}>
        <h1 className={styles.title}>Perfil</h1>
        <p className={styles.subtitle}>Suas informações</p>
      </div>

      <Card className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            {user?.nome?.substring(0,2).toUpperCase()}
          </div>
          <div>
            <h2 className={styles.name}>{user?.nome}</h2>
            <p className={styles.emailText}>Plano {user?.plano === 'premium' ? 'Premium 👑' : 'Básico'}</p>
          </div>
        </div>

        <form className={styles.form}>
          <div className={styles.inputGroup}>
            <label><User size={16} /> Nome Completo</label>
            <input type="text" defaultValue={user?.nome} />
          </div>

          <div className={styles.inputGroup}>
            <label><Mail size={16} /> Email</label>
            <input type="email" defaultValue={user?.email} disabled />
          </div>

          <div className={styles.divider}></div>

          {/* <h3 className={styles.sectionTitle}>Segurança</h3>

          <div className={styles.inputGroup}>
            <label><Lock size={16} /> Nova Senha</label>
            <input type="password" placeholder="Digite a nova senha" />
          </div>

          <div className={styles.inputGroup}>
            <label><Lock size={16} /> Confirmar Senha</label>
            <input type="password" placeholder="Confirme a nova senha" />
          </div> */}

          <div className={styles.formActions}>
            <Button variant="outline" type="button" className={styles.logoutBtn} onClick={handleLogout}>Sair da conta</Button>
            {/* <Button variant="primary" type="button">Salvar alterações</Button> */}
          </div>
        </form>
      </Card>
    </DashboardLayout>
  );
};

export default Perfil;
