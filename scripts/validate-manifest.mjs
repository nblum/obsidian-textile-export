import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.join(scriptDirectory, "..");

/** Reads one required JSON document from the repository root. */
function readJson(filename) {
  return JSON.parse(fs.readFileSync(path.join(repositoryRoot, filename), "utf8"));
}

/** Throws a focused validation error when a release invariant is false. */
function assertValid(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

/** Returns whether a repository root is an installed Obsidian plugin directory. */
function isObsidianPluginInstallPath(rootPath) {
  const pluginsDirectory = path.dirname(rootPath);
  const obsidianDirectory = path.dirname(pluginsDirectory);
  return path.basename(pluginsDirectory) === "plugins"
    && path.basename(obsidianDirectory) === ".obsidian";
}

/** Validates manifest fields and synchronized release metadata. */
function validateManifest() {
  const manifest = readJson("manifest.json");
  const packageMetadata = readJson("package.json");
  const versions = readJson("versions.json");
  const requiredFields = ["id", "name", "version", "minAppVersion", "description", "author", "isDesktopOnly"];

  for (const field of requiredFields) {
    assertValid(field in manifest, `manifest.json is missing required field: ${field}`);
  }

  assertValid(typeof manifest.id === "string" && /^[a-z0-9-]+$/.test(manifest.id), "manifest.json has an invalid id");
  assertValid(!manifest.id.includes("obsidian") && !manifest.id.endsWith("plugin"), "manifest.json id must stay short and must not contain obsidian or end with plugin");
  if (isObsidianPluginInstallPath(repositoryRoot)) {
    assertValid(path.basename(repositoryRoot) === manifest.id, "installed plugin directory must match manifest.json id");
  }
  assertValid(typeof manifest.name === "string" && manifest.name.length > 0, "manifest.json name must not be empty");
  assertValid(!/obsidian|plugin/i.test(manifest.name), "manifest.json name must not contain Obsidian or Plugin");
  assertValid(typeof manifest.version === "string" && /^\d+\.\d+\.\d+$/.test(manifest.version), "manifest.json version must use x.y.z format");
  assertValid(typeof manifest.minAppVersion === "string" && /^\d+\.\d+\.\d+$/.test(manifest.minAppVersion), "manifest.json minAppVersion must use x.y.z format");
  assertValid(typeof manifest.description === "string" && manifest.description.length <= 250, "manifest.json description must contain at most 250 characters");
  assertValid(/[.?!)]$/.test(manifest.description), "manifest.json description must end with punctuation");
  assertValid(!/obsidian/i.test(manifest.description), "manifest.json description must not contain Obsidian");
  assertValid(typeof manifest.isDesktopOnly === "boolean", "manifest.json isDesktopOnly must be boolean");
  assertValid(packageMetadata.name === manifest.id, "package.json name must match manifest.json id");
  assertValid(packageMetadata.version === manifest.version, "package.json version must match manifest.json");
  assertValid(versions[manifest.version] === manifest.minAppVersion, "versions.json must map the current version to minAppVersion");

  if (process.env.RELEASE_TAG !== undefined) {
    assertValid(process.env.RELEASE_TAG === manifest.version, "release tag must match manifest.json version");
  }
}

validateManifest();
console.log("manifest.json is valid");
