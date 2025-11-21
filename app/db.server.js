import { PrismaClient } from "@prisma/client";

if (process.env.NODE_ENV !== "production") {
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient();
  }
}

const prisma = global.prismaGlobal ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  if (!global.prismaGlobal) {
    global.prismaGlobal = prisma;
  }
}

console.log(`[DB] Prisma Client initialized. NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[DB] Database URL present: ${!!process.env.PRISMA_DATABASE_URL}`);

export default prisma;
