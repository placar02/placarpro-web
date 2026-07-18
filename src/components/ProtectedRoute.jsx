'use client';

import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/ui';

const ProtectedRoute = ({ children }) => {
  const { authenticated, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !authenticated) router.replace('/login');
  }, [authenticated, loading, router]);

  if (loading || !authenticated) return <LoadingState title="Validando acesso" description="Estamos conferindo sua sessao antes de abrir a plataforma." />;

  return children;
};

export default ProtectedRoute;
