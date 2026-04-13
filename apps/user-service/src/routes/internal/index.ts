import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import * as sessionRepository from "../../repositories/session.repository";

export default async function internalRoutes(fastify: FastifyInstance) {
  fastify.addHook(
    "preHandler",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const secret = request.headers["x-internal-secret"];
      if (!secret || secret !== process.env.INTERNAL_SERVICE_SECRET) {
        return reply.status(401).send({ error: "Unauthorized" });
      }
    },
  );

  fastify.get(
    "/sessions/:jti",
    async (
      request: FastifyRequest<{ Params: { jti: string } }>,
      reply: FastifyReply,
    ) => {
      const { jti } = request.params;
      const session = await sessionRepository.findByJti(jti);
      if (!session) {
        return reply.status(404).send({ error: "Session not found" });
      }
      return reply.status(200).send({ id: session.id });
    },
  );
}
