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

      const token = fastify.jwt.sign({ id: user.id, email: user.email });
      reply.setCookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "none",
      });
      return reply.status(200).send({ message: "Login successful" });
    },
  );
}
