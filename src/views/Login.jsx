'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import styles from './Cadastro.module.css'; // Reutilizando os mesmos estilos do Cadastro
import { AuthContext } from '../contexts/AuthContext';

const Login = () => {
  const { login } = React.useContext(AuthContext);
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [senha, setSenha] = React.useState('');
  const [error, setError] = React.useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, senha);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    }
  };
  return (
    <div className={styles.page}>
      <Header />
      
      <main className={styles.main}>
        <Card className={styles.registerCard}>
          <h1 className={styles.title}>Bem-vindo de volta</h1>
          
          {error && <div className={styles.error}>{error}</div>}
          <form className={styles.form} onSubmit={handleLogin}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input type="email" id="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="senha">Senha</label>
              <input type="password" id="senha" placeholder="Sua senha secreta" value={senha} onChange={(e) => setSenha(e.target.value)} required />
            </div>
            
            {/* <div style={{ textAlign: 'right' }}>
              <a href="#" className={styles.loginLink} style={{ fontSize: '0.85rem' }}>Esqueceu sua senha?</a>
            </div> */}
            
            <Button variant="primary" className={styles.submitBtn} type="submit" style={{ width: '100%' }}>Entrar</Button>
          </form>
          
          <div className={styles.divider}>
            <span>Ou</span>
          </div>
          
          <Link href="/cadastro" className={styles.loginLink}>Ainda nao tem conta? Inscreva-se</Link>
        </Card>
      </main>
    </div>
  );
};

export default Login;
