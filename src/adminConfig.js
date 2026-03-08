// Configuration pour les administrateurs autorisés
// Option 1 : Liste des emails autorisés (à remplir si besoin)
export const AUTHORIZED_ADMIN_EMAILS = [
  'sidickabdoulayesino1@gmail.com'
  // Exemple: 'admin@rently.com',
];

// Fonction pour vérifier si un utilisateur est admin
// Accepte soit un email dans la liste, soit un profil avec role = 'admin'
export function isAuthorizedAdmin(emailOrProfile) {
  if (!emailOrProfile) return false;

  // Si on passe un objet profil (avec role)
  if (typeof emailOrProfile === 'object') {
    if (emailOrProfile.role === 'admin') return true;
    return AUTHORIZED_ADMIN_EMAILS.includes((emailOrProfile.email || '').toLowerCase());
  }

  // Si on passe juste un email (string)
  return AUTHORIZED_ADMIN_EMAILS.includes(emailOrProfile.toLowerCase());
}
