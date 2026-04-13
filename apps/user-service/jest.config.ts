import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  moduleNameMapper: {
    "^shared-types$": "<rootDir>/../../libraries/shared-types/src/index.ts",
    "^../generated/prisma/client$": "<rootDir>/src/__mocks__/prisma-client.ts",
    "^../../generated/prisma/client$": "<rootDir>/src/__mocks__/prisma-client.ts",
    "^../lib/prisma$": "<rootDir>/src/__mocks__/prisma.ts",
    "^../../lib/prisma$": "<rootDir>/src/__mocks__/prisma.ts",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          module: "commonjs",
          moduleResolution: "node",
        },
      },
    ],
  },
};

export default config;
