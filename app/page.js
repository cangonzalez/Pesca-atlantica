export default function Home() {
    return (
      <main>
        <section className="hero">
          <h2>Del Atlántico Sur al consumidor final</h2>
          <p>
            En Pescatlántica controlamos toda la cadena:
            captura, procesamiento, distribución y venta.
          </p>
          <a href="/productos" className="btn">Comprar productos</a>
        </section>
  
        <section className="flota">
          <div className="grid">
            <div className="imagen-seccion">
              <img src="/imagenes/barco_costado.png" alt="Flota pesquera" />
            </div>
            <div className="texto-seccion">
              <h2>Nuestra flota</h2>
              <p>
                Contamos con embarcaciones propias que operan
                diariamente en el Atlántico Sur garantizando
                trazabilidad desde el origen.
              </p>
            </div>
          </div>
        </section>
  
        <section className="captura">
          <div className="grid">
            <div className="texto-seccion">
              <h2>Captura diaria</h2>
              <p>
                Nuestro equipo realiza capturas diarias asegurando
                productos frescos y abastecimiento constante.
              </p>
            </div>
            <div className="imagen-seccion">
              <img src="/imagenes/pescado_barco.jpeg" alt="Equipo pescando" />
            </div>
          </div>
        </section>
  
        <section className="distribucion">
          <div className="grid">
            <div className="imagen-seccion">
              <img src="/imagenes/camion.jpeg" alt="Distribución refrigerada" />
            </div>
            <div className="texto-seccion">
              <h2>Procesamiento y distribución</h2>
              <p>
                Procesamos rápidamente cada producto y mantenemos
                cadena de frío durante toda la logística.
              </p>
            </div>
          </div>
        </section>
  
        <section className="producto-final">
          <h2>Calidad premium</h2>
          <img src="/imagenes/merluza.jpg" alt="Merluza premium" />
          <p>
            Productos frescos y congelados listos para restaurantes,
            supermercados y consumidores finales.
          </p>
          <a href="/productos" className="btn">Ver catálogo</a>
        </section>
      </main>
    );
  }