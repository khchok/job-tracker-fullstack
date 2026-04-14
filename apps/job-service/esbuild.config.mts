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
  // ESM bundles have no require() — inject a real one so CJS deps (e.g. @fastify/aws-lambda) work at runtime.
  // See: https://github.com/fastify/aws-lambda-fastify/issues/191
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
  plugins: [
    {
      name: "pg-native-stub",
      setup(build) {
        // pg has an optional native binding — stub it out so the real require() from the banner
        // never attempts to load the binary (which won't exist on Lambda's Linux environment)
        build.onResolve({ filter: /^pg-native$/ }, () => ({
          path: "pg-native",
          namespace: "empty-stub",
        }));
        build.onLoad({ filter: /.*/, namespace: "empty-stub" }, () => ({
          contents: "module.exports = {}",
          loader: "js",
        }));
      },
    },
  ],
});

// @fastify/swagger-ui reads logo.svg from __dirname/static/ at runtime.
// In a Lambda bundle __dirname resolves to /var/task, so copy the static assets into dist/.
// NOTE: Reduce bundle size
// const req = createRequire(import.meta.url);
// const swaggerUiDir = dirname(req.resolve("@fastify/swagger-ui"));
// cpSync(resolve(swaggerUiDir, "static"), resolve("dist/static"), { recursive: true });
