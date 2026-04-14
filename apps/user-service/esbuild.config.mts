// apps/user-service/esbuild.config.mts
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
  plugins: [
    {
      name: "node-builtins",
      setup(build) {
        // esbuild's __require shim doesn't handle node: protocol — mark all as external
        // so they become proper ESM imports in the bundle (e.g. @sentry/node uses node:crypto)
        build.onResolve({ filter: /^node:/ }, (args) => ({
          path: args.path,
          external: true,
        }));
      },
    },
  ],
});
