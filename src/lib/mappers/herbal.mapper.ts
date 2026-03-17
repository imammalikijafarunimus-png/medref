import { Prisma } from '@prisma/client';
import { HerbalListDTO, HerbalDetailDTO } from '@/types/dto/herbal.dto';

//
// 🔷 Helper
//
function parseCommonNames(value: string | null): string[] {
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

//
// 🔷 LIST MAPPER
//
export function mapToHerbalListDTO(
  herbal: Prisma.HerbalGetPayload<{
    include: {
      indications: true;
      _count: { select: { interactions: true } };
    };
  }>
): HerbalListDTO {
  return {
    id: herbal.id,
    name: herbal.name,
    latinName: herbal.latinName,
    commonNames: parseCommonNames(herbal.commonNames),
    safetyRating: herbal.safetyRating,

    indications: herbal.indications.map((i) => ({
      id: i.id,
      indication: i.indication,
    })),

    interactionCount: herbal._count.interactions,
  };
}

//
// 🔷 DETAIL MAPPER
//
export function mapToHerbalDetailDTO(
  herbal: Prisma.HerbalGetPayload<{
    include: {
      compounds: true;
      indications: true;
      interactions: {
        include: {
          interactingDrug: true;
        };
      };
    };
  }>
): HerbalDetailDTO {
  return {
    id: herbal.id,
    name: herbal.name,
    latinName: herbal.latinName,
    commonNames: parseCommonNames(herbal.commonNames),

    plantPart: herbal.plantPart,
    preparation: herbal.preparation,
    traditionalUse: herbal.traditionalUse,

    safetyRating: herbal.safetyRating,
    pregnancySafety: herbal.pregnancySafety,
    lactationSafety: herbal.lactationSafety,
    pediatricSafety: herbal.pediatricSafety,

    compounds: herbal.compounds.map((c) => ({
      id: c.id,
      compoundName: c.compoundName,
      concentration: c.concentration,
      pharmacology: c.pharmacology,
    })),

    indications: herbal.indications.map((i) => ({
      id: i.id,
      indication: i.indication,
      evidenceLevel: i.evidenceLevel,
      dosage: i.dosage,
    })),

    interactions: herbal.interactions.map((i) => ({
      id: i.id,
      interactionType: i.interactionType,
      interactingDrug: i.interactingDrug
        ? {
            id: i.interactingDrug.id,
            name: i.interactingDrug.name,
            genericName: i.interactingDrug.genericName ?? '',
          }
        : null,
    })),
  };
}