'use client';

import Image from 'next/image';

function formatPrice(price) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(price);
}

export default function ProductCard({ producto, onAdd }) {
  return (
    <article className="producto">
      <Image
        src={producto.imagen}
        alt={producto.nombre}
        className="producto-img"
        width={1000}
        height={545}
        sizes="(max-width: 768px) 100vw, 33vw"
      />

      <h3>{producto.nombre}</h3>

      <p>Categoría: {producto.categoria}</p>

      <p>{formatPrice(producto.precio)} / {producto.precioPor}</p>

      <button className="btn" type="button" onClick={() => onAdd(producto)}>
        Elegir cantidad
      </button>
    </article>
  );
}
