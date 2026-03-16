// Import from 2 levels up
import { prisma } from "../../client";

import { digestiveHerbals } from "../data/herbals/digestive";
import { immunityHerbals } from "../data/herbals/immunity";

export async function seedHerbals() {
  const herbals = [
    ...digestiveHerbals,
    ...immunityHerbals,
  ];

  console.log(`Seeding ${herbals.length} herbals...`);

  for (const herbal of herbals) {
    // Extract relation data
    const { indications, contraindications, interactions, ...herbalData } = herbal as any;

    // Create herbal
    await prisma.herbal.upsert({
      where: { id: herbalData.id },
      update: herbalData,
      create: herbalData,
    });

    // Create indications
    if (indications && indications.length > 0) {
      for (const indication of indications) {
        await prisma.herbalIndication.upsert({
          where: {
            herbalId_indication: {
              herbalId: herbalData.id,
              indication,
            },
          },
          update: {},
          create: {
            herbalId: herbalData.id,
            indication,
            evidenceLevel: "traditional",
          },
        });
      }
    }
  }

  console.log("Herbals seeded");
}