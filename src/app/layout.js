import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import SecurityShield from '@/components/SecurityShield';

export const metadata = {
  title: 'Placar Pro',
  description: 'Dashboard de alavancagem com analise de IA'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <SecurityShield />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
