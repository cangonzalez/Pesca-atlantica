export default function NosotrosPage() {
    return (
      <main>
        <section style={{ textAlign: 'center', padding: '60px 20px', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '24px' }}>
            Quiénes somos
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#666', maxWidth: '700px', margin: '0 auto' }}>
            En Pescatlántica controlamos toda la cadena de valor: pesca, procesamiento y distribución.
          </p>
        </section>
  
        <section className="grid">
          <div className="card">
            <h3>Misión</h3>
            <p>Brindar productos premium del mar, garantizando frescura y calidad.</p>
          </div>
          <div className="card">
            <h3>Visión</h3>
            <p>Ser referentes del mercado pesquero nacional e internacional.</p>
          </div>
          <div className="card">
            <h3>Valores</h3>
            <p>Calidad, transparencia, sustentabilidad y compromiso.</p>
          </div>
          <div className="card">
            <h3>Experiencia</h3>
            <p>Más de 20 años operando en el Atlántico Sur.</p>
          </div>
        </section>
      </main>
    );
  }