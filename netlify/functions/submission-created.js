// =========================================================
//  netlify/functions/submission-created.js
//  Déclenchée AUTOMATIQUEMENT par Netlify à chaque envoi du
//  formulaire "rsvp". Envoie un e-mail de confirmation à
//  l'invité (et en copie aux mariés) via Resend.
//
//  ⚙️ POUR L'ACTIVER (facultatif) :
//   1. Compte gratuit sur https://resend.com → récupérez une clé API
//   2. Dans Netlify → Site settings → Environment variables, ajoutez :
//        RESEND_API_KEY = votre clé
//        COUPLE_EMAIL   = votre adresse (pour recevoir une copie)
//   3. Sans clé, la fonction ne plante pas : elle ignore l'envoi.
// =========================================================

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const data = (body.payload && body.payload.data) || {};
    const guestEmail = data.email;
    const guestName = data.prenom || "cher invité";
    const present = (data.presence || "").toLowerCase().includes("présent");

    if (!guestEmail) return { statusCode: 200, body: "Pas d'e-mail." };
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) { console.log("RESEND_API_KEY absente."); return { statusCode: 200, body: "Clé absente." }; }

    const intro = present
      ? "Quelle joie ! Votre présence est bien enregistrée. 🍊"
      : "Merci de nous avoir prévenus. Vous allez nous manquer !";

    const html = `
    <div style="margin:0;padding:0;background:#F5F0EA;font-family:Helvetica,Arial,sans-serif;color:#2C2215">
      <div style="max-width:560px;margin:0 auto;padding:32px 20px">
        <div style="background:linear-gradient(135deg,#F4C44E,#F6A04D,#E97857);border-radius:14px 14px 0 0;padding:42px 28px;text-align:center;color:#fff">
          <p style="margin:0;letter-spacing:.28em;text-transform:uppercase;font-size:12px;opacity:.95">Adrien &amp; Vanille</p>
          <h1 style="margin:8px 0 0;font-size:30px;font-weight:400;font-style:italic">Merci pour votre réponse !</h1>
        </div>
        <div style="background:#fff;border-radius:0 0 14px 14px;padding:34px 30px;box-shadow:0 16px 40px rgba(44,34,21,.15)">
          <p style="font-size:16px;margin:0 0 14px">Bonjour ${guestName},</p>
          <p style="font-size:16px;line-height:1.6;margin:0 0 18px">${intro}</p>
          <div style="background:#F5F0EA;border-radius:10px;padding:18px 20px;margin:18px 0">
            <p style="margin:0;font-size:14px;color:#5C6035">📅 <strong>Samedi 10 juillet 2027</strong> · 15h00</p>
            <p style="margin:6px 0 0;font-size:14px;color:#5C6035">📍 Bosc Grimont — Le Manège, 76990 Le Bocasse</p>
          </div>
          <p style="font-size:15px;line-height:1.6;color:#6b6058;margin:0 0 22px">Toutes les infos pratiques (accès, hébergement, programme) sont sur notre site. Une question ? Répondez simplement à cet e-mail.</p>
          <p style="font-size:16px;margin:0">Avec toute notre affection,<br><strong style="color:#E97857">Adrien &amp; Vanille</strong> ✦</p>
        </div>
      </div>
    </div>`;

    const payload = {
      from: "Adrien & Vanille <onboarding@resend.dev>",
      to: [guestEmail],
      subject: present ? "🍊 Votre présence est confirmée — Adrien & Vanille" : "Merci pour votre réponse — Adrien & Vanille",
      html,
    };
    if (process.env.COUPLE_EMAIL) payload.bcc = [process.env.COUPLE_EMAIL];

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) { console.error("Resend:", await res.text()); return { statusCode: 200, body: "Erreur d'envoi." }; }
    return { statusCode: 200, body: "Confirmation envoyée." };
  } catch (err) {
    console.error(err);
    return { statusCode: 200, body: "Erreur traitée." };
  }
};
