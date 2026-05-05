import { CartProvider } from '@/context/CartContext';
import '../styles/globals.css';

export const metadata = {
  title: 'Pescatlántica - Pescadería Artesanal',
  description: 'Del Atlántico Sur al consumidor final.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CartProvider>
          <header className="header">
            <img src="/imagenes/logo.jpeg" alt="Logo Pescatlántica" className="logo" />
          </header>

          <nav className="nav">
            <ul>
              <li><a href="/">Inicio</a></li>
              <li><a href="/nosotros">Nosotros</a></li>
              <li><a href="/productos">Productos</a></li>
              <li><a href="/contacto">Contacto</a></li>
            </ul>
          </nav>

          {children}

          <footer className="footer">
            <p>© 2026 Pescatlántica. Todos los derechos reservados.</p>
            <p>Pesca sostenible • Calidad garantizada • Tradición familiar</p>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}