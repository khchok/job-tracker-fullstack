// apps/job-service/esbuild.config.mts
import { build } from "esbuild";

await build({
  entryPoints: ["src/lambda.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  // ESM output so import.meta.url works correctly in Prisma 7 generated client.
  // Lambda Node.js 20 loads .mjs files as ES modules natively.
  format: "esm",
  outfile: "dist/lambda.mjs",
  external: ["pg-native", "@sentry/node"],
});
