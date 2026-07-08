/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: 'admin@mariage.fr' } })
  if (!existing) {
    const hashedPassword = await bcrypt.hash('password123', 12)
    await prisma.user.create({
      data: { email: 'admin@mariage.fr', hashedPassword, name: 'Administrateur' },
    })
    console.log('Admin créé : admin@mariage.fr / password123')
  } else {
    console.log('Admin existe déjà')
  }

  const menus = [
    { name: 'Menu adulte', description: 'Entrée, plat, dessert', ceremony: 'CIVIL', order: 1 },
    { name: 'Menu enfant', description: 'Adapté pour les enfants', ceremony: 'CIVIL', order: 2 },
    { name: 'Menu végétarien', description: 'Sans viande ni poisson', ceremony: 'CIVIL', order: 3 },
    { name: 'Menu adulte', description: 'Entrée, plat, dessert', ceremony: 'RELIGIEUX', order: 1 },
    { name: 'Menu enfant', description: 'Adapté pour les enfants', ceremony: 'RELIGIEUX', order: 2 },
    { name: 'Menu végétarien', description: 'Sans viande ni poisson', ceremony: 'RELIGIEUX', order: 3 },
    { name: 'Cocktail & petits fours', description: 'Sélection de mignardises', ceremony: 'VIN_HONNEUR', order: 1 },
    { name: 'Menu adulte – Viande', description: 'Filet de bœuf, légumes de saison', ceremony: 'SOIREE', order: 1 },
    { name: 'Menu adulte – Poisson', description: 'Dos de saumon, risotto', ceremony: 'SOIREE', order: 2 },
    { name: 'Menu végétarien', description: 'Risotto aux champignons', ceremony: 'SOIREE', order: 3 },
    { name: 'Menu enfant', description: 'Adapté pour les enfants', ceremony: 'SOIREE', order: 4 },
  ]

  for (const menu of menus) {
    const exists = await prisma.menuItem.findFirst({ where: { name: menu.name, ceremony: menu.ceremony } })
    if (!exists) {
      await prisma.menuItem.create({ data: menu })
    }
  }
  console.log('Menus initialisés')
}

main().catch(console.error).finally(() => prisma.$disconnect())
