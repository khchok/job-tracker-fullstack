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
  external: ["pg-native"],
  // ESM bundles have no require() — inject a real one so CJS deps (e.g. @fastify/aws-lambda) work at runtime.
  // See: https://github.com/fastify/aws-lambda-fastify/issues/191
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
});
