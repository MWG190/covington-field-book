#!/usr/bin/env node
/**
 * GitHub Pages export: Vite/Nitro client build, then a static SPA shell.
 * Hash routing (src/router.tsx) so /walk and /turf work without a Node server.
 */
import { spawn } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const env = {
  ...process.env,
  PAGES_DEPLOY: "1",
  VITE_PAGES_DEPLOY: "1",
};

const vite = spawn(
  process.execPath,
  ["scripts/with-app-env.mjs", "vite", "build"],
  { cwd: root, env, stdio: "inherit" },
);

vite.on("exit", (code) => {
  const staticDir = existsSync(join(root, ".vercel/output/static"))
    ? join(root, ".vercel/output/static")
    : join(root, ".output/public");
  if (!existsSync(join(staticDir, "assets"))) {
    console.error("[build-pages] no assets in", staticDir);
    process.exit(code || 1);
  }

  const assets = readdirSync(join(staticDir, "assets"));
  const js = assets.find((f) => /^index-.*\.js$/.test(f));
  const css = assets.find((f) => /^styles-.*\.css$/.test(f));
  if (!js || !css) {
    console.error("[build-pages] missing index JS or styles CSS", assets);
    process.exit(1);
  }

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Covington Field Book</title>
    <meta name="description" content="Living briefing and voter file for Covington, Louisiana city council districts." />
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <meta property="og:title" content="Covington Field Book" />
    <meta property="og:image" content="./og.jpg" />
    <link rel="stylesheet" href="./assets/${css}" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700&display=swap" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./assets/${js}"></script>
  </body>
</html>
`;

  const out = join(root, "_site");
  mkdirSync(out, { recursive: true });
  cpSync(staticDir, out, { recursive: true });
  writeFileSync(join(out, "index.html"), html);
  writeFileSync(join(out, "404.html"), html);
  writeFileSync(join(out, ".nojekyll"), "");
  console.log("[build-pages] wrote _site with", js, css);
  process.exit(0);
});
