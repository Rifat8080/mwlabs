import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const output = resolve("public/work");
const projects = [
  ["arcline", "ARCLINE / COMMERCE SYSTEM", "1440", "960", "#E7E8E3", "#0E1013"],
  ["lume", "LUME / BEAUTY LAUNCH", "1440", "1800", "#0E1013", "#E7E8E3"],
  ["rooted", "ROOTED / MEMBERSHIP PRODUCT", "1440", "960", "#F4F5F1", "#1B34F5"],
  ["tide", "TIDE / CONTENT ENGINE", "1440", "1800", "#949BA1", "#0E1013"]
];

function svg(label, width, height, background, foreground) {
  const point = Math.round(Math.min(Number(width), Number(height)) * .055);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${background}"/><path d="M0 ${height * .78}L${width} ${height * .2}" stroke="${foreground}" stroke-opacity=".26" stroke-width="2"/><circle cx="${width * .76}" cy="${height * .28}" r="${Math.min(width, height) * .13}" fill="none" stroke="${foreground}" stroke-opacity=".42" stroke-width="2"/><text x="${point}" y="${point * 1.42}" font-family="monospace" font-size="${Math.max(18, point * .42)}" letter-spacing="2" fill="${foreground}">${label}</text><text x="${point}" y="${Number(height) - point}" font-family="monospace" font-size="${Math.max(14, point * .26)}" letter-spacing="1.5" fill="${foreground}" fill-opacity=".72">REPLACE WITH FINAL PROJECT PHOTOGRAPHY</text></svg>`;
}

await mkdir(output, { recursive: true });
await Promise.all(projects.map(([slug, label, width, height, background, foreground]) => writeFile(resolve(output, `${slug}.svg`), svg(label, width, height, background, foreground))));
