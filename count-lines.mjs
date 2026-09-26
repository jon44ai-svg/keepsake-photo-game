import { readdirSync, readFileSync } from "node:fs"
import { extname, join } from "node:path"

const sourceExtensions = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".mts", ".cts", ".css", ".html", ".java", ".kt"])
const ignoredDirectories = new Set([".git", ".expo", ".turbo", "build", "coverage", "dist", "node_modules", ".vercel", ".pnpm-store"])
let total = 0

function countLines(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) countLines(path)
    else if (entry.isFile() && sourceExtensions.has(extname(entry.name))) {
      const content = readFileSync(path, "utf8")
      if (content) total += (content.match(/\r\n|\r|\n/g)?.length ?? 0) + Number(!/[\r\n]$/.test(content))
    }
  }
}

countLines(".")
console.log(`${total} source lines`)
