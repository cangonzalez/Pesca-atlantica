'use client';

import { useState } from 'react';
import ProductCard from '../../components/ProductCard';
import { useCart } from '../../context/CartContext';
import productos from '../../public/productos.json';

const GRAMOS_DISPONIBLES = [100, 200, 250, 300, 350, 500, 600, 700, 800, 1000];

export default function ProductosPage() {
  const { cart, addToCart, removeFromCart, clearCart, getTotal } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedGrams, setSelectedGrams] = useState(100);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartItemCount = cart.reduce((sum, item) => sum + (item.cantidad || 1), 0);

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
    setIsCartOpen(true);
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

      <button
        className="cart-icon"
        type="button"
        onClick={() => setIsCartOpen(true)}
        aria-label="Abrir carrito"
      >
        <span>Carrito</span>
        {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
      </button>

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

      <aside className={`cart-sidebar ${isCartOpen ? 'active' : ''}`} aria-label="Carrito de compras">
        <div className="cart-header">
          <h2>Carrito</h2>
          <button
            className="cart-item-remove"
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="Cerrar carrito"
          >
            &times;
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <p className="empty-cart">Todavía no agregaste productos.</p>
          ) : (
            cart.map((item, index) => (
              <div className="cart-item" key={`${item.id}-${item.peso}`}>
                <img src={item.imagen} alt={item.nombre} className="cart-item-image" />
                <div className="cart-item-info">
                  <h4>{item.nombre}</h4>
                  <p>
                    {item.cantidad > 1
                      ? `${item.gramosTotales}g total (${item.peso} x ${item.cantidad})`
                      : item.peso}
                  </p>
                  <p>{formatPrice(item.precioTotal)}</p>
                </div>
                <button
                  className="cart-item-remove"
                  type="button"
                  onClick={() => removeFromCart(index)}
                  aria-label={`Quitar ${item.nombre}`}
                >
                  &times;
                </button>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-total">
            <span>Total</span>
            <span>{formatPrice(getTotal())}</span>
          </div>
          <button
            className="checkout-btn"
            type="button"
            onClick={clearCart}
            disabled={cart.length === 0}
          >
            Vaciar carrito
          </button>
        </div>
      </aside>
    </main>
  );
}
