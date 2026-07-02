import { getUserFromAccessToken } from './supabaseAdmin';

function getBearerToken(request) {
  const authorization = request.headers.get('authorization') || '';

  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return '';
  }

  return authorization.slice(7).trim();
}

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireAdmin(request) {
  const user = await getUserFromAccessToken(getBearerToken(request));

  if (!user) {
    return {
      ok: false,
      status: 401,
      error: 'Inicia sesion para entrar al panel admin.'
    };
  }

  const adminEmails = getAdminEmails();
  const email = user.email?.toLowerCase();

  if (adminEmails.length === 0) {
    return {
      ok: false,
      status: 500,
      error: 'Falta configurar ADMIN_EMAILS en Vercel.'
    };
  }

  if (!email || !adminEmails.includes(email)) {
    return {
      ok: false,
      status: 403,
      error: 'Tu usuario no tiene permisos de administrador.'
    };
  }

  return { ok: true, user };
}
