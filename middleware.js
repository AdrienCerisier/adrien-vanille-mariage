// =========================================================
//  middleware.js — à la RACINE du projet
//
//  Protège le site avec une page de connexion personnalisée
//  demandant UNIQUEMENT un mot de passe (pas de nom d'utilisateur).
//  Une fois connecté, un cookie garde l'invité authentifié.
//
//  ⚙️ CONFIGURATION :
//   Vercel → Project Settings → Environment Variables :
//   SITE_PASSWORD = le mot de passe donné aux invités
// =========================================================

module.exports.config = {
  matcher: '/:path*',
};

const LOGIN_PATH = '/login';
const COOKIE_NAME = 'site_auth';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function loginPageHtml(showError) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Accès protégé — Adrien &amp; Vanille</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
    background:#F5F0EA; font-family:Helvetica,Arial,sans-serif; color:#2C2215; }
  .card { background:#fff; border-radius:14px; padding:40px 32px 32px; box-shadow:0 16px 40px rgba(44,34,21,.15);
    max-width:360px; width:90%; text-align:center; }
  .header { background:linear-gradient(135deg,#F4C44E,#F6A04D,#E97857); border-radius:14px; padding:28px 20px;
    color:#fff; margin:-40px -32px 24px; }
  .header p { margin:0; letter-spacing:.28em; text-transform:uppercase; font-size:11px; opacity:.95; }
  .header h1 { margin:8px 0 0; font-size:22px; font-weight:400; font-style:italic; }
  input[type=password] { width:100%; padding:12px 14px; border-radius:8px; border:1px solid #ddd;
    font-size:15px; box-sizing:border-box; margin-bottom:16px; }
  button { width:100%; padding:12px; border:none; border-radius:8px; background:#E97857; color:#fff;
    font-size:15px; cursor:pointer; }
  button:hover { background:#d96a49; }
  .error { color:#c0392b; font-size:14px; margin:-6px 0 16px; }
</style>
</head>
<body>
  <div class="card">
    <div class="header">
      <p>Adrien &amp; Vanille</p>
      <h1>Accès à l'invitation</h1>
    </div>
    <form method="POST" action="/login">
      ${showError ? '<p class="error">Mot de passe incorrect.</p>' : ''}
      <input type="password" name="password" placeholder="Mot de passe" autofocus required>
      <button type="submit">Entrer</button>
    </form>
  </div>
</body>
</html>`;
}

module.exports = async function middleware(request) {
  const expectedPassword = process.env.SITE_PASSWORD;
  if (!expectedPassword) {
    return; // pas de protection configurée
  }

  const url = new URL(request.url);
  const expectedHash = await hashPassword(expectedPassword);

  // Traitement de l'envoi du formulaire
  if (url.pathname === LOGIN_PATH && request.method === 'POST') {
    const form = await request.formData();
    const submitted = form.get('password') || '';

    if (submitted === expectedPassword) {
      const redirectTo = url.searchParams.get('from') || '/';
      return new Response(null, {
        status: 302,
        headers: {
          Location: redirectTo,
          'Set-Cookie': `${COOKIE_NAME}=${expectedHash}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`,
        },
      });
    }
    return new Response(loginPageHtml(true), {
      status: 401,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Affichage de la page de connexion
  if (url.pathname === LOGIN_PATH) {
    return new Response(loginPageHtml(false), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Toutes les autres pages : on vérifie le cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').filter(Boolean).map((c) => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );

  if (cookies[COOKIE_NAME] === expectedHash) {
    return; // déjà authentifié
  }

  const loginUrl = new URL(LOGIN_PATH, url.origin);
  loginUrl.searchParams.set('from', url.pathname + url.search);
  return Response.redirect(loginUrl, 302);
};
