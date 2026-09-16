// =========================================================
//  api/calendar.js
//  Sert le fichier .ics de l'événement en téléchargement direct.
//  Route volontairement PUBLIQUE (non protégée par le mot de passe
//  du site) pour que le bouton "Ajouter au calendrier" dans l'email
//  fonctionne même si l'invité n'est pas connecté sur le site.
// =========================================================

const ICS_BASE64 = 'QkVHSU46VkNBTEVOREFSClZFUlNJT046Mi4wClBST0RJRDotLy9BZHJpZW4gJiBWYW5pbGxlLy9NYXJpYWdlLy9GUgpDQUxTQ0FMRTpHUkVHT1JJQU4KTUVUSE9EOlBVQkxJU0gKQkVHSU46VkVWRU5UClVJRDptYXJpYWdlLWFkcmllbi12YW5pbGxlLTIwMjdAdmFuaWxsZS1hZHJpZW4uZnIKRFRTVEFNUDoyMDI2MDkxM1QwMDAwMDBaCkRUU1RBUlQ6MjAyNzA4MDdUMTQwMDAwWgpEVEVORDoyMDI3MDgwN1QyMjAwMDBaClNVTU1BUlk6TWFyaWFnZSBkJ0FkcmllbiAmIFZhbmlsbGUKREVTQ1JJUFRJT046Tm91cyBzZXJpb25zIHJhdmlzIGRlIHZvdXMgY29tcHRlciBwYXJtaSBub3VzIHBvdXIgY8OpbMOpYnJlciBub3RyZSBtYXJpYWdlICFcblxuVG91dGVzIGxlcyBpbmZvcyBwcmF0aXF1ZXMgc3VyIGh0dHBzOi8vdmFuaWxsZS1hZHJpZW4uZnIKTE9DQVRJT046Qm9zYyBHcmltb250IC0gTGUgTWFuw6hnZVwsIDc2OTkwIExlIEJvY2Fzc2VcLCBGcmFuY2UKU1RBVFVTOkNPTkZJUk1FRApFTkQ6VkVWRU5UCkVORDpWQ0FMRU5EQVIK';

module.exports = (req, res) => {
  const buffer = Buffer.from(ICS_BASE64, 'base64');
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="mariage.ics"');
  return res.status(200).send(buffer);
};
