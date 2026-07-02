import AdminPageClient from '../../components/AdminPageClient';

export const metadata = {
  title: 'Panel admin - Pescatlántica',
  description: 'Gestión interna de pedidos, productos y mensajes de Pescatlántica.'
};

export default function AdminPage() {
  return (
    <main>
      <AdminPageClient />
    </main>
  );
}
