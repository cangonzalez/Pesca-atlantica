import AccountPageClient from '../../components/AccountPageClient';

export const metadata = {
  title: 'Mi cuenta - Pescatlántica',
  description: 'Consultá tu sesión e historial de compras en Pescatlántica.'
};

export default function CuentaPage() {
  return (
    <main>
      <AccountPageClient />
    </main>
  );
}
