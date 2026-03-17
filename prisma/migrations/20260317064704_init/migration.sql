-- CreateTable
CREATE TABLE "Drug" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genericName" TEXT,
    "brandNames" TEXT,
    "drugClass" TEXT,
    "category" TEXT,
    "description" TEXT,
    "mechanism" TEXT,
    "route" TEXT,
    "halfLife" TEXT,
    "bioavailability" TEXT,
    "proteinBinding" TEXT,
    "metabolism" TEXT,
    "excretion" TEXT,
    "pregnancyCat" TEXT,
    "lactation" TEXT,
    "blackBoxWarning" TEXT,
    "regulatoryStatus" TEXT,
    "monitoringParameters" TEXT,
    "counselingPoints" TEXT,
    "storage" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Drug_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrugDose" (
    "id" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "indication" TEXT,
    "adultDose" TEXT NOT NULL,
    "pediatricDose" TEXT,
    "pediatricMinAge" TEXT,
    "pediatricMaxAge" TEXT,
    "maxDose" TEXT,
    "maxDoseUnit" TEXT,
    "frequency" TEXT,
    "duration" TEXT,
    "renalAdjust" TEXT,
    "hepaticAdjust" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrugDose_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrugIndication" (
    "id" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "indication" TEXT NOT NULL,
    "icdCode" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isFdaApproved" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrugIndication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrugContraindication" (
    "id" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "contraindication" TEXT NOT NULL,
    "severity" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrugContraindication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrugInteraction" (
    "id" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "interactingDrugId" TEXT NOT NULL,
    "interactionType" TEXT,
    "effect" TEXT,
    "mechanism" TEXT,
    "management" TEXT,
    "evidenceLevel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrugInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Herbal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latinName" TEXT,
    "commonNames" TEXT,
    "localNames" TEXT,
    "plantFamily" TEXT,
    "category" TEXT,
    "plantPart" TEXT,
    "preparation" TEXT,
    "traditionalUse" TEXT,
    "description" TEXT,
    "safetyRating" TEXT,
    "pregnancySafety" TEXT,
    "lactationSafety" TEXT,
    "pediatricSafety" TEXT,
    "contraindications" TEXT,
    "sideEffects" TEXT,
    "regulatoryStatus" TEXT,
    "references" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Herbal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HerbalCompound" (
    "id" TEXT NOT NULL,
    "herbalId" TEXT NOT NULL,
    "compoundName" TEXT NOT NULL,
    "synonyms" TEXT,
    "concentration" TEXT,
    "pharmacology" TEXT,
    "biologicalActivity" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HerbalCompound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HerbalIndication" (
    "id" TEXT NOT NULL,
    "herbalId" TEXT NOT NULL,
    "indication" TEXT NOT NULL,
    "evidenceLevel" TEXT,
    "studyType" TEXT,
    "dosage" TEXT,
    "duration" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HerbalIndication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HerbalInteraction" (
    "id" TEXT NOT NULL,
    "herbalId" TEXT NOT NULL,
    "interactingDrugId" TEXT,
    "interactingHerbalId" TEXT,
    "interactionType" TEXT,
    "effect" TEXT,
    "mechanism" TEXT,
    "management" TEXT,
    "evidenceLevel" TEXT,
    "references" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HerbalInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalNote" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "specialty" TEXT,
    "tags" TEXT,
    "source" TEXT,
    "author" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicalNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Symptom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Symptom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SymptomDrugMapping" (
    "id" TEXT NOT NULL,
    "symptomId" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isFirstLine" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SymptomDrugMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "drugId" TEXT,
    "herbalId" TEXT,
    "noteId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Drug_name_idx" ON "Drug"("name");

-- CreateIndex
CREATE INDEX "Drug_genericName_idx" ON "Drug"("genericName");

-- CreateIndex
CREATE INDEX "Drug_drugClass_idx" ON "Drug"("drugClass");

-- CreateIndex
CREATE INDEX "Drug_category_idx" ON "Drug"("category");

-- CreateIndex
CREATE INDEX "Herbal_name_idx" ON "Herbal"("name");

-- CreateIndex
CREATE INDEX "Herbal_latinName_idx" ON "Herbal"("latinName");

-- CreateIndex
CREATE INDEX "Herbal_category_idx" ON "Herbal"("category");

-- CreateIndex
CREATE UNIQUE INDEX "HerbalIndication_herbalId_indication_key" ON "HerbalIndication"("herbalId", "indication");

-- CreateIndex
CREATE INDEX "ClinicalNote_title_idx" ON "ClinicalNote"("title");

-- CreateIndex
CREATE INDEX "ClinicalNote_category_idx" ON "ClinicalNote"("category");

-- CreateIndex
CREATE INDEX "Symptom_name_idx" ON "Symptom"("name");

-- CreateIndex
CREATE INDEX "Symptom_category_idx" ON "Symptom"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_itemType_drugId_herbalId_noteId_key" ON "Favorite"("userId", "itemType", "drugId", "herbalId", "noteId");

-- AddForeignKey
ALTER TABLE "DrugDose" ADD CONSTRAINT "DrugDose_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drug"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrugIndication" ADD CONSTRAINT "DrugIndication_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drug"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrugContraindication" ADD CONSTRAINT "DrugContraindication_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drug"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrugInteraction" ADD CONSTRAINT "DrugInteraction_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drug"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrugInteraction" ADD CONSTRAINT "DrugInteraction_interactingDrugId_fkey" FOREIGN KEY ("interactingDrugId") REFERENCES "Drug"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HerbalCompound" ADD CONSTRAINT "HerbalCompound_herbalId_fkey" FOREIGN KEY ("herbalId") REFERENCES "Herbal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HerbalIndication" ADD CONSTRAINT "HerbalIndication_herbalId_fkey" FOREIGN KEY ("herbalId") REFERENCES "Herbal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HerbalInteraction" ADD CONSTRAINT "HerbalInteraction_herbalId_fkey" FOREIGN KEY ("herbalId") REFERENCES "Herbal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HerbalInteraction" ADD CONSTRAINT "HerbalInteraction_interactingHerbalId_fkey" FOREIGN KEY ("interactingHerbalId") REFERENCES "Herbal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HerbalInteraction" ADD CONSTRAINT "HerbalInteraction_interactingDrugId_fkey" FOREIGN KEY ("interactingDrugId") REFERENCES "Drug"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SymptomDrugMapping" ADD CONSTRAINT "SymptomDrugMapping_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drug"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SymptomDrugMapping" ADD CONSTRAINT "SymptomDrugMapping_symptomId_fkey" FOREIGN KEY ("symptomId") REFERENCES "Symptom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drug"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_herbalId_fkey" FOREIGN KEY ("herbalId") REFERENCES "Herbal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "ClinicalNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
