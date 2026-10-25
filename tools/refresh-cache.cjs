"use strict";
/* Actualiza exclusivamente los parámetros v de recursos JS/CSS locales en index.html.
 * Uso: node tools/refresh-cache.cjs [--check|--write]
 * Sin argumentos muestra un diagnóstico sin escribir archivos.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

function refresh(html, root) {
  const base = path.resolve(root);
  const seen = new Set();
  let updated = 0;
  const output = html.replace(/<(script|link)\b[^>]*>/gi, (tag, kind) => {
    if (kind.toLowerCase() === "link" &&
        !/\brel\s*=\s*(["'])stylesheet\1/i.test(tag)) return tag;
    const attr = kind.toLowerCase() === "script" ? "src" : "href";
    const match = tag.match(new RegExp("\\b" + attr + "\\s*=\\s*([\\\"'])([^\\\"']+)\\1", "i"));
    if (!match) return tag;
    const original = match[2];
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/)/i.test(original)) return tag;
    const hashAt = original.indexOf("#");
    const fragment = hashAt < 0 ? "" : original.slice(hashAt);
    const withoutFragment = hashAt < 0 ? original : original.slice(0, hashAt);
    const queryAt = withoutFragment.indexOf("?");
    const filename = queryAt < 0 ? withoutFragment : withoutFragment.slice(0, queryAt);
    if (!/\.(?:js|css)$/i.test(filename)) return tag;
    const absolute = path.resolve(base, filename);
    if (!absolute.startsWith(base + path.sep)) {
      throw new Error("Recurso fuera del proyecto: " + filename);
    }
    const bytes = fs.readFileSync(absolute);
    const digest = crypto.createHash("sha256").update(bytes).digest("hex").slice(0, 12);
    const params = new URLSearchParams(queryAt < 0 ? "" : withoutFragment.slice(queryAt + 1));
    params.set("v", "sha256-" + digest);
    const replacement = filename + "?" + params.toString() + fragment;
    seen.add(filename);
    if (replacement === original) return tag;
    updated++;
    return tag.replace(match[0], match[0].replace(original, replacement));
  });
  if (!seen.size) throw new Error("No se encontraron recursos JavaScript/CSS locales");
  return {html: output, updated, resources: seen.size};
}

if (require.main === module) {
  const arg = process.argv[2] || "--dry-run";
  if (!["--dry-run", "--check", "--write"].includes(arg) || process.argv.length > 3) {
    console.error("Uso: node tools/refresh-cache.cjs [--check|--write]");
    process.exitCode = 2;
  } else {
    try {
      const root = path.resolve(__dirname, "..");
      const index = path.join(root, "index.html");
      const before = fs.readFileSync(index, "utf8");
      const result = refresh(before, root);
      if (arg === "--write" && result.updated) fs.writeFileSync(index, result.html, "utf8");
      console.log(result.resources + " recursos locales; " + result.updated + " versiones por actualizar.");
      if (arg === "--check" && result.updated) process.exitCode = 1;
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  }
}
module.exports = {refresh};
