export default function NosotrosPage() {
    return (
      <main>
        <section className="page-intro">
          <h1>Quiénes somos</h1>
          <p>
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
