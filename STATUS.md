# Statut du projet — Site de mariage Loraine & Paul

_Dernière mise à jour : 2026-07-09_

## Stack
- Next.js 16.2.10 (App Router) + React 19.2
- PostgreSQL 16 via Prisma 5.22
- NextAuth v5 (beta) pour l'espace admin
- Nodemailer + MailHog (dev) pour les emails
- Tailwind CSS v4 + Framer Motion

## État général
- `npx tsc --noEmit` et `npm run build` : propres, 0 erreur
- Tout le code est commité en git (commit `665ff76` du 2026-07-09, après un premier commit `create-next-app` resté seul pendant tout le développement)
- Repo local Docker (`db` + `mailhog`) up et healthy pour le dev

## Fonctionnalités
- **4 cérémonies** configurables depuis l'admin (`/admin/ceremonies`) : nom, emoji, texte, adresse, date/heure — nombre fixe (pas d'ajout/suppression), modèle `CeremonyConfig`
- **Menu composable Soirée** : 2 menus (Paul/Lorraine), 3 entrées/plats/desserts chacun, l'invité compose son repas dans un seul des deux menus (modèles `Menu`/`MenuOption`). Les autres cérémonies gardent le système `MenuItem` simple
- **Carrousel photo d'accueil** (jusqu'à 7 photos, `/admin/hero-photos`) et **page Thème/dress code** (`/theme`, photos + texte, navigation manuelle, `/admin/theme-photos`) — photos stockées en base (`Bytes`), pas sur disque, limite 4 Mo/photo (contrainte Vercel)
- **Page `/contact`** : vitrine "Prémices et Associés Services" (PAC) avec formulaire de prospection + lien WhatsApp ; remplace le lien "Administration" du footer public. Messages stockés (`ContactMessage`) + email de notification
- Charte graphique "chic" (noir/vert pomme/or, Playfair Display + Manrope, Framer Motion) sur les pages publiques ; espace admin resté sur le thème or/crème d'origine
- Badge "P" flottant (bas gauche, toutes pages, y compris en prod) renvoyant vers `/contact`
- RSVP public + invitations individuelles par token, export CSV, envoi d'emails par invitation

## Sécurité avant mise en ligne
- `AUTH_SECRET` par défaut remplacé par un secret généré (`docker-compose.yml`) ; `.env.example` documente `openssl rand -base64 32` pour en générer un nouveau par déploiement
- Identifiants admin configurables via `ADMIN_EMAIL`/`ADMIN_PASSWORD` au seed (sinon retombe sur `admin@mariage.fr` / `password123`, dev uniquement) — **à définir avant mise en ligne réelle**

## Déploiement

### Docker (self-hosted)
`docker compose up --build` construit l'image et lance `db` + `mailhog` + `app`. `docker-entrypoint.sh` exécute automatiquement `prisma migrate deploy` puis `prisma/seed.ts` (via `tsx`, embarqué dans l'image) au démarrage.

⚠️ Le 2026-07-09, un test réel du build/run Docker a révélé deux bugs (corrigés) :
1. Le CLI `prisma` n'était jamais copié dans l'image finale → `npx prisma` allait chercher la dernière version sur le registre npm à chaque démarrage (cassé avec la sortie de Prisma 7)
2. Les fichiers copiés dans l'image finale appartenaient à `root` alors que le conteneur tourne en utilisateur non-root (`nextjs`) → erreurs de permission au démarrage

Correctifs appliqués dans `Dockerfile` (copie du CLI `prisma`, `--chown=nextjs:nodejs` sur toutes les couches copiées, exécution directe des binaires Node plutôt que via `npx`). **Non re-testé de bout en bout** : Docker Desktop s'est bloqué juste après (VM backend ne répondait plus, probablement suite à un disque plein pendant les tests répétés) — à revalider dès que Docker est de nouveau opérationnel : `docker compose up --build` puis vérifier que l'admin, les cérémonies et les photos par défaut sont bien présents sur une base vierge.

### Vercel
Pas de base de données incluse — il faut une Postgres externe (Vercel Postgres, Supabase, Neon...). Contrairement au chemin Docker, **rien n'exécute automatiquement les migrations ni le seed** sur Vercel. Avant/après chaque déploiement impliquant un changement de schéma :

```bash
DATABASE_URL="<url de la base de prod>" npx prisma migrate deploy
DATABASE_URL="<url de la base de prod>" npm run db:seed
```

Variables d'environnement à définir dans le dashboard Vercel : `DATABASE_URL`, `AUTH_SECRET` (généré, unique), `NEXTAUTH_URL` (URL réelle du site), `SMTP_*`, `MAIL_FROM`, `APP_URL`, `CONTACT_EMAIL`, `ADMIN_EMAIL`/`ADMIN_PASSWORD` (avant le premier seed).

Upload de photos (hero/thème) déjà compatibles Vercel par design (stockage en base, 4 Mo/photo max — sous la limite de 4.5 Mo par requête des Serverless Functions).

### Email — SMTP réel requis
En dev, tout part vers MailHog (`localhost:1025`, aucun email réel envoyé). Avant mise en ligne, configurer un vrai fournisseur SMTP (ex: Resend, SendGrid, ou un compte Gmail avec mot de passe d'application) via `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`SMTP_SECURE`, sans quoi les invités ne recevront jamais leurs emails de confirmation.

## Pistes pour la suite
- Revalider le flow Docker complet une fois Docker Desktop rétabli
- Choisir et configurer un fournisseur SMTP réel
- Définir `ADMIN_EMAIL`/`ADMIN_PASSWORD` avant la mise en ligne
- Provisionner une base Postgres externe si déploiement Vercel
