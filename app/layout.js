import { CartProvider } from '../context/CartContext';
import AccountMenu from '../components/AccountMenu';
import CartSidebar from '../components/CartSidebar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import NavLink from '../components/NavLink';
import { Poppins } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import '../styles/globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap'
});

export const metadata = {
  title: 'Pescatlántica - Pescadería Artesanal',
  description: 'Frescura del mar, directo a tu mesa.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={poppins.className}>
        <CartProvider>
          <header className="header">
            <Link href="/" aria-label="Ir al inicio de Pescatlántica">
              <Image
                src="/imagenes/logo.jpeg"
                alt="Logo Pescatlántica"
                className="logo"
                width={180}
                height={180}
                priority
              />
            </Link>
            <AccountMenu />
            <LanguageSwitcher />
          </header>

          <nav className="nav">
            <ul>
              <li><NavLink href="/">Inicio</NavLink></li>
              <li><NavLink href="/nosotros">Nosotros</NavLink></li>
              <li><NavLink href="/productos">Productos</NavLink></li>
              <li><NavLink href="/contacto">Contacto</NavLink></li>
              <li><NavLink href="/cuenta">Cuenta</NavLink></li>
            </ul>
          </nav>

          {children}

          <CartSidebar />

          <footer className="footer">
            <p>© 2026 Pescatlántica. Todos los derechos reservados.</p>
            <p>Pesca sostenible • Calidad garantizada • Tradición familiar</p>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
