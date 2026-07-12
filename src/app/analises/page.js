import ProtectedRoute from '@/components/ProtectedRoute';
import Analises from '@/views/Analises';

export default function Page() {
  return (
    <ProtectedRoute>
      <Analises />
    </ProtectedRoute>
  );
}
