import awsLambdaFastify from "@fastify/aws-lambda";
import cookie from "@fastify/cookie";
import Fastify from "fastify";
import { options } from "./app";
import corsPlugin from "./plugins/cors";
import dbPlugin from "./plugins/db";
import jwtPlugin from "./plugins/jwt";
import jobsRoutes from "./routes/jobs";
// NOTE: Reduce bundle size
// instrument();
const server = Fastify(options);

// NOTE: Reduce bundle size
// Sentry.setupFastifyErrorHandler(server);
// server.register(swagger, {
//   openapi: {
//     info: { title: "Jobs API", description: "", version: "1.0.0" },
//     servers: [],
//   },
// });
// server.register(swaggerUi, {
//   routePrefix: "/docs",
//   uiConfig: { docExpansion: "full", deepLinking: false },
// });
server.register(cookie);
server.register(corsPlugin);
server.register(dbPlugin);
server.register(jwtPlugin);
server.register(jobsRoutes, { prefix: "/jobs" });

export const handler = awsLambdaFastify(server);
