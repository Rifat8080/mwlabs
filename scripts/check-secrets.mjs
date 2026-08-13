import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const candidateFiles = execFileSync(
  "git",
  ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
  { encoding: "utf8" },
)
  .split("\0")
  .filter(Boolean);

const forbiddenFiles = candidateFiles.filter((file) => (
  /(^|\/)\.env(?:\..+)?$/i.test(file)
) || /(^|\/)(?:service-account|google-credentials).*\.json$/i.test(file));

const patterns = [
  { name: "Google API key", value: /AIza[A-Za-z0-9_-]{30,}/ },
  { name: "GitHub token", value: /(github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{30,})/ },
  { name: "OpenAI-style API key", value: /sk-[A-Za-z0-9_-]{20,}/ },
  { name: "AWS access key", value: /AKIA[0-9A-Z]{16}/ },
  { name: "private key", value: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: "publicly exposed secret variable", value: /NEXT_PUBLIC_[A-Z0-9_]*(KEY|SECRET|TOKEN)\s*=/ },
];

const matches = [];
for (const file of candidateFiles) {
  let content;
  try {
    content = readFileSync(file);
  } catch {
    continue;
  }
  if (content.includes(0)) continue;
  const text = content.toString("utf8");
  for (const pattern of patterns) {
    if (pattern.value.test(text)) matches.push({ pattern: pattern.name, file });
  }
}

if (forbiddenFiles.length || matches.length) {
  console.error("Secret scan failed. No secret values were printed.");
  if (forbiddenFiles.length) console.error(`Forbidden tracked files:\n${forbiddenFiles.map((file) => `- ${file}`).join("\n")}`);
  for (const match of matches) console.error(`${match.pattern}: ${match.file}`);
  process.exit(1);
}

console.log(`Secret scan passed for ${candidateFiles.length} tracked and untracked files.`);
