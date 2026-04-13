import AutoLoad from "@fastify/autoload";
import cookie from "@fastify/cookie";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyServerOptions,
} from "fastify";
import path from "path";

// Fastify server options
export const options: FastifyServerOptions = {
  logger: {
    level: process.env.LOG_LEVEL || "debug",
    transport:
      process.env.NODE_ENV !== "production"
        ? {
            target: "pino-pretty",
            options: {
              translateTime: "HH:MM:ss Z",
              ignore: "pid,hostname",
              colorize: true,
            },
          }
        : undefined,
  },
};

export default async function app(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
) {
  // Register swagger BEFORE routes so it can collect schemas
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "Users API",
        description: "Testing the Fastify swagger API",
        version: "1.0.0",
      },
      servers: [{ url: `http://localhost:${process.env.FASTIFY_PORT}` }],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
  });

  await fastify.register(cookie);

  // Automatically load all plugins from the plugins/ folder
  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    indexPattern: /^.*route(?:\.ts|\.js|\.cjs|\.mjs)$/,
    options: { ...opts },
  });

  // Automatically load all routes from the routes/ folder
  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    options: { ...opts },
  });
}
