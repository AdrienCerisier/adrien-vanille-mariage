// =========================================================
//  api/rsvp.js
//  Fonction serverless Vercel appelée par le formulaire RSVP
//  (Front/HTML/rsvp.html). Envoie :
//    1. Une notification aux mariés à chaque nouvelle réponse
//    2. Une confirmation à l'invité
//  via Resend.
//
//  ⚙️ POUR L'ACTIVER :
//   1. Compte gratuit sur https://resend.com → récupérez une clé API
//   2. Dans Vercel → Project Settings → Environment Variables, ajoutez :
//        RESEND_API_KEY = votre clé
//        COUPLE_EMAIL   = l'adresse qui doit recevoir chaque RSVP
//   3. Sans ces variables, la fonction répond quand même 200 à l'invité,
//      mais aucun e-mail n'est envoyé (voir les logs Vercel).
//
//  ✅ Domaine adrien-vanille.fr vérifié sur Resend (DNS via IONOS) :
//     les e-mails partent désormais depuis mariage@adrien-vanille.fr
//     au lieu du domaine sandbox onboarding@resend.dev.
// =========================================================

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LEN = 200;
const MAX_MESSAGE_LEN = 2000;
const MIN_FILL_TIME_MS = 1500;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const data = req.body || {};

  // Honeypot anti-spam (champ caché, doit rester vide)
  if (data['bot-field']) {
    return res.status(200).json({ ok: true });
  }

  // Filtre anti-bot : un humain met toujours plus de MIN_FILL_TIME_MS
  // à remplir le formulaire ; un envoi trop rapide (ou sans horodatage,
  // typique d'un appel direct à l'API) est traité comme du spam.
  const fillTime = Date.now() - Number(data.ts || 0);
  if (!Number.isFinite(fillTime) || fillTime < MIN_FILL_TIME_MS || fillTime > 24 * 60 * 60 * 1000) {
    return res.status(200).json({ ok: true });
  }

  const { prenom, nom, email, presence } = data;
  if (!prenom || !nom || !email || !presence) {
    return res.status(400).json({ error: 'Champs requis manquants.' });
  }
  if (!EMAIL_RE.test(String(email))) {
    return res.status(400).json({ error: 'Adresse e-mail invalide.' });
  }
  if (!['Présent(e)', 'Absent(e)'].includes(presence)) {
    return res.status(400).json({ error: 'Présence invalide.' });
  }
  const longFields = ['prenom', 'nom', 'email', 'regime', 'adultes', 'enfants',
    'adulte_1', 'adulte_2', 'adulte_3', 'adulte_4', 'adulte_5',
    'enfant_1', 'enfant_2', 'enfant_3', 'enfant_4'];
  if (longFields.some((k) => String(data[k] || '').length > MAX_LEN)) {
    return res.status(400).json({ error: 'Un champ dépasse la longueur autorisée.' });
  }
  if (String(data.message || '').length > MAX_MESSAGE_LEN) {
    return res.status(400).json({ error: 'Message trop long.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const coupleEmail = process.env.COUPLE_EMAIL;
  if (!apiKey || !coupleEmail) {
    console.log('RESEND_API_KEY ou COUPLE_EMAIL absente : e-mails non envoyés.');
    return res.status(200).json({ ok: true });
  }

  const present = (presence || '').toLowerCase().includes('présent');
  const esc = (v) => String(v ?? '').replace(/</g, '&lt;');

  const namesFrom = (prefix, max) => {
    const names = [];
    for (let i = 1; i <= max; i++) {
      if (data[`${prefix}_${i}`]) names.push(data[`${prefix}_${i}`]);
    }
    return names.join(', ') || '-';
  };

  const rows = [
    ['Présence', present ? 'Présent(e) 🍊' : 'Absent(e)'],
    ['Nom', `${prenom} ${nom}`],
    ['E-mail', email],
    ['Adultes', data.adultes || '-'],
    ['Enfants', data.enfants || '-'],
    ['Noms adultes', namesFrom('adulte', 5)],
    ['Noms enfants', namesFrom('enfant', 4)],
    ['Régime / allergies', data.regime || '-'],
    ['Message', data.message || '-'],
  ];

  const notifHtml = `
  <div style="font-family:Helvetica,Arial,sans-serif;color:#2C2215">
    <h2>🍊 Nouvelle réponse RSVP</h2>
    <table cellpadding="8" style="border-collapse:collapse">
      ${rows.map(([k, v]) => `<tr><td style="font-weight:bold;vertical-align:top">${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}
    </table>
  </div>`;

  const guestIntro = present
    ? 'Quelle joie ! Votre présence est bien enregistrée. 🍊'
    : 'Merci de nous avoir prévenus. Vous allez nous manquer !';

  const guestHtml = `
  <div style="margin:0;padding:0;background:#F5F0EA;font-family:Helvetica,Arial,sans-serif;color:#2C2215">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px">
      <div style="background:linear-gradient(135deg,#F4C44E,#F6A04D,#E97857);border-radius:14px 14px 0 0;padding:42px 28px;text-align:center;color:#fff">
        <p style="margin:0;letter-spacing:.28em;text-transform:uppercase;font-size:12px;opacity:.95">Adrien &amp; Vanille</p>
        <h1 style="margin:8px 0 0;font-size:30px;font-weight:400;font-style:italic">Merci pour votre réponse !</h1>
      </div>
      <div style="background:#fff;border-radius:0 0 14px 14px;padding:34px 30px;box-shadow:0 16px 40px rgba(44,34,21,.15)">
        <p style="font-size:16px;margin:0 0 14px">Bonjour ${esc(prenom)},</p>
        <p style="font-size:16px;line-height:1.6;margin:0 0 18px">${guestIntro}</p>
        <div style="background:#F5F0EA;border-radius:10px;padding:18px 20px;margin:18px 0">
          <p style="margin:0;font-size:14px;color:#5C6035">📅 <strong>Samedi 7 août 2027</strong> · 15h00</p>
          <p style="margin:6px 0 0;font-size:14px;color:#5C6035">📍 Bosc Grimont — Le Manège, 76990 Le Bocasse</p>
        </div>
        <p style="font-size:15px;line-height:1.6;color:#6b6058;margin:0 0 22px">Toutes les infos pratiques (accès, hébergement, programme) sont sur notre site. Une question ? Répondez simplement à cet e-mail.</p>
        <p style="font-size:16px;margin:0">Avec toute notre affection,<br><strong style="color:#E97857">Adrien &amp; Vanille</strong> ✦</p>
      </div>
    </div>
  </div>`;

  const send = (payload) => fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  try {
    const [notifRes, guestRes] = await Promise.all([
      send({
        from: 'Adrien & Vanille <mariage@vanille-adrien.fr>',
        to: [coupleEmail],
        reply_to: email,
        subject: `🍊 Nouvelle réponse RSVP — ${prenom} ${nom} (${present ? 'Présent' : 'Absent'})`,
        html: notifHtml,
      }),
      send({
        from: 'Adrien & Vanille <mariage@vanille-adrien.fr>',
        to: [email],
        subject: present ? '🍊 Votre présence est confirmée — Adrien & Vanille' : 'Merci pour votre réponse — Adrien & Vanille',
        html: guestHtml,
      }),
    ]);
    if (!notifRes.ok) console.error('Resend (notif):', await notifRes.text());
    if (!guestRes.ok) console.error('Resend (guest):', await guestRes.text());
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(200).json({ ok: true });
  }
};
