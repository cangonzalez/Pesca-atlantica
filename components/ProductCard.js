'use client';

export default function ProductCard({ producto, onAdd }) {
  return (
    <article className="producto">
      <img
        src={producto.imagen}
        alt={producto.nombre}
        className="producto-img"
      />

      <h3>{producto.nombre}</h3>

      <p>Categoría: {producto.categoria}</p>

      <p>${producto.precio} / {producto.precioPor}</p>

      <button className="btn" type="button" onClick={() => onAdd(producto)}>
        Agregar al carrito
      </button>
    </article>
  );
}
