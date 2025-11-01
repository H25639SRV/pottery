// backend/src/services/renderService.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function saveRenderResult(
  vaseName: string,
  patternFile: string,
  resultImage: string
) {
  return await prisma.renderResult.create({
    data: { vaseName, patternFile, resultImage },
  });
}

export async function getRenderResults() {
  return await prisma.renderResult.findMany({
    orderBy: { createdAt: "desc" },
  });
}
