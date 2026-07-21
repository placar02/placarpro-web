'use client';

import React from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { AuthContext } from '../contexts/AuthContext';
import styles from './Cadastro.module.css';

export default function RecuperarSenha() {
  const { api } = React.useContext(AuthContext);
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [sending, setSending] = React.useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSending(true); setError(''); setMessage('');
    try {
      const response = await api.post('/auth/password/forgot', { email });
      setMessage(response.data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Nao foi possivel solicitar a recuperacao.');
    } finally { setSending(false); }
  };

  return <div className={styles.page}><Header /><main className={styles.main}><Card className={styles.registerCard}>
    <h1 className={styles.title}>Recuperar senha</h1>
    {error && <div className={styles.error}>{error}</div>}
    {message && <div role="status">{message}</div>}
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.inputGroup}><label htmlFor="recovery-email">Email</label><input id="recovery-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></div>
      <Button type="submit" className={styles.submitBtn} disabled={sending}>{sending ? 'Enviando...' : 'Enviar instrucoes'}</Button>
    </form>
    <div className={styles.divider}><span>Ou</span></div><Link href="/login" className={styles.loginLink}>Voltar ao login</Link>
  </Card></main></div>;
}
