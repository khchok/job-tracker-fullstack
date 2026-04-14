import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import prisma from "../lib/prisma";

const prismaPlugin = async (fastify: FastifyInstance) => {
  await prisma.$connect();
  fastify.decorate("prisma", prisma);
  fastify.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
};

export default fp(prismaPlugin, { name: "prisma" });
