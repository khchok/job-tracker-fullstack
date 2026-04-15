import jwt from '@fastify/jwt';
import * as Sentry from '@sentry/node';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { JwtPayload } from 'shared-types';

async function jwtPlugin(fastify: FastifyInstance) {
  await fastify.register(jwt, {
    secret: process.env.JWT_PUBLIC_KEY!,
    cookie: {
      cookieName: 'token',
      signed: false
    }
  });

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.send(err);
    }

    const payload = request.user as JwtPayload;
    if (!payload?.jti) {
      return reply.status(401).send({ error: 'Invalid token' });
    }

    try {
      const valid = true; // TODO: due to server overload, temporarily skip session validation.
      // const valid = await validateSession(payload.jti);
      if (!valid) {
        return reply.status(401).send({ error: 'Invalid session' });
      }
    } catch (err) {
      Sentry.captureException(err);
      return reply.status(503).send({ error: 'Authentication service unavailable' });
    }
  });
}

export default fp(jwtPlugin, {
  name: 'jwt'
});
