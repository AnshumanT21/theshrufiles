export const config = { runtime: 'edge' };

const encoder = new TextEncoder();

function bufToHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function signToken(secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode('authenticated'));
  return bufToHex(sig);
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const form = await request.formData();
  const entered = (form.get('password') || '').toString().trim().toLowerCase();
  const correct = (process.env.AUTH_PASSWORD || '').toString().trim().toLowerCase();
  const secret = process.env.AUTH_SECRET || '';

  if (!correct || !secret) {
    return new Response('Server not configured — set AUTH_PASSWORD and AUTH_SECRET in Vercel.', { status: 500 });
  }

  if (entered !== correct) {
    return Response.redirect(new URL('/login.html?error=1', request.url), 303);
  }

  const token = await signToken(secret);
  const headers = new Headers();
  headers.append(
    'Set-Cookie',
    `shru_auth=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`
  );
  headers.append('Location', '/');
  return new Response(null, { status: 303, headers });
}