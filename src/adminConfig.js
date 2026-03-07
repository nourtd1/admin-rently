// Configuration pour les administrateurs autorisés
// Liste des emails autorisés à accéder au portail admin
export const AUTHORIZED_ADMIN_EMAILS = [
  // Ajoutez ici les emails des administrateurs autorisés
  // Exemple: 'admin@rently.com',
  // 'manager@rently.com',
];

// Fonction pour vérifier si un email est autorisé
export function isAuthorizedAdmin(email) {
  if (!email) return false;
  return AUTHORIZED_ADMIN_EMAILS.includes(email.toLowerCase());
}
