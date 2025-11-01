import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function saveRenderResult(
  vaseName: string,
  patternFile: string,
  resultImage: string
) {
  return prisma.renderResult.create({
    data: { vaseName, patternFile, resultImage },
  });
}

export async function getRenderResults() {
  return prisma.renderResult.findMany({
    orderBy: { createdAt: "desc" },
  });
}
