'use client';

import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/ui';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) router.replace('/login');
  }, [loading, router, token]);

  if (loading || !token) return <LoadingState title="Validando acesso" description="Estamos conferindo sua sessao antes de abrir a plataforma." />;

  return children;
};

export default ProtectedRoute;
