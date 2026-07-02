import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    globalSetup: "./tests/setup/global.setup.ts",
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],

    testTimeout: 30000,
    hookTimeout: 30000,

    fileParallelism: false,

    reporters: ["tree"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/server.ts", "src/generated/**"],
    },
  },
  plugins: [tsconfigPaths()],
})
