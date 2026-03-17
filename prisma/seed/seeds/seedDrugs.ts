import { prisma } from "../../client";
import { DrugSeedData } from "../types";

// Import all drug categories
import { analgesics } from "../data/drugs/analgesics";
import { antibiotics } from "../data/drugs/antibiotics";
import { cardiovascular, otherDrugs } from "../data/drugs/cardiovascular";
import { psychiatry } from "../data/drugs/psychiatry";
import { endocrinology } from "../data/drugs/endocrinology";

export async function seedDrugs() {
  const drugs: DrugSeedData[] = [
    ...analgesics,
    ...antibiotics,
    ...cardiovascular,
    ...(otherDrugs || []),
    ...psychiatry,
    ...endocrinology,
  ];

  console.log(`Seeding ${drugs.length} drugs...`);

  let processed = 0;
  for (const drug of drugs) {
    try {
      // Handle regulatoryStatus - convert object to string if needed
      const regulatoryStatusStr = typeof drug.regulatoryStatus === 'object' 
        ? JSON.stringify(drug.regulatoryStatus) 
        : drug.regulatoryStatus;

      // Upsert main drug record - only use fields that exist in Prisma schema
      await prisma.drug.upsert({
        where: { id: drug.id },
        update: {
          name: drug.name,
          genericName: drug.genericName,
          brandNames: drug.brandNames,
          drugClass: drug.drugClass,
          category: drug.category,
          description: drug.description,
          mechanism: drug.mechanism,
          route: drug.route,
          halfLife: drug.halfLife,
          excretion: drug.excretion,
          pregnancyCat: drug.pregnancyCat,
          lactation: drug.lactation,
          storage: drug.storage,
          notes: drug.notes,
          blackBoxWarning: drug.blackBoxWarning,
          regulatoryStatus: regulatoryStatusStr,
          monitoringParameters: drug.monitoringParameters,
          counselingPoints: drug.counselingPoints,
        },
        create: {
          id: drug.id,
          name: drug.name,
          genericName: drug.genericName,
          brandNames: drug.brandNames,
          drugClass: drug.drugClass,
          category: drug.category,
          description: drug.description,
          mechanism: drug.mechanism,
          route: drug.route,
          halfLife: drug.halfLife,
          excretion: drug.excretion,
          pregnancyCat: drug.pregnancyCat,
          lactation: drug.lactation,
          storage: drug.storage,
          notes: drug.notes,
          blackBoxWarning: drug.blackBoxWarning,
          regulatoryStatus: regulatoryStatusStr,
          monitoringParameters: drug.monitoringParameters,
          counselingPoints: drug.counselingPoints,
        },
      });

      // Handle doses
      if (drug.doses && drug.doses.length > 0) {
        await prisma.drugDose.deleteMany({
          where: { drugId: drug.id },
        });

        for (const dose of drug.doses) {
          await prisma.drugDose.create({
            data: {
              drugId: drug.id,
              indication: dose.indication,
              adultDose: dose.adultDose,
              pediatricDose: dose.pediatricDose,
              pediatricMinAge: dose.pediatricMinAge,
              pediatricMaxAge: dose.pediatricMaxAge,
              maxDose: dose.maxDose,
              maxDoseUnit: dose.maxDoseUnit,
              frequency: dose.frequency,
              duration: dose.duration,
              renalAdjust: dose.renalAdjust,
              hepaticAdjust: dose.hepaticAdjust,
              notes: dose.notes,
            },
          });
        }
      }

      // Handle indications
      if (drug.indications && drug.indications.length > 0) {
        await prisma.drugIndication.deleteMany({
          where: { drugId: drug.id },
        });

        for (const indication of drug.indications) {
          await prisma.drugIndication.create({
            data: {
              drugId: drug.id,
              indication: indication.indication,
              icdCode: indication.icdCode,
              priority: indication.priority || 0,
              notes: indication.notes,
            },
          });
        }
      }

      // Handle contraindications
      if (drug.contraindications && drug.contraindications.length > 0) {
        await prisma.drugContraindication.deleteMany({
          where: { drugId: drug.id },
        });

        for (const contra of drug.contraindications) {
          await prisma.drugContraindication.create({
            data: {
              drugId: drug.id,
              contraindication: typeof contra === 'string' ? contra : contra.contraindication,
              severity: typeof contra === 'object' ? contra.severity : null,
              notes: typeof contra === 'object' ? contra.notes : null,
            },
          });
        }
      }

      processed++;
      if (processed % 10 === 0) {
        console.log(`  Processed ${processed}/${drugs.length} drugs...`);
      }
    } catch (error) {
      console.error(`Error seeding drug ${drug.id}:`, error);
    }
  }

  // Now handle interactions from drug data
  console.log("Seeding drug interactions from drug data...");
  let interactionCount = 0;

  for (const drug of drugs) {
    if (drug.interactions && drug.interactions.length > 0) {
      for (const interaction of drug.interactions) {
        try {
          // Check if the interacting drug exists
          const interactingDrug = await prisma.drug.findUnique({
            where: { id: interaction.interactingDrugId },
          });

          if (!interactingDrug) {
            continue;
          }

          // Check if interaction already exists
          const existingInteraction = await prisma.drugInteraction.findFirst({
            where: {
              drugId: drug.id,
              interactingDrugId: interaction.interactingDrugId,
            },
          });

          if (existingInteraction) {
            // Update existing
            await prisma.drugInteraction.update({
              where: { id: existingInteraction.id },
              data: {
                interactionType: interaction.interactionType,
                effect: interaction.effect,
                mechanism: interaction.mechanism,
                management: interaction.management,
              },
            });
          } else {
            // Create new
            await prisma.drugInteraction.create({
              data: {
                drugId: drug.id,
                interactingDrugId: interaction.interactingDrugId,
                interactionType: interaction.interactionType,
                effect: interaction.effect,
                mechanism: interaction.mechanism,
                management: interaction.management,
              },
            });
          }

          interactionCount++;
        } catch (error) {
          // Silently skip interaction errors
        }
      }
    }
  }

  console.log(`  Created ${interactionCount} drug interactions`);
  console.log(`Drugs seeded: ${processed}`);
}