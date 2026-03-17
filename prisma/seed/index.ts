/**
 * MedRef Database Seed Script
 * Enterprise-Grade Medical Database
 * 
 * This script seeds the database with:
 * - Drugs (75+ drugs across 6 categories)
 * - Herbals (30+ herbals across 7 categories)
 * - Drug Interactions (100+ interactions)
 * - Symptoms
 * - Notes
 */

import { prisma } from "../client";
import { seedDrugs } from "./seeds/seedDrugs";
import { seedHerbals } from "./seeds/seedHerbals";
import { seedInteractions } from "./seeds/seedInteractions";
import { seedSymptoms } from "./seeds/seedSymptoms";
import { seedNotes } from "./seeds/seedNotes";

async function main() {
  console.log("=".repeat(60));
  console.log("  MedRef Database Seed - Enterprise Edition");
  console.log("=".repeat(60));
  console.log("");

  const startTime = Date.now();

  try {
    // Seed in order of dependencies
    console.log("Step 1: Seeding Drugs...");
    console.log("-".repeat(40));
    await seedDrugs();
    console.log("");

    console.log("Step 2: Seeding Herbals...");
    console.log("-".repeat(40));
    await seedHerbals();
    console.log("");

    console.log("Step 3: Seeding Drug Interactions...");
    console.log("-".repeat(40));
    await seedInteractions();
    console.log("");

    console.log("Step 4: Seeding Symptoms...");
    console.log("-".repeat(40));
    await seedSymptoms();
    console.log("");

    console.log("Step 5: Seeding Clinical Notes...");
    console.log("-".repeat(40));
    await seedNotes();
    console.log("");

    // Print summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("=".repeat(60));
    console.log("  Seed Complete!");
    console.log("=".repeat(60));
    console.log(`  Duration: ${duration} seconds`);
    console.log("");

    // Print database statistics
    const stats = await getDatabaseStats();
    console.log("  Database Statistics:");
    console.log(`    - Drugs: ${stats.drugs}`);
    console.log(`    - Herbals: ${stats.herbals}`);
    console.log(`    - Drug Interactions: ${stats.drugInteractions}`);
    console.log(`    - Herbal Compounds: ${stats.herbalCompounds}`);
    console.log(`    - Herbal Indications: ${stats.herbalIndications}`);
    console.log(`    - Herbal Interactions: ${stats.herbalInteractions}`);
    console.log("=".repeat(60));

  } catch (error) {
    console.error("Seed failed:", error);
    throw error;
  }
}

async function getDatabaseStats() {
  const [
    drugs,
    herbals,
    drugInteractions,
    herbalCompounds,
    herbalIndications,
    herbalInteractions,
  ] = await Promise.all([
    prisma.drug.count(),
    prisma.herbal.count(),
    prisma.drugInteraction.count(),
    prisma.herbalCompound.count(),
    prisma.herbalIndication.count(),
    prisma.herbalInteraction.count(),
  ]);

  return {
    drugs,
    herbals,
    drugInteractions,
    herbalCompounds,
    herbalIndications,
    herbalInteractions,
  };
}

// Run seed
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });