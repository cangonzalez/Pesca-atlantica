'use client';

import { useState } from 'react';

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre || formData.nombre.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.mensaje || formData.mensaje.length < 10) {
      newErrors.mensaje = 'El mensaje debe tener al menos 10 caracteres';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Simulación de envío exitoso
    setSubmitted(true);
    
    // Limpiar formulario
    setTimeout(() => {
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        mensaje: ''
      });
      setSubmitted(false);
    }, 3000);
  };

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

          {submitted && (
            <div style={{
              padding: '12px',
              marginBottom: '20px',
              backgroundColor: '#d4edda',
              color: '#155724',
              borderRadius: '6px',
              border: '1px solid #c3e6cb'
            }}>
              ¡Mensaje enviado con éxito! Te responderemos pronto.
            </div>
          )}

          <form className="form-contacto" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="nombre">Nombre completo</label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={handleChange}
              />
              {errors.nombre && (
                <p style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '4px' }}>
                  {errors.nombre}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '4px' }}>
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="telefono">Teléfono</label>
              <input
                id="telefono"
                type="tel"
                name="telefono"
                placeholder="Teléfono (opcional)"
                value={formData.telefono}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="mensaje">Mensaje</label>
              <textarea
                id="mensaje"
                name="mensaje"
                placeholder="Escribí tu mensaje..."
                value={formData.mensaje}
                onChange={handleChange}
                rows="5"
              ></textarea>
              {errors.mensaje && (
                <p style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '4px' }}>
                  {errors.mensaje}
                </p>
              )}
            </div>

            <button className="btn" type="submit">
              Enviar consulta
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
