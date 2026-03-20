import { Drug, Prisma } from "@prisma/client";

export type DrugWithRelations = Prisma.DrugGetPayload<{
  include: {
    // Define any relations here that you want to include
    // For example: category: true, indications: true
  };
}> & {
  isFavorite?: boolean;
};

export type DrugWithoutRelations = Drug;
