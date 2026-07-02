# Pescatlantica

Aplicacion web full-stack para una pescaderia: landing institucional, catalogo navegable, carrito, checkout de prueba con Mercado Pago, persistencia de pedidos en Supabase y panel admin.

## Funcionalidades

- Landing y vistas institucionales responsive.
- Catalogo consumido desde `/api/productos`.
- Carrito con seleccion de cantidad por gramos.
- Login y registro con Supabase Auth.
- Checkout sandbox con Mercado Pago.
- Webhook para actualizar pedidos en Supabase.
- Panel `/admin` para gestionar pedidos, productos y mensajes de contacto.

## Variables de entorno

Usar `.env.example` como referencia.

- `MERCADOPAGO_TEST_ACCESS_TOKEN`: access token de credenciales de prueba de Mercado Pago.
- `MERCADOPAGO_WEBHOOK_URL`: URL publica del endpoint `/api/mercadopago/webhook`.
- `NEXT_PUBLIC_SITE_URL`: URL publica del deploy.
- `SUPABASE_URL`: project URL de Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: service role key para APIs del servidor.
- `NEXT_PUBLIC_SUPABASE_URL`: project URL para el cliente.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: publishable key de Supabase para login.
- `ADMIN_EMAILS`: emails autorizados para entrar a `/admin`, separados por coma.

## Base de datos

Ejecutar `supabase/schema.sql` en Supabase SQL Editor. El script crea:

- `orders`: pedidos y estado de pago.
- `products`: catalogo editable desde `/admin`.
- `contact_messages`: mensajes enviados desde el formulario de contacto.

## Desarrollo local

```bash
npm install
npm run dev
```

## Demo

1. Abrir el deploy publico.
2. Agregar productos al carrito.
3. Completar datos de entrega.
4. Pagar con Mercado Pago sandbox.
5. Verificar que Supabase actualice `orders`.
6. Entrar a `/admin` con un email incluido en `ADMIN_EMAILS`.
