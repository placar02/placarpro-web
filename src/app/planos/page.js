import ProtectedRoute from '@/components/ProtectedRoute';
import Planos from '@/views/Planos';

export default function Page() {
  return (
    <ProtectedRoute>
      <Planos />
    </ProtectedRoute>
  );
}
