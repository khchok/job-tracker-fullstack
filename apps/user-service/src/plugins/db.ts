import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import prisma from "../lib/prisma";

const prismaPlugin = async (fastify: FastifyInstance) => {
  // No $connect() — Prisma connects lazily on first query.
  // Calling $connect() at startup blocks plugin init, causing timeouts when the remote DB
  // takes too long to respond (especially on cloud deployments with network latency).
  fastify.decorate("prisma", prisma);
  fastify.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
};

export default fp(prismaPlugin, { name: "prisma" });
