import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { componentTagger } from "lovable-tagger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

function getPrerenderRoutes(): string[] {
  const p = path.resolve(__dirname, "prerender-routes.json");
  if (!existsSync(p)) return ["/", "/rancagua"];
  try {
    const json = readFileSync(p, "utf8");
    return JSON.parse(json) as string[];
  } catch {
    return ["/", "/rancagua"];
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [react(), mode === "development" && componentTagger()].filter(Boolean);

  if (process.env.PRERENDER === "true") {
    const vitePrerender = require("vite-plugin-prerender");
    const routes = getPrerenderRoutes();
    const PrerenderPlugin = typeof vitePrerender === "function" ? vitePrerender : vitePrerender.default;
    plugins.push(
      PrerenderPlugin({
        staticDir: path.join(__dirname, "dist"),
        routes,
        renderer: new vitePrerender.PuppeteerRenderer({
          renderAfterTime: 4000,
          headless: true,
        }),
      })
    );
  }

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
