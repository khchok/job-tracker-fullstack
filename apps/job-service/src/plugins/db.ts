import { PrismaPg } from "@prisma/adapter-pg";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { PrismaClient } from "../generated/prisma/client";

const prismaPlugin = async (fastify: FastifyInstance) => {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.JOB_SERVICE_DATABASE_URL,
    }),
  });
  await prisma.$connect();
  fastify.decorate("prisma", prisma);
  fastify.addHook("onClose", async (fastify: FastifyInstance) => {
    await fastify.prisma.$disconnect();
  });
};

export default fp(prismaPlugin, { name: "prisma" });
