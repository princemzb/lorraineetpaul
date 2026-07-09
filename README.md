# Mariage Loraine & Paul

Site de gestion des invitations pour le mariage de Loraine et Paul : pages publiques (accueil, RSVP, invitation individuelle, thème, contact) et espace d'administration.

## Stack

- Next.js 16 (App Router) + React 19
- PostgreSQL 16 via Prisma 5
- NextAuth v5 (beta) pour l'espace admin
- Nodemailer (MailHog en dev)
- Tailwind CSS v4 + Framer Motion

## Démarrer en local

```bash
docker compose up -d db mailhog   # Postgres + MailHog
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

- App : http://localhost:3000
- Admin : http://localhost:3000/admin/login
- MailHog (emails envoyés en dev) : http://localhost:8025

Identifiants admin par défaut (dev uniquement — voir `.env.example` pour les
variables `ADMIN_EMAIL` / `ADMIN_PASSWORD` à définir en production) :
`admin@mariage.fr` / `password123`

## Déploiement

- **Docker** : `docker compose up --build` construit et lance l'app, la base et MailHog.
- **Vercel** : nécessite une base Postgres externe (Vercel Postgres, Supabase, Neon...). Les migrations et le seed ne sont pas automatiques sur Vercel — à exécuter manuellement contre la base de production (`npx prisma migrate deploy` puis `npm run db:seed`, avec `DATABASE_URL` pointant vers la prod).

Voir `STATUS.md` pour l'état d'avancement détaillé du projet.
