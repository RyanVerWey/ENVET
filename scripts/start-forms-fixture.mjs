// Synthetic UI-only fixtures; not served by Next.js or production hosting.
import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const workspace = join(dirname(fileURLToPath(import.meta.url)), "..");
const fixture = join(workspace, "tests", "fixtures");
const server = await createServer({
  root: fixture,
  configFile: false,
  logLevel: "error",
  esbuild: { jsx: "automatic" },
  cacheDir: join(workspace, "node_modules", ".vite-forms-fixture"),
  optimizeDeps: { entries: ["forms-workspace.html"] },
  resolve: {
    alias: {
      "@": join(workspace, "src"),
      "next/link": join(fixture, "forms-next-link.tsx"),
      "next/navigation": join(fixture, "forms-next-navigation.ts"),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 3013,
    strictPort: true,
    fs: { allow: [workspace], strict: true },
  },
});
await server.listen();
console.log("Synthetic fixture: http://127.0.0.1:3013/forms-workspace.html");
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, async () => {
    await server.close();
    process.exit(0);
  });
