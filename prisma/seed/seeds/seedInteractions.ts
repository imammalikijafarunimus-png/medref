import { prisma } from "../../client";
import { drugInteractions } from "../data/interactions/drugInteractions";

/**
 * Seed comprehensive drug interactions from the interactions database
 * This supplements the interactions seeded from individual drug files
 */
export async function seedInteractions() {
  console.log(`Seeding ${drugInteractions.length} comprehensive drug interactions...`);

  let processed = 0;
  let created = 0;
  let skipped = 0;

  for (const interaction of drugInteractions) {
    try {
      // Check if both drugs exist
      const drugA = await prisma.drug.findUnique({
        where: { id: interaction.drugAId },
      });

      const drugB = await prisma.drug.findUnique({
        where: { id: interaction.drugBId },
      });

      if (!drugA || !drugB) {
        skipped++;
        continue;
      }

      // Check if interaction already exists
      const existingInteraction = await prisma.drugInteraction.findFirst({
        where: {
          drugId: interaction.drugAId,
          interactingDrugId: interaction.drugBId,
        },
      });

      if (existingInteraction) {
        // Update existing interaction
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
        // Create new interaction
        await prisma.drugInteraction.create({
          data: {
            drugId: interaction.drugAId,
            interactingDrugId: interaction.drugBId,
            interactionType: interaction.interactionType,
            effect: interaction.effect,
            mechanism: interaction.mechanism,
            management: interaction.management,
          },
        });
      }

      created++;
      processed++;

      if (processed % 20 === 0) {
        console.log(`  Processed ${processed}/${drugInteractions.length} interactions...`);
      }
    } catch (error) {
      console.error(`  Error creating interaction ${interaction.drugAId} - ${interaction.drugBId}`);
    }
  }

  console.log(`  Interactions created/updated: ${created}`);
  console.log(`  Interactions skipped (drug not found): ${skipped}`);
}

/**
 * Get all interactions for a specific drug ID
 */
export async function getInteractionsForDrug(drugId: string) {
  return prisma.drugInteraction.findMany({
    where: {
      OR: [
        { drugId },
        { interactingDrugId: drugId },
      ],
    },
    include: {
      drug: { select: { id: true, name: true } },
      interactingDrug: { select: { id: true, name: true } },
    },
  });
}