'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { AuthContext } from '../contexts/AuthContext';
import styles from './Cadastro.module.css';

export default function RedefinirSenha() {
  const { api } = React.useContext(AuthContext);
  const token = useSearchParams().get('token') || '';
  const [senha, setSenha] = React.useState('');
  const [confirmation, setConfirmation] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const submit = async (event) => {
    event.preventDefault(); setError(''); setMessage('');
    if (senha !== confirmation) return setError('As senhas nao coincidem.');
    setSaving(true);
    try {
      const response = await api.post('/auth/password/reset', { token, senha });
      setMessage(response.data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Nao foi possivel redefinir a senha.');
    } finally { setSaving(false); }
  };

  return <div className={styles.page}><Header /><main className={styles.main}><Card className={styles.registerCard}>
    <h1 className={styles.title}>Definir nova senha</h1>
    {error && <div className={styles.error}>{error}</div>}{message && <div role="status">{message}</div>}
    {!message && <form className={styles.form} onSubmit={submit}>
      <div className={styles.inputGroup}><label htmlFor="new-password">Nova senha</label><input id="new-password" type="password" minLength={8} value={senha} onChange={(event) => setSenha(event.target.value)} required autoComplete="new-password" /></div>
      <div className={styles.inputGroup}><label htmlFor="confirm-password">Confirmar senha</label><input id="confirm-password" type="password" minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required autoComplete="new-password" /></div>
      <Button type="submit" className={styles.submitBtn} disabled={saving || !token}>{saving ? 'Salvando...' : 'Redefinir senha'}</Button>
    </form>}
    <div className={styles.divider}><span>Ou</span></div><Link href="/login" className={styles.loginLink}>Voltar ao login</Link>
  </Card></main></div>;
}
