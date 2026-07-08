# Statut du projet — Site de mariage Loraine & Paul

_Dernière mise à jour : 2026-07-06_

## Stack
- Next.js 16.2.10 (App Router) + React 19.2
- PostgreSQL 16 via Prisma 5.22
- NextAuth v5 (beta) pour l'espace admin
- Nodemailer + MailHog (dev) pour les emails
- Tailwind CSS v4
- Framer Motion (animations des pages publiques)

## Charte graphique "chic" (pages publiques uniquement)
Refonte visuelle du 2026-07-05 : noir absolu / vert pomme / or, polices Playfair Display (titres) + Manrope (corps), animations Framer Motion (reveal au scroll, transitions d'étapes RSVP, halos lumineux animés, titre à effet doré chatoyant).
- Nouvelles variables CSS dans `globals.css` (`--noir*`, `--or*`, `--pomme*`, `--ivoire*`) — additives, n'écrasent pas `--gold`/`--cream` utilisées par l'admin (resté sobre, non modifié)
- Composants partagés dans `src/components/public/` : `LuxeBackground`, `Reveal`, `Card`, `GoldButton`/`GoldLink`/`OutlineButton`
- Pages concernées : `src/app/page.tsx`, `src/app/rsvp/page.tsx`, `src/app/invitation/[token]/page.tsx`
- Vérifié visuellement via Playwright (screenshots) : accueil (hero + cérémonies), RSVP étape 1, invitation avec token réel — rendu conforme, pas de régression fonctionnelle (tsc clean)
- Docker Compose (db + mailhog + app)

## État général : fonctionnel en local
- `npx tsc --noEmit` : **0 erreur**
- Aucun `TODO`/`FIXME` dans le code
- Conteneurs `mariage-db-1` et `mariage-mailhog-1` up et healthy

## Fonctionnalités implémentées
- **4 cérémonies** gérées via l'enum `Ceremony` : `CIVIL`, `RELIGIEUX`, `VIN_HONNEUR`, `SOIREE` (la mémoire précédente n'en mentionnait que 2, à jour maintenant)
- Modèles Prisma : `User`, `Guest`, `MenuItem`, `Invitation` (token unique, statut RSVP, accompagnants, notes, menu choisi, `emailSent`)
- Pages publiques :
  - `/` — page d'accueil avec compte à rebours
  - `/invitation/[token]` — page RSVP par invité (290 lignes)
  - `/rsvp` — formulaire RSVP (696 lignes, la plus grosse page du projet)
- Espace admin (`/admin`, protégé par middleware `src/proxy.ts` + NextAuth) :
  - Dashboard avec stats par cérémonie (`page.tsx`)
  - Gestion des invités (`guests/page.tsx`)
  - Gestion des invitations par cérémonie (`invitations/{civil,religieux,soiree,vin-honneur}/page.tsx` + composant partagé `InvitationsPage.tsx`)
  - Gestion des menus (`menus/page.tsx`)
  - Login (`admin/login/page.tsx`)
- API routes : CRUD invités/invitations/menus, envoi d'email par invitation, export CSV par cérémonie, stats, RSVP public
- Compte admin par défaut (seed) : `admin@mariage.fr` / `password123`

## Menu composable — Soirée de Mariage (2026-07-06)
La Soirée utilise désormais un système de menu composable au lieu d'une liste plate :
- 2 menus nommés **Menu Paul** et **Menu Lorraine** (modèle `Menu`, `ceremony: SOIREE`)
- Chaque menu a 3 entrées / 3 plats / 3 desserts au choix (modèle `MenuOption`, enum `CourseType`)
- L'invité choisit d'abord un menu entier (Paul OU Lorraine), puis compose 1 entrée + 1 plat + 1 dessert au sein de ce menu — pas de mélange entre les deux menus
- Les autres cérémonies (Civil, Religieux, Vin d'honneur) gardent l'ancien système `MenuItem` (liste plate), inchangé
- `Invitation` a de nouveaux champs `menuId`/`entreeOptionId`/`platOptionId`/`dessertOptionId` (utilisés uniquement pour Soirée), en plus de `menuItemId` (utilisé pour les autres cérémonies)
- Admin : `/admin/menus` a une section dédiée avec CRUD complet par service (entrée/plat/dessert) pour chaque menu ; `InvitationsPage.tsx` et l'export CSV affichent le menu composé ("Menu Paul — Entrée : X / Plat : Y / Dessert : Z")
- Testé de bout en bout via Playwright : soumission RSVP composable → persistance BDD → email de confirmation → affichage admin → CRUD des options

## Migrations Prisma
La désynchronisation précédemment notée (`add_religieux_ceremony` non enregistrée dans `_prisma_migrations`) a été résolue le 2026-07-06 via `prisma migrate resolve --applied`. L'historique des migrations est maintenant propre (5 migrations, toutes appliquées).

## Non commité
Beaucoup de travail n'est pas encore versionné (dernier commit = `17cb348 Initial commit from Create Next App`) :
- Modifiés : `next.config.ts`, `package.json`/`package-lock.json`, `globals.css`, `layout.tsx`, `page.tsx`
- Nouveaux : `Dockerfile`, `docker-compose.yml`, `docker-entrypoint.sh`, `prisma/`, `src/app/admin/`, `src/app/api/`, `src/app/invitation/`, `src/app/rsvp/`, `src/auth.ts`, `src/components/`, `src/lib/`, `src/proxy.ts`

→ Tout l'admin, les API, l'auth et Docker sont à committer dès que souhaité.

## README.md
Toujours le boilerplate par défaut de `create-next-app`, jamais personnalisé.

## Pistes pour la suite
- Committer l'état actuel (rien n'est versionné à part le squelette initial)
- Résoudre la désynchronisation de migration ci-dessus
- Personnaliser le `README.md`
- Tester le build de prod (`next build`) et le flow Docker complet (`docker compose up --build`) — non vérifié dans cette session
