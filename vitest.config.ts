import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],

    testTimeout: 30000,
    hookTimeout: 30000,

    fileParallelism: false,

    reporters: ["tree"],
  },
  plugins: [tsconfigPaths()],
})
