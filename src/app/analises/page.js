import ProtectedRoute from '@/components/ProtectedRoute';
import PremiumRoute from '@/components/PremiumRoute';
import Analises from '@/views/Analises';

export default function Page() {
  return (
    <ProtectedRoute>
      <PremiumRoute>
        <Analises />
      </PremiumRoute>
    </ProtectedRoute>
  );
}
