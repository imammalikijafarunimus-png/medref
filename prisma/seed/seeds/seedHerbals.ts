import { prisma } from "../../client";
import { HerbalSeedData } from "../types";

// Import all herbal categories
import { antiinflammatoryHerbals } from "../data/herbals/antiinflammatory";
import { immunityHerbals } from "../data/herbals/immunity";
import { digestiveHerbals } from "../data/herbals/digestive";
import { cardiovascularHerbals } from "../data/herbals/cardiovascular";
import { metabolicHerbals } from "../data/herbals/metabolic";
import { nervousHerbals } from "../data/herbals/nervous";
import { respiratoryHerbals } from "../data/herbals/respiratory";

export async function seedHerbals() {
  const herbals: HerbalSeedData[] = [
    ...antiinflammatoryHerbals,
    ...immunityHerbals,
    ...digestiveHerbals,
    ...cardiovascularHerbals,
    ...metabolicHerbals,
    ...nervousHerbals,
    ...respiratoryHerbals,
  ];

  console.log(`Seeding ${herbals.length} herbals...`);

  let processed = 0;
  for (const herbal of herbals) {
    try {
      // Handle regulatoryStatus - convert object to string if needed
      const regulatoryStatusStr = typeof herbal.regulatoryStatus === 'object'
        ? JSON.stringify(herbal.regulatoryStatus)
        : herbal.regulatoryStatus;

      // Upsert main herbal record
      await prisma.herbal.upsert({
        where: { id: herbal.id },
        update: {
          name: herbal.name,
          latinName: herbal.latinName,
          commonNames: herbal.commonNames,
          plantPart: herbal.plantPart,
          preparation: herbal.preparation,
          traditionalUse: herbal.traditionalUse,
          safetyRating: herbal.safetyRating,
          pregnancySafety: herbal.pregnancySafety,
          lactationSafety: herbal.lactationSafety,
          pediatricSafety: herbal.pediatricSafety,
          regulatoryStatus: regulatoryStatusStr,
          notes: herbal.notes,
        },
        create: {
          id: herbal.id,
          name: herbal.name,
          latinName: herbal.latinName,
          commonNames: herbal.commonNames,
          plantPart: herbal.plantPart,
          preparation: herbal.preparation,
          traditionalUse: herbal.traditionalUse,
          safetyRating: herbal.safetyRating,
          pregnancySafety: herbal.pregnancySafety,
          lactationSafety: herbal.lactationSafety,
          pediatricSafety: herbal.pediatricSafety,
          regulatoryStatus: regulatoryStatusStr,
          notes: herbal.notes,
        },
      });

      // Handle compounds
      if (herbal.compounds && herbal.compounds.length > 0) {
        await prisma.herbalCompound.deleteMany({
          where: { herbalId: herbal.id },
        });

        for (const compound of herbal.compounds) {
          await prisma.herbalCompound.create({
            data: {
              herbalId: herbal.id,
              compoundName: compound.compoundName,
              concentration: compound.concentration,
              pharmacology: compound.pharmacology,
              notes: compound.notes,
            },
          });
        }
      }

      // Handle indications
      if (herbal.indications && herbal.indications.length > 0) {
        await prisma.herbalIndication.deleteMany({
          where: { herbalId: herbal.id },
        });

        for (const indication of herbal.indications) {
          await prisma.herbalIndication.create({
            data: {
              herbalId: herbal.id,
              indication: indication.indication,
              evidenceLevel: indication.evidenceLevel,
              studyType: indication.studyType,
              dosage: indication.dosage,
              duration: indication.duration,
              notes: indication.notes,
            },
          });
        }
      }

      // Handle interactions with drugs
      if (herbal.interactions && herbal.interactions.length > 0) {
        await prisma.herbalInteraction.deleteMany({
          where: { herbalId: herbal.id },
        });

        for (const interaction of herbal.interactions) {
          if (interaction.interactingDrugId) {
            const drug = await prisma.drug.findUnique({
              where: { id: interaction.interactingDrugId },
            });

            if (drug) {
              await prisma.herbalInteraction.create({
                data: {
                  herbalId: herbal.id,
                  interactingDrugId: interaction.interactingDrugId,
                  interactionType: interaction.interactionType,
                  effect: interaction.effect,
                  mechanism: interaction.mechanism,
                  management: interaction.management,
                  references: interaction.references,
                },
              });
            }
          }
        }
      }

      processed++;
      if (processed % 5 === 0) {
        console.log(`  Processed ${processed}/${herbals.length} herbals...`);
      }
    } catch (error) {
      console.error(`Error seeding herbal ${herbal.id}:`, error);
    }
  }

  console.log(`Herbals seeded: ${processed}`);
}