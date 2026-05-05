export default function ContactoPage() {
    return (
      <main>
        <section className="contacto-intro">
          <h2>Contacto</h2>
          <p>Consultanos por compras mayoristas o pedidos especiales.</p>
        </section>
  
        <section className="grid">
          <div className="card">
            <h3>Información de contacto</h3>
            <p><strong>📍 Dirección:</strong><br />Mar del Plata, Argentina</p>
            <p><strong>📞 Teléfono:</strong><br />+54 11 1111-1111</p>
            <p><strong>✉ Email:</strong><br />contacto@pescatlantica.com</p>
          </div>
  
          <div className="card">
            <h3>Formulario de contacto</h3>
            <form className="form-contacto">
              <input type="text" placeholder="Nombre completo" required />
              <input type="email" placeholder="Correo electrónico" required />
              <textarea placeholder="Escribí tu mensaje..." required></textarea>
              <button className="btn" type="submit">Enviar consulta</button>
            </form>
          </div>
        </section>
      </main>
    );
  }