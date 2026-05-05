export default function ContactoPage() {
    return (
      <main>
        <section className="contacto-intro">
          <h2>Contacto</h2>
          <p>
            Consultanos por compras mayoristas, pedidos especiales
            o información sobre exportaciones.
          </p>
        </section>
  
        <section className="grid">
          <div className="card">
            <h3>Información de contacto</h3>
  
            <p style={{ marginBottom: '16px' }}>
              📍 <strong>Dirección:</strong><br />
              Mar del Plata, Buenos Aires, Argentina
            </p>
            <p style={{ marginBottom: '16px' }}>
              📞 <strong>Teléfono:</strong><br />
              +54 11 1111-1111
            </p>
            <p style={{ marginBottom: '16px' }}>
              ✉ <strong>Email:</strong><br />
              contacto@pescatlantica.com
            </p>
            <p>
              🕒 <strong>Horario:</strong><br />
              Lunes a Viernes: 8:00 - 18:00hs<br />
              Sábados: 8:00 - 13:00hs
            </p>
          </div>
  
          <div className="card">
            <h3>Formulario de contacto</h3>
  
            <form className="form-contacto">
              <input
                type="text"
                placeholder="Nombre completo"
                required
              />
  
              <input
                type="email"
                placeholder="Correo electrónico"
                required
              />
  
              <input
                type="tel"
                placeholder="Teléfono (opcional)"
              />
  
              <textarea
                placeholder="Escribí tu mensaje..."
                required
              ></textarea>
  
              <button className="btn" type="submit">
                Enviar consulta
              </button>
            </form>
          </div>
        </section>
      </main>
    );
  }