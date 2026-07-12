# 🍊 Site de mariage — Adrien & Vanille

Site statique responsive (thème « été chic agrumes »), prêt à déployer sur **Vercel**,
avec formulaire RSVP et notification par e-mail. Architecture multi-pages.

## 📁 Structure
```
SITE-MARIAGE/
├── vercel.json                   ← redirections Vercel
├── api/rsvp.js                   ← fonction serverless : e-mails RSVP (Resend)
├── Backend/
│   ├── images/                   ← images de remplacement (.svg) à remplacer par vos photos
│   └── js/script.js              ← compte à rebours, galerie, FAQ, RSVP
└── Front/
    ├── CSS/style.css             ← tout le design
    └── HTML/  Index · histoire · infos · galerie · rsvp · faq
```

## 🧪 Tester en local
Ouvrez `Front/HTML/Index.html` (double-clic). Le formulaire RSVP et les e-mails
ne fonctionnent qu'une fois en ligne sur Vercel (la fonction `api/rsvp.js` a
besoin de l'environnement Vercel pour s'exécuter).

## ✏️ À personnaliser
- Date du compte à rebours + prénoms : `Backend/js/script.js` (objet `WEDDING`).
- Textes (histoire, programme, FAQ) : directement dans les pages HTML.
- Vos photos : remplacez les fichiers de `Backend/images/` (mêmes noms).
- E-mail de contact : page `rsvp.html`.

## 🚀 Déployer sur Vercel
1. Compte sur https://vercel.com
2. Importez ce dépôt GitHub (« Add New… → Project »). Aucune configuration de
   build n'est nécessaire (site statique + fonction serverless dans `api/`).
3. Avant le premier déploiement, ajoutez les variables d'environnement
   (Project Settings → Environment Variables) :
   - `RESEND_API_KEY` — clé API d'un compte gratuit sur https://resend.com
   - `COUPLE_EMAIL` — adresse qui doit recevoir chaque réponse RSVP
     (ex. `adrien.et.vanille.mariage@gmail.com`)
4. Déployez. Le `vercel.json` fait pointer discrètement `/`, `/rsvp`, `/infos`,
   `/faq` et `/histoire` vers les pages HTML correspondantes (l'URL affichée
   dans le navigateur reste propre, sans jamais montrer `/Front/HTML/...`).

## 📨 RSVP & e-mails
Chaque envoi du formulaire RSVP appelle la fonction serverless `api/rsvp.js`, qui :
- **Notifie les mariés** : un e-mail récapitulatif (nom, présence, invités,
  régime, message…) est envoyé à `COUPLE_EMAIL` à chaque réponse.
- **Confirme à l'invité** : un e-mail de confirmation lui est aussi envoyé.

Sans `RESEND_API_KEY`/`COUPLE_EMAIL` configurées sur Vercel, le formulaire
fonctionne toujours (l'invité voit bien le message de succès) mais aucun
e-mail n'est envoyé — pensez à définir ces variables avant de partager le lien.

✦
