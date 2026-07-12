# 🍊 Site de mariage — Adrien & Vanille

Site statique responsive (thème « été chic agrumes »), prêt à déployer sur **Netlify**,
avec formulaire RSVP et e-mails de confirmation. Architecture multi-pages.

## 📁 Structure
```
SITE-MARIAGE/
├── netlify.toml                  ← redirections Netlify
├── Backend/
│   ├── images/                   ← images de remplacement (.svg) à remplacer par vos photos
│   └── js/script.js              ← compte à rebours, galerie, FAQ, RSVP
├── Front/
│   ├── CSS/style.css             ← tout le design
│   └── HTML/  Index · histoire · infos · galerie · rsvp · faq
└── netlify/functions/submission-created.js   ← e-mail de confirmation (optionnel)
```

## 🧪 Tester en local
Ouvrez `Front/HTML/Index.html` (double-clic). Le formulaire RSVP et les e-mails
ne fonctionnent qu'une fois en ligne sur Netlify.

## ✏️ À personnaliser
- Date du compte à rebours + prénoms : `Backend/js/script.js` (objet `WEDDING`).
- Textes (histoire, programme, FAQ) : directement dans les pages HTML.
- Vos photos : remplacez les fichiers de `Backend/images/` (mêmes noms).
- E-mail de contact : page `rsvp.html`.

## 🚀 Déployer sur Netlify
1. Compte sur https://netlify.com
2. Glissez-déposez le dossier `SITE-MARIAGE` (ou connectez un dépôt GitHub).
3. En ligne ! Le `netlify.toml` redirige la racine vers l'accueil.

## 📨 RSVP & e-mails
- **Vous recevez chaque réponse** : Netlify Forms est déjà activé. Réponses dans
  l'onglet **Forms** ; alerte e-mail via *Forms → Settings → Form notifications*.
- **L'invité reçoit une confirmation** (optionnel) : fonction `submission-created.js`
  via Resend — voir les instructions en haut du fichier.

✦
