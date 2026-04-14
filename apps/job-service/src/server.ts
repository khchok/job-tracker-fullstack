import * as Sentry from "@sentry/node";
import Fastify from "fastify";
import app, { options } from "./app";
import { instrument } from "./instrument";

// Load .env file
try {
  process.loadEnvFile();
} catch {
  // .env is optional
}

// Instantiate Fastify with options exported from app.ts (logger included)
const server = Fastify(options);

// Register the app as a plugin
server.register(app);

// Start listening
const PORT = parseInt(process.env.FASTIFY_PORT ?? "3030") || 3030;

instrument();
Sentry.setupFastifyErrorHandler(server);

server.get("/debug-sentry", (req, res) => {
  Sentry.logger.info("Job triggered test error", {
    action: "test_error_endpoint",
  });
  throw new Error("My first Sentry error!");
});

server.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    Sentry.captureException(err);
    server.log.error({ err }, "Server shutdown due to an error");
    process.exit(1);
  }
});
