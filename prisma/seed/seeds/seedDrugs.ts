import { prisma } from "../../client";

import { analgesics } from "../data/drugs/analgesics";
import { antibiotics } from "../data/drugs/antibiotics";
import { cardiovascular } from "../data/drugs/cardiovascular";
import { respiratory } from "../data/drugs/respiratory"; 

type DrugSeedData = {
  id: string;
  name: string;
  genericName: string;
  drugClass: string;
  category: string;
  description: string;
  indications: string[];
  dosage: string;
  contraindications: string[];
};

export async function seedDrugs() {
  const drugs: DrugSeedData[] = [
    ...analgesics,
    ...antibiotics,
    ...cardiovascular,
    ...respiratory,
  ];

  console.log(`Seeding ${drugs.length} drugs...`);

  for (const drug of drugs) {
    // Use upsert to avoid errors if running multiple times
    await prisma.drug.upsert({
      where: { id: drug.id },
      update: {
        name: drug.name,
        genericName: drug.genericName,
        drugClass: drug.drugClass,
        category: drug.category,
        description: drug.description,
        dosage: drug.dosage,
        // Update relations by deleting old and creating new
        indications: {
          deleteMany: {},
          create: drug.indications.map((ind) => ({ indication: ind })),
        },
        contraindications: {
          deleteMany: {},
          create: drug.contraindications.map((con) => ({ contraindication: con })),
        },
      },
      create: {
        id: drug.id,
        name: drug.name,
        genericName: drug.genericName,
        drugClass: drug.drugClass,
        category: drug.category,
        description: drug.description,
        dosage: drug.dosage,
        // Create relations nested
        indications: {
          create: drug.indications.map((ind) => ({ indication: ind })),
        },
        contraindications: {
          create: drug.contraindications.map((con) => ({ contraindication: con })),
        },
      },
    });
  }

  console.log("Drugs seeded");
}