# 🔐 Rently Admin Portal — Le Centre de Contrôle

> **Le hub administratif moderne pour gérer l'écosystème immobilier Rently.**
> Surveillance en temps réel, modération intelligente et gestion automatisée des vérifications KYC.

<div align="center">

![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38BDF8?style=for-the-badge&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)
![Role](https://img.shields.io/badge/Access-Admin_Only-red?style=for-the-badge)

</div>

---

## 📋 Table des Matières

- [Introduction](#-introduction)
- [Fonctionnalités Clés](#-fonctionnalités-clés)
- [Tech Stack](#-tech-stack)
- [Architecture du Projet](#-architecture-du-projet)
- [Sécurité & Accès](#-sécurité--accès)
- [Installation & Setup](#-installation--setup)
- [Modules Détaillés](#-modules-détaillés)
- [Scripts Disponibles](#-scripts-disponibles)
- [Roadmap Admin](#-roadmap-admin)

---

## 🔍 Introduction

Le **Portail Admin Rently** est une application web haute performance conçue pour l'équipe opérationnelle de Rently à Kigali. Contrairement à l'application mobile (destinée aux clients), ce portail permet de superviser l'intégrité de la plateforme, de valider les annonces et de garantir la sécurité des transactions via la vérification d'identité (KYC).

---

## ✨ Fonctionnalités Clés

| Module | Description | Impact |
|------|-------------|---------------|
| 📊 **Dashboard** | Vue d'ensemble des KPIs (utilisateurs, revenus, annonces) | Prise de décision data-driven |
| 🛡️ **Modération** | Pipeline d'approbation/rejet des annonces immobilières | Qualité du catalogue garantie |
| 🆔 **KYC Center** | Revue des documents d'identité (CNI/Passeport) des propriétaires | Confiance et sécurité (Zero Scam) |
| 👥 **User Manager** | Gestion des comptes Tenants, Landlords et Admins | Contrôle total de la base utilisateur |
| 🚨 **Signalements** | Traitement des plaintes et comportements suspects | Modération communautaire |
| 💰 **Paiements** | Monitoring des revenus et sessions de paiement | Suivi de la monétisation |
| 📅 **Visites** | Suivi des demandes de visites entre locataires et propriétaires | Monitoring du taux de conversion |

---

## 🛠️ Tech Stack

| Couche | Technologie | Rôle |
|--------|-------------|------|
| **Framework** | React (Vite) | UI réactive et build ultra-rapide |
| **Styling** | Tailwind CSS | Design moderne avec design system unifié |
| **Icons** | Lucide React | Iconographie épurée et consistante |
| **Charts** | Recharts | Visualisation des données et KPIs |
| **Backend** | Supabase | Database PostgreSQL + Auth + Realtime |
| **Routing** | React Router 6 | Navigation fluide entre les modules |
| **Security** | Row Level Security | Protection des données côté serveur |

---

## 🗂️ Architecture du Projet

L'application suit une structure modulaire centralisée pour faciliter la maintenance :

```
admin-rently/
│
├── src/
│   ├── App.jsx             # Logique centrale, Router et Layout Admin
│   ├── adminConfig.js      # Configuration de la liste blanche des emails
│   ├── supabase.js         # Client Supabase configuré
│   ├── index.css           # Design system et utilitaires Tailwind
│   └── main.jsx            # Point d'entrée React
│
├── public/                 # Assets statiques (logos, images)
├── tailwind.config.js      # Configuration des thèmes et couleurs
├── vite.config.js          # Pipeline de build Vite
└── package.json            # Dépendances et scripts
```

---

## 🔐 Sécurité & Accès

L'accès au portail est strictement réservé aux administrateurs autorisés. La sécurité est gérée sur deux niveaux :

1. **Vérification Applicative** : La fonction `isAuthorizedAdmin` vérifie si l'utilisateur connecté possède le rôle `admin` dans son profil ou si son email figure dans la liste blanche (`adminConfig.js`).
2. **Protection Database** : Les **RLS (Row Level Security)** de Supabase interdisent toute lecture/écriture aux utilisateurs non-admin sur les tables sensibles (KYC, Signalements, Logs).

> [!IMPORTANT]
> Pour ajouter un administrateur, ajoutez son email dans `src/adminConfig.js` ET assurez-vous que son profil dans la table `profiles` a le rôle `admin`.

---

## 🚀 Installation & Setup

```bash
# 1. Cloner le dépôt et entrer dans le dossier
cd admin-rently

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
# Créez un fichier .env avec :
# VITE_SUPABASE_URL=votre_url
# VITE_SUPABASE_ANON_KEY=votre_clé

# 4. Lancer le serveur de développement
npm run dev
```

---

## 📦 Modules Détaillés

### 📊 Dashboard Central
Affiche les métriques critiques en temps réel.
- **Utilisateurs** : Répartition Tenants vs Landlords.
- **Revenus** : Total RWF généré via les accès quartiers.
- **Santé Plateforme** : Ratio d'annonces actives vs en attente.

### 🛡️ Pipeline de Modération
Outil d'examen des annonces soumises par les propriétaires.
- **Approuver** : Mise en ligne immédiate.
- **Révision** : Renvoi au propriétaire avec notes de correction.
- **Rejeter** : Suppression avec motif (scam, photos floues, prix erroné).

### 🆔 Centre KYC
Validation des identités pour le badge "Vérifié".
- Vue côte à côte : Photo du document vs Selfie.
- Historique des validations par administrateur.

---

## ⌨️ Scripts Disponibles

- `npm run dev` : Lance le serveur de développement (Vite).
- `npm run build` : Génère le build de production optimisé dans `/dist`.
- `npm run preview` : Prévisualise le build de production localement.

---

## 🗺️ Roadmap Admin

- [ ] Intégration de graphiques de tendance hebdomadaire (Recharts).
- [ ] Export de rapports comptables en PDF/Excel.
- [ ] Système de messagerie "Admin-to-User" pour le support direct.
- [ ] Dark Mode automatique basé sur les préférences système.

---

<div align="center">
  <p>Propulsé par l'équipe <b>Rently Engineering</b> 🇷🇼</p>
</div>
