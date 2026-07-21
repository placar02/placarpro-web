import { Suspense } from 'react';
import RedefinirSenha from '@/views/RedefinirSenha';

export default function Page() {
  return <Suspense fallback={null}><RedefinirSenha /></Suspense>;
}
