export const config = {
  matcher: ['/((?!api/login|login.html|assets/matchaicon.png).*)'],
};

const encoder = new TextEncoder();

function bufToHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function expectedToken(secret) {
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

export default async function middleware(request) {
  const secret = process.env.AUTH_SECRET || '';
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/shru_auth=([a-f0-9]+)/);
  const token = match ? match[1] : null;

  if (secret && token) {
    const expected = await expectedToken(secret);
    if (token === expected) {
      return; // authenticated — let the request through to the real site
    }
  }

  return Response.redirect(new URL('/login.html', request.url), 303);
}
