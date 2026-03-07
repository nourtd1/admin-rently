# 🔐 Rently Admin Portal — Kigali Site Hub

Bienvenue dans le centre de contrôle de Rently. Ce dossier contient le **Site Web Admin** (Web Dashboard) permettant de gérer l'ensemble de la plateforme, les utilisateurs, les listings et les vérifications KYC.

## 🚀 Fonctionnalités
- **Tableau de Bord centralisé** : Vue d'ensemble des métriques de la plateforme à Kigali.
- **Gestion des Listings** : Approuvez ou rejetez les nouvelles soumissions en temps réel.
- **Identité (KYC)** : Vérifiez les documents officiels des Landlords pour maintenir la sécurité.
- **Accès Utilisateurs** : Listez et gérez tous les comptes (Tenant, Landlord).
- **Signalements** : Traitez les plaintes et comportements suspects.

## 🛠️ Installation & Lancement

```bash
# 1. Allez dans le dossier
cd admin-rently

# 2. Installez les dépendances
npm install

# 3. Lancez le site en mode développement
npm run dev

# 4. Ouvrez l'URL affichée (généralement http://localhost:5173) dans votre navigateur
```

## 🏗️ Structure du Projet
- `src/App.jsx` : Le composant principal gérant les onglets et le dashboard.
- `src/supabase.js` : Configuration de la connexion à la base de données.
- `src/index.css` : Design system basé sur Tailwind CSS.
- `public/` : Assets statiques.

## 🔒 Sécurité
Ce site utilise les **Row Level Security (RLS)** de Supabase. L'accès est contrôlé par une liste d'emails autorisés définie dans `src/adminConfig.js`. Seuls les emails ajoutés à cette liste peuvent accéder au portail admin.

**Important**: Après avoir ajouté des emails dans `adminConfig.js`, vous devez également les ajouter dans la table `admin_authorized_emails` de votre base de données Supabase en exécutant le script SQL `supabase_remove_admin_role.sql`.
