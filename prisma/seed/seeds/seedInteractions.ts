import { prisma } from "../../client";

import { PrismaClient } from "@prisma/client"
import { drugInteractions } from "../data/interactions/drugInteractions"

export async function seedInteractions() {

  console.log(`Seeding ${drugInteractions.length} interactions...`)

  await prisma.drugInteraction.createMany({
    data: drugInteractions,
    skipDuplicates: true
  })

  console.log("Drug interactions seeded")
}