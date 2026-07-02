'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

const EMPTY_PRODUCT = {
  nombre: '',
  precio: '',
  categoria: 'Pescado',
  imagen: '/imagenes/',
  descripcion: '',
  precioPor: '100gr',
  activo: true
};

const ORDER_STATUSES = [
  'preference_created',
  'approved',
  'pending',
  'in_process',
  'rejected',
  'cancelled',
  'delivered'
];

function formatPrice(price) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(Number(price || 0));
}

function formatDate(date) {
  if (!date) {
    return 'Sin fecha';
  }

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

function getItemsLabel(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return 'Sin productos';
  }

  return items.map((item) => `${item.title} x ${item.quantity}`).join(', ');
}

export default function AdminPageClient() {
  const { isAuthReady, isAuthenticated, user, getAccessToken } = useCart();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyKey, setBusyKey] = useState('');

  const adminFetch = async (url, options = {}) => {
    const hasBody = Boolean(options.body);
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
        Authorization: `Bearer ${getAccessToken()}`
      }
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'No se pudo completar la operacion.');
    }

    return data;
  };

  const loadAdminData = async () => {
    setIsLoading(true);
    setError('');
    setNotice('');

    try {
      const [ordersData, productsData, messagesData] = await Promise.all([
        adminFetch('/api/admin/orders'),
        adminFetch('/api/admin/products'),
        adminFetch('/api/admin/contact-messages')
      ]);

      setOrders(ordersData.orders || []);
      setProducts(productsData.products || []);
      setMessages(messagesData.messages || []);
    } catch (loadError) {
      setError(loadError.message || 'No se pudo cargar el panel admin.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthReady && isAuthenticated) {
      loadAdminData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthReady, isAuthenticated]);

  const handleOrderChange = (id, field, value) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === id ? { ...order, [field]: value } : order
      )
    );
  };

  const saveOrder = async (order) => {
    setBusyKey(`order-${order.id}`);
    setError('');

    try {
      const data = await adminFetch('/api/admin/orders', {
        method: 'PATCH',
        body: JSON.stringify(order)
      });

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id ? data.order : currentOrder
        )
      );
      setNotice('Pedido actualizado.');
    } catch (saveError) {
      setError(saveError.message || 'No se pudo actualizar el pedido.');
    } finally {
      setBusyKey('');
    }
  };

  const handleProductInput = (event) => {
    const { name, value, type, checked } = event.target;
    setProductForm((currentForm) => ({
      ...currentForm,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const startEditingProduct = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      nombre: product.nombre || '',
      precio: product.precio || '',
      categoria: product.categoria || '',
      imagen: product.imagen || '',
      descripcion: product.descripcion || '',
      precioPor: product.precioPor || '100gr',
      activo: product.activo !== false
    });
    setActiveTab('products');
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm(EMPTY_PRODUCT);
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setBusyKey('product-form');
    setError('');

    try {
      const payload = {
        ...productForm,
        precio: Number(productForm.precio),
        ...(editingProductId ? { id: editingProductId } : {})
      };
      const data = await adminFetch('/api/admin/products', {
        method: editingProductId ? 'PATCH' : 'POST',
        body: JSON.stringify(payload)
      });

      if (editingProductId) {
        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product.id === editingProductId ? data.product : product
          )
        );
        setNotice('Producto actualizado.');
      } else {
        setProducts((currentProducts) => [...currentProducts, data.product]);
        setNotice('Producto creado.');
      }

      resetProductForm();
    } catch (saveError) {
      setError(saveError.message || 'No se pudo guardar el producto.');
    } finally {
      setBusyKey('');
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Eliminar ${product.nombre}?`)) {
      return;
    }

    setBusyKey(`product-${product.id}`);
    setError('');

    try {
      await adminFetch(`/api/admin/products?id=${product.id}`, {
        method: 'DELETE'
      });
      setProducts((currentProducts) =>
        currentProducts.filter((currentProduct) => currentProduct.id !== product.id)
      );
      setNotice('Producto eliminado.');
    } catch (deleteError) {
      setError(deleteError.message || 'No se pudo eliminar el producto.');
    } finally {
      setBusyKey('');
    }
  };

  const updateMessage = async (message, status = 'read') => {
    setBusyKey(`message-${message.id}`);
    setError('');

    try {
      const data = await adminFetch('/api/admin/contact-messages', {
        method: 'PATCH',
        body: JSON.stringify({ id: message.id, status })
      });
      setMessages((currentMessages) =>
        currentMessages.map((currentMessage) =>
          currentMessage.id === message.id ? data.message : currentMessage
        )
      );
      setNotice(status === 'archived' ? 'Mensaje archivado.' : 'Mensaje marcado como leido.');
    } catch (messageError) {
      setError(messageError.message || 'No se pudo actualizar el mensaje.');
    } finally {
      setBusyKey('');
    }
  };

  const deleteMessage = async (message) => {
    if (!window.confirm(`Eliminar mensaje de ${message.email}?`)) {
      return;
    }

    setBusyKey(`message-${message.id}`);
    setError('');

    try {
      await adminFetch(`/api/admin/contact-messages?id=${message.id}`, {
        method: 'DELETE'
      });
      setMessages((currentMessages) =>
        currentMessages.filter((currentMessage) => currentMessage.id !== message.id)
      );
      setNotice('Mensaje eliminado.');
    } catch (messageError) {
      setError(messageError.message || 'No se pudo eliminar el mensaje.');
    } finally {
      setBusyKey('');
    }
  };

  if (!isAuthReady) {
    return (
      <section className="admin-page">
        <p>Cargando panel...</p>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="admin-page">
        <div className="admin-hero">
          <p className="payment-eyebrow">Panel admin</p>
          <h1>Necesitas iniciar sesion</h1>
          <p>Usa el menu de cuenta para entrar con un email incluido en ADMIN_EMAILS.</p>
          <Link className="btn" href="/productos">Volver a productos</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <div className="admin-hero">
        <div>
          <p className="payment-eyebrow">Panel admin</p>
          <h1>Gestion de Pescatlantica</h1>
          <p>{user?.email}</p>
        </div>
        <button className="clear-cart-btn" type="button" onClick={loadAdminData} disabled={isLoading}>
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      <div className="admin-tabs" role="tablist" aria-label="Secciones admin">
        <button
          className={activeTab === 'orders' ? 'active' : ''}
          type="button"
          onClick={() => setActiveTab('orders')}
        >
          Pedidos ({orders.length})
        </button>
        <button
          className={activeTab === 'products' ? 'active' : ''}
          type="button"
          onClick={() => setActiveTab('products')}
        >
          Productos ({products.length})
        </button>
        <button
          className={activeTab === 'messages' ? 'active' : ''}
          type="button"
          onClick={() => setActiveTab('messages')}
        >
          Mensajes ({messages.length})
        </button>
      </div>

      {error && <p className="cart-error admin-alert" role="alert">{error}</p>}
      {notice && <p className="cart-success admin-alert" role="status">{notice}</p>}

      {activeTab === 'orders' && (
        <div className="admin-list">
          {orders.length === 0 && !isLoading && <p>No hay pedidos para mostrar.</p>}
          {orders.map((order) => (
            <article className="admin-record" key={order.id}>
              <div className="admin-record-header">
                <div>
                  <strong>{formatPrice(order.total_amount)}</strong>
                  <span>{formatDate(order.created_at)}</span>
                </div>
                <span className={`admin-status status-${order.status || 'unknown'}`}>
                  {order.status || 'sin_estado'}
                </span>
              </div>

              <p>{getItemsLabel(order.items)}</p>

              <div className="admin-record-grid">
                <label>
                  Estado
                  <select
                    value={order.status || ''}
                    onChange={(event) => handleOrderChange(order.id, 'status', event.target.value)}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Detalle
                  <input
                    type="text"
                    value={order.status_detail || ''}
                    onChange={(event) => handleOrderChange(order.id, 'status_detail', event.target.value)}
                    placeholder="Detalle del estado"
                  />
                </label>
                <label>
                  Telefono
                  <input
                    type="tel"
                    value={order.buyer_phone || ''}
                    onChange={(event) => handleOrderChange(order.id, 'buyer_phone', event.target.value)}
                  />
                </label>
                <label>
                  Entrega
                  <input
                    type="text"
                    value={order.delivery_address || ''}
                    onChange={(event) => handleOrderChange(order.id, 'delivery_address', event.target.value)}
                  />
                </label>
              </div>

              <label className="admin-full-field">
                Notas
                <textarea
                  value={order.delivery_notes || ''}
                  onChange={(event) => handleOrderChange(order.id, 'delivery_notes', event.target.value)}
                  rows="2"
                />
              </label>

              <div className="admin-record-footer">
                <small>{order.buyer_name || 'Sin nombre'} - {order.buyer_email || 'Sin email'}</small>
                <button
                  className="checkout-btn compact"
                  type="button"
                  onClick={() => saveOrder(order)}
                  disabled={busyKey === `order-${order.id}`}
                >
                  {busyKey === `order-${order.id}` ? 'Guardando...' : 'Guardar pedido'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {activeTab === 'products' && (
        <div className="admin-products-layout">
          <form className="admin-form" onSubmit={saveProduct}>
            <h2>{editingProductId ? 'Editar producto' : 'Crear producto'}</h2>
            <div className="admin-form-grid">
              <label>
                Nombre
                <input name="nombre" value={productForm.nombre} onChange={handleProductInput} required />
              </label>
              <label>
                Categoria
                <input name="categoria" value={productForm.categoria} onChange={handleProductInput} required />
              </label>
              <label>
                Precio
                <input name="precio" type="number" min="1" value={productForm.precio} onChange={handleProductInput} required />
              </label>
              <label>
                Precio por
                <input name="precioPor" value={productForm.precioPor} onChange={handleProductInput} required />
              </label>
            </div>
            <label>
              Imagen
              <input name="imagen" value={productForm.imagen} onChange={handleProductInput} required />
            </label>
            <label>
              Descripcion
              <textarea name="descripcion" value={productForm.descripcion} onChange={handleProductInput} rows="4" required />
            </label>
            <label className="admin-checkbox">
              <input name="activo" type="checkbox" checked={productForm.activo} onChange={handleProductInput} />
              Visible en catalogo
            </label>
            <div className="admin-form-actions">
              <button className="checkout-btn" type="submit" disabled={busyKey === 'product-form'}>
                {busyKey === 'product-form' ? 'Guardando...' : editingProductId ? 'Guardar cambios' : 'Crear producto'}
              </button>
              {editingProductId && (
                <button className="clear-cart-btn" type="button" onClick={resetProductForm}>
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.nombre}</strong>
                      <small>{product.categoria}</small>
                    </td>
                    <td>{formatPrice(product.precio)} / {product.precioPor}</td>
                    <td>{product.activo ? 'Visible' : 'Oculto'}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button type="button" onClick={() => startEditingProduct(product)}>Editar</button>
                        <button
                          type="button"
                          onClick={() => deleteProduct(product)}
                          disabled={busyKey === `product-${product.id}`}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="admin-list">
          {messages.length === 0 && !isLoading && <p>No hay mensajes para mostrar.</p>}
          {messages.map((message) => (
            <article className="admin-record" key={message.id}>
              <div className="admin-record-header">
                <div>
                  <strong>{message.nombre}</strong>
                  <span>{formatDate(message.created_at)}</span>
                </div>
                <span className={`admin-status ${message.is_read ? 'status-read' : 'status-new'}`}>
                  {message.status || 'new'}
                </span>
              </div>
              <p>{message.mensaje}</p>
              <small>{message.email} {message.telefono ? `- ${message.telefono}` : ''}</small>
              <div className="admin-record-footer">
                <span />
                <div className="admin-row-actions">
                  <button
                    type="button"
                    onClick={() => updateMessage(message, 'read')}
                    disabled={busyKey === `message-${message.id}`}
                  >
                    Marcar leido
                  </button>
                  <button
                    type="button"
                    onClick={() => updateMessage(message, 'archived')}
                    disabled={busyKey === `message-${message.id}`}
                  >
                    Archivar
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMessage(message)}
                    disabled={busyKey === `message-${message.id}`}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
