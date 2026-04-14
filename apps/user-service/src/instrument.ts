import * as Sentry from "@sentry/node";

export function instrument() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    enableLogs: true,
    sendDefaultPii: true,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV,
    initialScope: {
      tags: {
        service: "user-service",
      }
    }
  });
}
