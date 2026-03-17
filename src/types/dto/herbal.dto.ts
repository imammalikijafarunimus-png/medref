export type HerbalListDTO = {
  id: string;
  name: string;
  latinName: string | null;
  commonNames: string[];
  safetyRating: string | null;

  indications: {
    id: string;
    indication: string;
  }[];

  interactionCount: number;
};

export type HerbalDetailDTO = {
  id: string;
  name: string;
  latinName: string | null;
  commonNames: string[];

  plantPart: string | null;
  preparation: string | null;
  traditionalUse: string | null;

  safetyRating: string | null;
  pregnancySafety: string | null;
  lactationSafety: string | null;
  pediatricSafety: string | null;

  compounds: {
    id: string;
    compoundName: string;
    concentration: string | null;
    pharmacology: string | null;
  }[];

  indications: {
    id: string;
    indication: string;
    evidenceLevel: string | null;
    dosage: string | null;
  }[];

  interactions: {
    id: string;
    interactionType: string | null;
    interactingDrug: {
      id: string;
      name: string;
      genericName: string;
    } | null;
  }[];
};