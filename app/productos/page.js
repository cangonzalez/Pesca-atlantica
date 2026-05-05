'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect para cargar productos
  useEffect(() => {
    fetch('/productos.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al cargar productos');
        }
        return response.json();
      })
      .then(data => {
        setProductos(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleProductClick = (producto) => {
    alert(`Producto seleccionado: ${producto.nombre}\nPrecio: $${producto.precio}`);
  };

  if (loading) {
    return (
      <main>
        <section style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p>Cargando productos...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <section style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: '#666' }}>Error: {error}</p>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 700, 
          marginBottom: '24px',
          color: '#0a0a0a'
        }}>
          Nuestros productos
        </h2>
        
        <p style={{ 
          fontSize: '1.125rem', 
          color: '#666', 
          maxWidth: '700px', 
          margin: '0 auto 60px',
          lineHeight: '1.6'
        }}>
          Productos frescos y congelados provenientes del Atlántico Sur.
        </p>

        <div className="grid" id="contenedor-productos">
          {productos.map((producto) => (
            <ProductCard
              key={producto.id}
              producto={producto}
              onClick={handleProductClick}
            />
          ))}
        </div>
      </section>
    </main>
  );
}