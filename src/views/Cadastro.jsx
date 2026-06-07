'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { AuthContext } from '../contexts/AuthContext';
import styles from './Cadastro.module.css';

const Cadastro = () => {
  const { register } = React.useContext(AuthContext);
  const router = useRouter();
  const [nome, setNome] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [senha, setSenha] = React.useState('');
  const [error, setError] = React.useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(nome, email, senha);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao cadastrar');
    }
  };

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <Card className={styles.registerCard}>
          <h1 className={styles.title}>Crie uma conta</h1>

          {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}
          <form className={styles.form} onSubmit={handleRegister}>
            <div className={styles.inputGroup}>
              <label htmlFor="nome">Nome Completo</label>
              <input type="text" id="nome" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input type="email" id="email" placeholder="email@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="senha">Senha</label>
              <input type="password" id="senha" placeholder="Sua senha secreta" value={senha} onChange={(e) => setSenha(e.target.value)} required />
            </div>

            <Button variant="primary" className={styles.submitBtn} type="submit">Inscreva-se</Button>
          </form>

          <div className={styles.divider}>
            <span>Ou</span>
          </div>

          <Link href="/login" className={styles.loginLink}>Ja tenho uma conta</Link>
        </Card>
      </main>
    </div>
  );
};

export default Cadastro;
