import { prisma } from "../../client";

import { drugNotes } from "../data/notes/drugNotes"

export async function seedNotes() {

  console.log(`Seeding ${drugNotes.length} clinical notes...`)

  await prisma.clinicalNote.createMany({
    data: drugNotes,
    skipDuplicates: true
  })

  console.log("Clinical notes seeded")
}