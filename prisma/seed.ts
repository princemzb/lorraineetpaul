import { PrismaClient, Ceremony } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { readFile } from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const existing = await prisma.user.findUnique({ where: { email: 'admin@mariage.fr' } })
  if (!existing) {
    const hashedPassword = await bcrypt.hash('password123', 12)
    await prisma.user.create({
      data: {
        email: 'admin@mariage.fr',
        hashedPassword,
        name: 'Administrateur',
      },
    })
    console.log('Admin user created: admin@mariage.fr / password123')
  }

  // Create menu items for civil
  const civilMenus = [
    { name: 'Menu adulte', description: 'Entrée, plat, dessert', ceremony: Ceremony.CIVIL, order: 1 },
    { name: 'Menu enfant', description: 'Adapté pour les enfants', ceremony: Ceremony.CIVIL, order: 2 },
    { name: 'Menu végétarien', description: 'Sans viande ni poisson', ceremony: Ceremony.CIVIL, order: 3 },
  ]

  // Create menu items for religieux
  const religieuxMenus = [
    { name: 'Menu adulte', description: 'Entrée, plat, dessert', ceremony: Ceremony.RELIGIEUX, order: 1 },
    { name: 'Menu enfant', description: 'Adapté pour les enfants', ceremony: Ceremony.RELIGIEUX, order: 2 },
    { name: 'Menu végétarien', description: 'Sans viande ni poisson', ceremony: Ceremony.RELIGIEUX, order: 3 },
  ]

  for (const menu of [...civilMenus, ...religieuxMenus]) {
    const exists = await prisma.menuItem.findFirst({
      where: { name: menu.name, ceremony: menu.ceremony },
    })
    if (!exists) {
      await prisma.menuItem.create({ data: menu })
    }
  }
  console.log('Menu items seeded')

  // Soirée : menus composables (Menu Paul / Menu Lorraine), un choix
  // d'entrée + plat + dessert au sein du menu sélectionné.
  await prisma.invitation.updateMany({
    where: { ceremony: Ceremony.SOIREE },
    data: { menuItemId: null },
  })
  await prisma.menuItem.deleteMany({ where: { ceremony: Ceremony.SOIREE } })

  const composableMenus = [
    {
      name: 'Menu Paul',
      order: 1,
      options: [
        { course: 'ENTREE' as const, order: 1, name: 'Foie gras poêlé', description: 'Chutney de figues, brioche toastée' },
        { course: 'ENTREE' as const, order: 2, name: 'Velouté de potimarron', description: 'Éclats de châtaignes, huile de noisette' },
        { course: 'ENTREE' as const, order: 3, name: 'Tartare de saumon', description: 'Avocat, agrumes' },
        { course: 'PLAT' as const, order: 1, name: 'Filet de bœuf, sauce au poivre', description: 'Gratin dauphinois, légumes de saison' },
        { course: 'PLAT' as const, order: 2, name: 'Suprême de volaille aux morilles', description: 'Purée maison, girolles' },
        { course: 'PLAT' as const, order: 3, name: 'Risotto aux champignons', description: 'Parmesan, huile de truffe' },
        { course: 'DESSERT' as const, order: 1, name: 'Fondant au chocolat', description: 'Cœur coulant, glace vanille' },
        { course: 'DESSERT' as const, order: 2, name: 'Tarte au citron meringuée', description: '' },
        { course: 'DESSERT' as const, order: 3, name: 'Assiette de fromages affinés', description: '' },
      ],
    },
    {
      name: 'Menu Lorraine',
      order: 2,
      options: [
        { course: 'ENTREE' as const, order: 1, name: 'Carpaccio de Saint-Jacques', description: 'Huile d\'olive citronnée' },
        { course: 'ENTREE' as const, order: 2, name: 'Salade de chèvre chaud', description: 'Miel et noix' },
        { course: 'ENTREE' as const, order: 3, name: 'Terrine de campagne', description: 'Pickles maison' },
        { course: 'PLAT' as const, order: 1, name: 'Dos de cabillaud, beurre blanc', description: 'Légumes de saison' },
        { course: 'PLAT' as const, order: 2, name: 'Magret de canard, sauce miel', description: 'Pommes grenailles' },
        { course: 'PLAT' as const, order: 3, name: 'Ravioles de légumes', description: 'Bouillon parfumé' },
        { course: 'DESSERT' as const, order: 1, name: 'Paris-brest', description: '' },
        { course: 'DESSERT' as const, order: 2, name: 'Panna cotta aux fruits rouges', description: '' },
        { course: 'DESSERT' as const, order: 3, name: 'Café gourmand', description: '' },
      ],
    },
  ]

  for (const m of composableMenus) {
    let menu = await prisma.menu.findFirst({ where: { name: m.name, ceremony: Ceremony.SOIREE } })
    if (!menu) {
      menu = await prisma.menu.create({ data: { name: m.name, ceremony: Ceremony.SOIREE, order: m.order } })
    }
    for (const opt of m.options) {
      const exists = await prisma.menuOption.findFirst({ where: { menuId: menu.id, course: opt.course, name: opt.name } })
      if (!exists) {
        await prisma.menuOption.create({
          data: { menuId: menu.id, course: opt.course, name: opt.name, description: opt.description || null, order: opt.order },
        })
      }
    }
  }
  console.log('Menus composables Soirée seedés')

  // Configuration éditable des 4 cérémonies (valeurs par défaut reprises
  // de ce qui était codé en dur dans les pages publiques jusqu'ici).
  const ceremonyConfigs = [
    {
      ceremony: Ceremony.CIVIL,
      name: 'Mariage Civil',
      emoji: '⚖️',
      address: 'Mairie',
      date: new Date('2026-08-14T11:00:00'),
      order: 1,
    },
    {
      ceremony: Ceremony.RELIGIEUX,
      name: 'Mariage Religieux',
      emoji: '🕊️',
      address: 'Église',
      date: new Date('2026-08-15T11:00:00'),
      order: 2,
    },
    {
      ceremony: Ceremony.VIN_HONNEUR,
      name: "Vin d'honneur",
      emoji: '🍾',
      address: 'Salle de réception',
      date: new Date('2026-08-15T17:00:00'),
      order: 3,
    },
    {
      ceremony: Ceremony.SOIREE,
      name: 'Soirée de Mariage',
      emoji: '🥂',
      address: 'Salle de réception',
      date: new Date('2026-08-15T19:00:00'),
      order: 4,
    },
  ]

  for (const c of ceremonyConfigs) {
    const exists = await prisma.ceremonyConfig.findUnique({ where: { ceremony: c.ceremony } })
    if (!exists) {
      await prisma.ceremonyConfig.create({ data: c })
    }
  }
  console.log('Configuration des cérémonies seedée')

  // Photo de démarrage du carrousel d'accueil (l'admin pourra en ajouter/retirer)
  const heroPhotoCount = await prisma.heroPhoto.count()
  if (heroPhotoCount === 0) {
    try {
      const defaultPhotoPath = path.join(process.cwd(), 'public', 'images', 'hero-couple.png')
      const data = await readFile(defaultPhotoPath)
      await prisma.heroPhoto.create({ data: { data, mimeType: 'image/png', order: 1 } })
      console.log('Photo d\'accueil par défaut seedée')
    } catch {
      console.log('Pas de photo par défaut trouvée, carrousel vide au démarrage')
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
