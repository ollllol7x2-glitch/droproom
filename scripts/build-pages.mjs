import { copyFile, mkdir, mkdtemp, rename, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backupRoot = await mkdtemp(path.join(tmpdir(), "droproom-pages-"));

const replacements = [
  ["app/account/page.tsx", "scripts/pages-overrides/account-page.tsx"],
  ["app/admin/page.tsx", "scripts/pages-overrides/admin-page.tsx"],
  ["app/shop/page.tsx", "scripts/pages-overrides/shop-page.tsx"],
];
const removedForExport = ["app/api/auth/[...nextauth]/route.ts"];

async function backUp(relativePath) {
  const source = path.join(root, relativePath);
  const backup = path.join(backupRoot, relativePath);
  await mkdir(path.dirname(backup), { recursive: true });
  await rename(source, backup);
}

async function restore(relativePath) {
  const source = path.join(backupRoot, relativePath);
  const target = path.join(root, relativePath);
  await rm(target, { force: true });
  await mkdir(path.dirname(target), { recursive: true });
  await rename(source, target);
}

try {
  for (const [target] of replacements) await backUp(target);
  for (const target of removedForExport) await backUp(target);

  for (const [target, replacement] of replacements) {
    await copyFile(path.join(root, replacement), path.join(root, target));
  }

  const nextCli = path.join(root, "node_modules/next/dist/bin/next");
  const result = spawnSync(process.execPath, [nextCli, "build", "--webpack"], {
    cwd: root,
    env: { ...process.env, GITHUB_PAGES: "true" },
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status ?? 1;
} finally {
  for (const [target] of replacements.reverse()) await restore(target);
  for (const target of removedForExport.reverse()) await restore(target);
  await rm(backupRoot, { recursive: true, force: true });
}
