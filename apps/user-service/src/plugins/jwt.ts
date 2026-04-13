import jwt from "@fastify/jwt";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import * as sessionRepository from "../repositories/session.repository";
async function jwtPlugin(fastify: FastifyInstance) {
  await fastify.register(jwt, {
    secret: process.env.JWT_PUBLIC_KEY!,
    cookie: {
      cookieName: "token",
      signed: false,
    },
  });

  fastify.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
        const token = (request as any).cookies["token"]!;
        const payload = fastify.jwt.decode<{
          id: string;
          email: string;
          jti: string;
        }>(token)!;

        const session = await sessionRepository.findByJti(payload.jti);
        if (!session) {
          throw new Error("Invalid Credential");
        }
      } catch (err) {
        reply.send(err);
      }
    },
  );
}

export default fp(jwtPlugin, {
  name: "jwt",
});
