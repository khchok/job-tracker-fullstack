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

instrument();
Sentry.setupFastifyErrorHandler(server);

// Register the app as a plugin
server.register(app);

// NOTE: Test error endpoint for Sentry
server.get("/debug-sentry", (req, res) => {
  Sentry.logger.info("User triggered test error", {
    action: "test_error_endpoint",
  });
  throw new Error("My first Sentry error!");
});

// Start listening
const PORT = parseInt(process.env.FASTIFY_PORT ?? "3031") || 3031;
server.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    Sentry.captureException(err);
    server.log.error({ err }, "Server shutdown due to an error");
    process.exit(1);
  }
});
