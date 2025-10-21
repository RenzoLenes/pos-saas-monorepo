#!/usr/bin/env tsx

import { seedDatabase, clearDatabase } from '../src/infrastructure/database/seed-data'

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  console.log(`
╔══════════════════════════════════════════╗
║  POS SaaS - Database Seeding Tool       ║
╚══════════════════════════════════════════╝
`)

  switch (command) {
    case 'clear':
      console.log('🗑️  Clearing database...\n')
      await clearDatabase()
      break

    case 'seed':
      console.log('🌱 Seeding database...\n')
      await seedDatabase()
      break

    case 'reset':
      console.log('🔄 Resetting database (clear + seed)...\n')
      await clearDatabase()
      console.log('')
      await seedDatabase()
      break

    default:
      console.log(`
📋 Available commands:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  npm run seed           Seed database with demo data
  npm run seed:clear     Clear all data from database
  npm run seed:reset     Clear and then seed database

Usage examples:
  npm run seed
  npm run seed:clear
  npm run seed:reset

Note: Make sure your database is running and
      DATABASE_URL is configured in .env file
`)
      process.exit(0)
  }
}

main()
  .then(() => {
    console.log('\n✨ Operation completed successfully!\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Operation failed:', error)
    process.exit(1)
  })
