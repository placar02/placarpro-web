'use client';

import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';

const PremiumRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const isPremium = user?.plano === 'premium';

  useEffect(() => {
    if (!loading && user && !isPremium) router.replace('/planos');
  }, [isPremium, loading, router, user]);

  if (loading || !user || !isPremium) {
    return <div style={{ padding: '40px' }}>Validando plano...</div>;
  }

  return children;
};

export default PremiumRoute;
