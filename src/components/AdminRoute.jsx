'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { ShieldX } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';

export default function AdminRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Validando permissões...</div>;
  if (!user || user.role !== 'admin') {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f5f7f6' }}>
        <section style={{ textAlign: 'center', background: '#fff', padding: 40, borderRadius: 20, maxWidth: 460, boxShadow: '0 12px 40px rgba(0,0,0,.08)' }}>
          <ShieldX size={52} color="#dc2626" />
          <h1>403 - Acesso negado</h1>
          <p style={{ color: '#667085', margin: '12px 0 24px' }}>Esta área é exclusiva para administradores.</p>
          <Link href={user ? '/dashboard' : '/login'} style={{ color: '#08783e', fontWeight: 700 }}>Voltar ao PlacarPro</Link>
        </section>
      </main>
    );
  }
  return children;
}
