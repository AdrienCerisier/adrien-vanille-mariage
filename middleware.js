// =========================================================
//  middleware.js — à placer à la RACINE du projet
//  (même niveau que index.html / vercel.json, PAS dans /api)
//
//  Protège tout le site par une authentification HTTP Basic
//  avec un mot de passe unique partagé (n'importe quel nom
//  d'utilisateur est accepté, seul le mot de passe compte).
//
//  ⚙️ CONFIGURATION :
//   Dans Vercel → Project Settings → Environment Variables,
//   ajoutez : SITE_PASSWORD = le mot de passe à donner aux invités
// =========================================================

module.exports.config = {
  matcher: '/:path*',
};

module.exports = function middleware(request) {
  const expectedPassword = process.env.SITE_PASSWORD;

  // Si aucune variable n'est définie, on n'applique pas de protection
  // (évite de bloquer le site par erreur si l'env var est mal configurée).
  if (!expectedPassword) {
    return;
  }

  const authHeader = request.headers.get('authorization');

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ');
    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded);
      const separatorIndex = decoded.indexOf(':');
      const password = separatorIndex >= 0 ? decoded.slice(separatorIndex + 1) : '';

      if (password === expectedPassword) {
        return; // Mot de passe correct : on laisse passer la requête
      }
    }
  }

  return new Response('Authentification requise', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Site du mariage"',
    },
  });
};
