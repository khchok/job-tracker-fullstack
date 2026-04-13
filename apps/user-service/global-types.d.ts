import type { Jwt } from "@fastify/jwt";
import { PrismaClient } from "./src/generated/prisma/client";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
    jwt: Jwt;
  }
}
