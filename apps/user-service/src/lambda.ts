import awsLambdaFastify from "@fastify/aws-lambda";
import cookie from "@fastify/cookie";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import { options } from "./app";
import dbPlugin from "./plugins/db";
import jwtPlugin from "./plugins/jwt";
import internalRoutes from "./routes/internal";
import usersRoutes from "./routes/users";

const server = Fastify(options);

server.register(swagger, {
  openapi: {
    info: { title: "Users API", description: "", version: "1.0.0" },
    servers: [],
  },
});
server.register(swaggerUi, {
  routePrefix: "/docs",
  uiConfig: { docExpansion: "full", deepLinking: false },
});
server.register(cookie);
server.register(dbPlugin);
server.register(jwtPlugin);
server.register(usersRoutes, { prefix: "/users" });
server.register(internalRoutes, { prefix: "/internal" });

export const handler = awsLambdaFastify(server);
