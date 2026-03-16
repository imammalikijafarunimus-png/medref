import { prisma } from "../../client"; 

import { PrismaClient } from "@prisma/client"
import { drugSymptomMappings } from "../data/mappings/drugSymptomMappings"

export async function seedMappings() {

  console.log(`Seeding ${drugSymptomMappings.length} symptom-drug mappings...`)

  await prisma.symptomDrugMapping.createMany({
    data: drugSymptomMappings,
    skipDuplicates: true
  })

  console.log("Symptom mappings seeded")
}