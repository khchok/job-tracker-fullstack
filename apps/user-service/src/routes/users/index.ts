import { FastifyInstance } from "fastify";

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
            username: { type: "string" },
            password: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const { username, password } = request.body as {
        username: string;
        password: string;
      };
      const token = fastify.jwt.sign({ username });
      return reply.status(200).send({ token });
    },
  );
}
