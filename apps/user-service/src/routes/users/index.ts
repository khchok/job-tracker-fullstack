import { FastifyInstance } from "fastify";
import * as sessionService from "../../services/session.service";
import * as userService from "../../services/user.service";

export default async function (fastify: FastifyInstance) {
  fastify.get("/ping", async (_request, reply) => {
    return { message: "pong" };
  });

  fastify.get("/", async (_request, reply) => {
    const users = await fastify.prisma.user.findMany();
    return users;
  });

  fastify.post(
    "/auth",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            email: { type: "string" },
            password: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body as {
        email: string;
        password: string;
      };

      const userSessionResult = await userService.signIn(email, password);
      if (!userSessionResult)
        return reply.code(401).send({ error: "Invalid credentials" });

      const { user, session } = userSessionResult;

      const jti = session.id;
      const token = fastify.jwt.sign({ id: user.id, email: user.email, jti });
      reply.setCookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
      });
      return reply.status(200).send({ message: "Login successful" });
    },
  );

  fastify.post("/auth/logout", async (request, reply) => {
    const rawToken = request.cookies["token"];
    if (rawToken) {
      try {
        const payload = fastify.jwt.decode<{ jti?: string }>(rawToken);
        if (payload?.jti) {
          const expiresAt = new Date(Date.now()); // fallback: 24h

          await sessionService.updateExpiresAt(payload.jti, expiresAt);
        }
      } catch {
        // Malformed token — still clear the cookie
      }
    }

    reply.clearCookie("token", { path: "/" });
    return reply.status(200).send({ message: "Logged out" });
  });

  fastify.get(
    "/auth/me",
    {
      // @ts-ignore
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const rawToken = request.cookies["token"];
      if (!rawToken) {
        return reply.code(401).send({ error: "Unauthorized" });
      }
      const payload = fastify.jwt.decode<{ id?: string; email?: string }>(
        rawToken,
      );
      if (!payload?.id) {
        return reply.code(401).send({ error: "Unauthorized" });
      }

      return payload;
    },
  );
}
