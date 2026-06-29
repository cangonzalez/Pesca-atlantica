'use client';

import { useEffect, useState } from 'react';

const MIN_SECONDS_BEFORE_SUBMIT = 4;

function countLinks(text) {
  return (text.match(/https?:\/\/|www\./gi) || []).length;
}

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState('idle');
  const [website, setWebsite] = useState('');
  const [startedAt, setStartedAt] = useState(0);

  useEffect(() => {
    setStartedAt(Date.now());
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name] || errors.form) {
      setErrors({ ...errors, [name]: '', form: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const nombre = formData.nombre.trim();
    const email = formData.email.trim();
    const mensaje = formData.mensaje.trim();
    const secondsOnForm = startedAt ? (Date.now() - startedAt) / 1000 : 0;

    if (website.trim()) {
      newErrors.form = 'No pudimos validar el envío. Intentá nuevamente.';
    }

    if (secondsOnForm < MIN_SECONDS_BEFORE_SUBMIT) {
      newErrors.form = 'Esperá unos segundos antes de enviar la consulta.';
    }

    if (!nombre || nombre.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!mensaje || mensaje.length < 10) {
      newErrors.mensaje = 'El mensaje debe tener al menos 10 caracteres';
    }

    if (countLinks(mensaje) > 1) {
      newErrors.mensaje = 'El mensaje no puede incluir más de un enlace';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStatus('submitting');

    try {
      const response = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo enviar el mensaje.');
      }

      setSubmitted(true);
      setStatus('sent');
      setErrors({});
      setFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
      setStartedAt(Date.now());
    } catch (err) {
      setErrors({ form: err.message || 'No se pudo enviar el mensaje. Intentá de nuevo.' });
      setStatus('idle');
    }
  };

  return (
    <main>
      <section className="contacto-intro">
        <h1>Contacto</h1>
        <p>
          Consultanos por compras mayoristas, pedidos especiales
          o información sobre exportaciones.
        </p>
      </section>

      <section className="grid">
        <div className="card">
          <h3>Información de contacto</h3>

          <p className="contact-detail">
            <strong>Dirección:</strong><br />
            Mar del Plata, Buenos Aires, Argentina
          </p>
          <p className="contact-detail">
            <strong>Teléfono:</strong><br />
            <a href="tel:+541111111111">+54 11 1111-1111</a>
          </p>
          <p className="contact-detail">
            <strong>Email:</strong><br />
            <a href="mailto:contacto@pescatlantica.com">contacto@pescatlantica.com</a>
          </p>
          <p>
            <strong>Horario:</strong><br />
            Lunes a Viernes: 8:00 - 18:00hs<br />
            Sábados: 8:00 - 13:00hs
          </p>
        </div>

        <div className="card">
          <h3>Formulario de contacto</h3>

          {submitted && (
            <div className="form-message success" role="status">
              ¡Mensaje enviado! Nos ponemos en contacto a la brevedad.
            </div>
          )}

          {errors.form && (
            <div className="form-message error" role="alert">
              {errors.form}
            </div>
          )}

          {!submitted && (
            <form className="form-contacto" onSubmit={handleSubmit}>
              <div className="bot-field" aria-hidden="true">
                <label htmlFor="website">Sitio web</label>
                <input
                  id="website"
                  type="text"
                  name="website"
                  tabIndex="-1"
                  autoComplete="off"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                />
              </div>

              <div>
                <label htmlFor="nombre">Nombre completo</label>
                <input
                  id="nombre"
                  type="text"
                  name="nombre"
                  placeholder="Nombre completo"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  minLength={3}
                  autoComplete="name"
                  aria-invalid={Boolean(errors.nombre)}
                  aria-describedby={errors.nombre ? 'nombre-error' : undefined}
                />
                {errors.nombre && (
                  <p className="field-error" id="nombre-error">{errors.nombre}</p>
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
                  required
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p className="field-error" id="email-error">{errors.email}</p>
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
                  autoComplete="tel"
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
                  required
                  minLength={10}
                  aria-invalid={Boolean(errors.mensaje)}
                  aria-describedby={errors.mensaje ? 'mensaje-error' : undefined}
                />
                {errors.mensaje && (
                  <p className="field-error" id="mensaje-error">{errors.mensaje}</p>
                )}
              </div>

              <button className="btn btn-dark" type="submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Enviando...' : 'Enviar consulta'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
