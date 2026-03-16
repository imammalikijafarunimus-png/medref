import { prisma } from "../../client";

import { symptoms } from "../data/symptoms/symptoms"

export async function seedSymptoms() {

 console.log(`Seeding ${symptoms.length} symptoms...`)

 await prisma.symptom.createMany({
   data: symptoms,
   skipDuplicates: true
 })

 console.log("Symptoms seeded")

}