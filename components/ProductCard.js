'use client';

export default function ProductCard({ producto, onClick }) {
  return (
    <div className="producto" onClick={() => onClick(producto)}>
      <img
        src={producto.imagen}
        alt={producto.nombre}
        className="producto-img"
      />

      <h3>{producto.nombre}</h3>

      <p>Categoría: {producto.categoria}</p>

      <p>${producto.precio} / {producto.precioPor}</p>

      <button className="btn">
        Ver detalles
      </button>
    </div>
  );
}