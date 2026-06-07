import ProtectedRoute from '@/components/ProtectedRoute';
import Perfil from '@/views/Perfil';

export default function Page() {
  return (
    <ProtectedRoute>
      <Perfil />
    </ProtectedRoute>
  );
}
