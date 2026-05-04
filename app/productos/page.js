export default function ProductosPage() {
    return (
      <main>
        <section style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '24px' }}>
            Nuestros productos
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#666', maxWidth: '700px', margin: '0 auto 40px' }}>
            Productos frescos y congelados provenientes del Atlántico Sur.
            Captura diaria, procesamiento inmediato y distribución refrigerada.
          </p>
  
          <div className="grid" id="contenedor-productos">
            <p>Cargando productos...</p>
          </div>
        </section>
      </main>
    );
  }