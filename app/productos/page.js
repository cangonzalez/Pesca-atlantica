'use client';

import { useState } from 'react';
import ProductCard from '../../components/ProductCard';
import { useCart } from '../../context/CartContext';
import productos from '../../public/productos.json';

const GRAMOS_DISPONIBLES = [100, 200, 250, 300, 350, 500, 600, 700, 800, 1000];

export default function ProductosPage() {
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedGrams, setSelectedGrams] = useState(100);

  const openProductModal = (producto) => {
    setSelectedProduct(producto);
    setSelectedGrams(100);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getSelectedTotal = () => {
    if (!selectedProduct) {
      return 0;
    }

    return Math.round(selectedProduct.precio * (selectedGrams / 100));
  };

  const handleAddToCart = () => {
    if (!selectedProduct) {
      return;
    }

    addToCart({
      id: selectedProduct.id,
      nombre: selectedProduct.nombre,
      imagen: selectedProduct.imagen,
      precioUnitario: selectedProduct.precio,
      gramos: selectedGrams,
      peso: `${selectedGrams}gr`,
      precioTotal: getSelectedTotal()
    });

    closeProductModal();
  };

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
              onAdd={openProductModal}
            />
          ))}
        </div>
      </section>

      {selectedProduct && (
        <div className="modal-overlay active" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
          <div className="modal-content">
            <button
              className="modal-close"
              type="button"
              onClick={closeProductModal}
              aria-label="Cerrar selector de producto"
            >
              &times;
            </button>

            <img
              src={selectedProduct.imagen}
              alt={selectedProduct.nombre}
              className="modal-image"
            />

            <div className="modal-info">
              <h2 id="product-modal-title">{selectedProduct.nombre}</h2>
              <p>{selectedProduct.descripcion}</p>
              <p>
                <strong>{formatPrice(selectedProduct.precio)}</strong> / {selectedProduct.precioPor}
              </p>

              <div className="weight-selector">
                <label>Elegí la cantidad</label>
                <div className="weight-options">
                  {GRAMOS_DISPONIBLES.map((gramos) => (
                    <button
                      key={gramos}
                      className={`weight-btn ${selectedGrams === gramos ? 'active' : ''}`}
                      type="button"
                      onClick={() => setSelectedGrams(gramos)}
                    >
                      {gramos}g
                    </button>
                  ))}
                </div>
              </div>

              <div className="price-display">
                <p>Total estimado</p>
                <p className="total-price">{formatPrice(getSelectedTotal())}</p>
              </div>

              <button className="add-to-cart-btn" type="button" onClick={handleAddToCart}>
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
