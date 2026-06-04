const { execFileSync } = require("child_process");
const { createHash } = require("crypto");
const fs = require("fs");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "..", ".cache", "diagrams");

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function renderD2(source) {
  const hash = createHash("sha256").update(source).digest("hex").slice(0, 16);
  const cachePath = path.join(CACHE_DIR, `${hash}.svg`);

  if (fs.existsSync(cachePath)) {
    return fs.readFileSync(cachePath, "utf8");
  }

  ensureCacheDir();

  const svg = execFileSync("d2", ["-", "-"], {
    input: source,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });

  fs.writeFileSync(cachePath, svg);
  return svg;
}

module.exports = { renderD2 };
