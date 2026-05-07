'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import ProductCard from '../../components/ProductCard';
import { useCart } from '../../context/CartContext';
import productos from '../../public/productos.json';

const GRAMOS_DISPONIBLES = [100, 200, 250, 300, 350, 500, 600, 700, 800, 1000];

export default function ProductosPage() {
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedGrams, setSelectedGrams] = useState(100);
  const closeButtonRef = useRef(null);

  const openProductModal = (producto) => {
    setSelectedProduct(producto);
    setSelectedGrams(100);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  useEffect(() => {
    if (!selectedProduct) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeProductModal();
      }
    };

    document.body.classList.add('no-scroll');
    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedProduct]);

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
      <section className="page-intro">
        <h1>Nuestros productos</h1>
        
        <p>
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
        <div
          className="modal-overlay active"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeProductModal();
            }
          }}
        >
          <div className="modal-content" role="document">
            <button
              ref={closeButtonRef}
              className="modal-close"
              type="button"
              onClick={closeProductModal}
              aria-label="Cerrar selector de producto"
            >
              &times;
            </button>

            <Image
              src={selectedProduct.imagen}
              alt={selectedProduct.nombre}
              className="modal-image"
              width={1000}
              height={545}
              sizes="(max-width: 768px) 100vw, 450px"
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
                      aria-pressed={selectedGrams === gramos}
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
