import Image from 'next/image';
import Link from 'next/link';

const VALUES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: 'Trayectoria',
    text: 'Más de 20 años operando en el Atlántico Sur con presencia en los principales puertos pesqueros del país.'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Calidad garantizada',
    text: 'Controlamos cada etapa del proceso: desde la captura hasta la entrega, manteniendo la cadena de frío en todo momento.'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Equipo propio',
    text: 'Contamos con operarios especializados, flota propia y planta de procesamiento en Mar del Plata.'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    title: 'Empresa familiar',
    text: 'Somos una empresa de tradición familiar comprometida con la sustentabilidad y el desarrollo del sector pesquero nacional.'
  }
];

const PROCESS_PHOTOS = [
  { src: '/imagenes/planta1.jpg', caption: 'Fileteo artesanal' },
  { src: '/imagenes/planta2.jpg', caption: 'Control de calidad' },
  { src: '/imagenes/planta3.jpg', caption: 'Clasificación y almacenamiento' },
  { src: '/imagenes/planta4.jpg', caption: 'Procesamiento en planta' }
];

export default function NosotrosPage() {
  return (
    <main>
      <section className="page-intro">
        <h1>Quiénes somos</h1>
        <p>
          En Pescatlántica controlamos toda la cadena de valor: captura, procesamiento y distribución directa al consumidor.
        </p>
      </section>

      <section className="nosotros-historia">
        <div className="grid">
          <div className="imagen-seccion">
            <Image
              src="/imagenes/barco_costado.jpg"
              alt="Flota de Pescatlántica"
              width={1100}
              height={1836}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="texto-seccion">
            <h2>Nuestra historia</h2>
            <p>
              Pescatlántica nació de la pasión por el mar y el compromiso con la calidad. Comenzamos como una pequeña empresa familiar en Mar del Plata y crecimos hasta convertirnos en un referente del sector pesquero del Atlántico Sur.
            </p>
            <p style={{ marginTop: '1rem' }}>
              Hoy operamos con flota propia, planta de procesamiento y distribución refrigerada, garantizando que cada producto llegue fresco y en óptimas condiciones a la mesa de nuestros clientes.
            </p>
            <Link href="/productos" className="btn" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
              Ver productos
            </Link>
          </div>
        </div>
      </section>

      <section className="nosotros-valores">
        <h2 className="nosotros-section-title">Por qué elegirnos</h2>
        <div className="grid nosotros-cards">
          {VALUES.map((item) => (
            <div className="card nosotros-value-card" key={item.title}>
              <div className="nosotros-value-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="nosotros-proceso">
        <h2 className="nosotros-section-title">Nuestro proceso</h2>
        <p className="nosotros-section-subtitle">
          Desde la captura hasta el empaque, cada paso está supervisado por nuestro equipo.
        </p>
        <div className="proceso-grid">
          {PROCESS_PHOTOS.map((photo) => (
            <div className="proceso-item" key={photo.src}>
              <Image
                src={photo.src}
                alt={photo.caption}
                width={800}
                height={600}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <p>{photo.caption}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
