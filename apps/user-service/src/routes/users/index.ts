import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
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

      const user = await userService.signIn(email, password);
      if (!user) return reply.code(401).send({ error: "Invalid credentials" });

      const jti = randomUUID();
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
        const payload = fastify.jwt.decode<{ jti?: string; exp?: number }>(rawToken);
        if (payload?.jti) {
          const expiresAt = payload.exp
            ? new Date(payload.exp * 1000)
            : new Date(Date.now() + 24 * 60 * 60 * 1000); // fallback: 24h

          await fastify.prisma.revokedToken.upsert({
            where: { jti: payload.jti },
            update: {},
            create: { jti: payload.jti, expiresAt },
          });
        }
      } catch {
        // Malformed token — still clear the cookie
      }
    }

    reply.clearCookie("token", { path: "/" });
    return reply.status(200).send({ message: "Logged out" });
  });
}
