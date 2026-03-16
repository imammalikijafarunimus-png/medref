import "dotenv/config"

// Import the shared client
import { prisma } from "./client"

import { seedDrugs } from "./seed/seeds/seedDrugs"
import { seedHerbals } from "./seed/seeds/seedHerbals"
import { seedSymptoms } from "./seed/seeds/seedSymptoms"
import { seedInteractions } from "./seed/seeds/seedInteractions"
import { seedNotes } from "./seed/seeds/seedNotes"
import { seedMappings } from "./seed/seeds/seedMappings"

// REMOVE THIS LINE: const prisma = new PrismaClient()

async function main() {
  console.log("Starting MedRef database seed...")

  await seedDrugs()
  await seedHerbals()
  await seedSymptoms()
  await seedInteractions()
  await seedNotes()
  await seedMappings()

  console.log("Database seed completed")
}

main()
  .catch((e) => {
    console.error("Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })