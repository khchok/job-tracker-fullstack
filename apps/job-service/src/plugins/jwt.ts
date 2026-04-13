import jwt from "@fastify/jwt";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { JwtPayload } from "shared-types";
import { validateSession } from "../lib/session-validator";

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
      } catch (err) {
        return reply.send(err);
      }

      const payload = request.user as JwtPayload;
      if (!payload?.jti) {
        return reply.status(401).send({ error: "Invalid token" });
      }

      try {
        const valid = await validateSession(payload.jti);
        if (!valid) {
          return reply.status(401).send({ error: "Invalid session" });
        }
      } catch {
        return reply
          .status(503)
          .send({ error: "Authentication service unavailable" });
      }
    },
  );
}

export default fp(jwtPlugin, {
  name: "jwt",
});
