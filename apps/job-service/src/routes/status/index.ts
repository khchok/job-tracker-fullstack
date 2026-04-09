import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.get("/", async (_request, reply) => {
    const statuses = await fastify.prisma.status.findMany();
    return statuses;
  });
}