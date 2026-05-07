import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
    return (
      <main>
        <section className="hero">
          <h2>Frescura del mar, directo a tu mesa</h2>
          <p>
            En Pescatlántica controlamos toda la cadena:
            captura, procesamiento, distribución y venta.
          </p>
          <Link href="/productos" className="btn btn-light">Comprar productos</Link>
        </section>
  
        <section className="flota">
          <div className="grid">
            <div className="imagen-seccion">
              <Image
                src="/imagenes/barco_costado.jpg"
                alt="Flota pesquera"
                width={1100}
                height={1836}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
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
              <Image
                src="/imagenes/pescado_barco.jpeg"
                alt="Equipo pescando"
                width={1600}
                height={1200}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </section>
  
        <section className="distribucion">
          <div className="grid">
            <div className="imagen-seccion">
              <Image
                src="/imagenes/camion.jpeg"
                alt="Distribución refrigerada"
                width={1920}
                height={2560}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
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
          <Image
            src="/imagenes/merluza.jpg"
            alt="Merluza premium"
            width={1024}
            height={559}
            sizes="(max-width: 768px) 100vw, 700px"
          />
          <p>
            Productos frescos y congelados listos para restaurantes,
            supermercados y consumidores finales.
          </p>
          <Link href="/productos" className="btn btn-dark">Ver catálogo</Link>
        </section>
      </main>
    );
  }
