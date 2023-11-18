import { resolve, join, posix, sep } from "path";
import { homedir } from "os";
import { readFileSync } from "fs";
import { sync as glob } from "fast-glob";
import type { PackageJson } from "pkg-types";
import { parse as parseYAML } from "yaml";

export type WorkspacesRoot = { location: string; globs: string[] };
export type Workspace = {
  location: string;
  package: PackageJson & { name: string };
};

type Cache = {
  root: Map<string, WorkspacesRoot | null>;
  workspaces: Map<string, Workspace[]>;
  clear: () => void;
};

export function createWorkspacesCache(): Cache {
  return {
    root: new Map(),
    workspaces: new Map(),
    clear() {
      this.root.clear();
      this.workspaces.clear();
    },
  };
}

type Options = { stopDir?: string; cache?: Cache };

export function findWorkspacesRoot(dirname?: string, options: Options = {}) {
  const dir = dirname ? resolve(dirname) : process.cwd();
  const stopDir = options.stopDir ? resolve(options.stopDir) : homedir();
  const cache = options.cache;

  if (cache) {
    for (const [key, value] of cache.root.entries()) {
      if (dir.startsWith(key + sep)) return value;
    }
  }

  return findRoot(dir, stopDir, cache);
}

export function findWorkspaces(
  dirname?: string,
  options: Options = {},
): Workspace[] | null {
  const root = findWorkspacesRoot(dirname, options);

  if (!root) return null;

  const cached = options.cache?.workspaces.get(root.location);

  if (cached) return cached;

  const workspaces = glob(root.globs, {
    cwd: root.location,
    onlyDirectories: true,
    absolute: true,
    ignore: ["**/node_modules/**"],
  })
    .map((location) => ({
      location,
      package: resolveJSONFile(location, "package.json"),
    }))
    .filter(
      (v): v is Workspace =>
        isObject(v.package) && typeof v.package.name === "string",
    );

  options.cache?.workspaces.set(root.location, workspaces);

  return workspaces;
}

function findRoot(
  dir: string,
  stopDir: string,
  cache?: Cache,
): WorkspacesRoot | null {
  function memo(value: WorkspacesRoot | null) {
    cache?.root.set(dir, value);
    return value;
  }

  const globs = findGlobs(dir);

  if (globs) return memo({ location: dir.split(sep).join(posix.sep), globs });

  const next = resolve(dir, "..");

  if (next === stopDir || next === dir) return memo(null);

  return findRoot(next, stopDir, cache);
}

function findGlobs(dir: string): string[] | null {
  const lernaGlobs = resolveLernaGlobs(dir);
  if (lernaGlobs) return lernaGlobs;

  const pnpmGlobs = resolvePnpmGlobs(dir);
  if (pnpmGlobs) return pnpmGlobs;

  return resolvePackageJsonGlobs(dir);
}

function resolveLernaGlobs(dir: string): string[] | null {
  const lernaJson = resolveJSONFile(dir, "lerna.json");
  if (lernaJson === undefined) return null;

  if (isObject(lernaJson)) {
    if (lernaJson.useWorkspaces === true) return null;
    if (!lernaJson.packages) return ["packages/*"];
    if (isStringArray(lernaJson.packages)) return lernaJson.packages;
    return null;
  }

  return ["packages/*"];
}

function resolvePnpmGlobs(dir: string): string[] | null {
  const pnpmWorkspaceYaml = resolveYAMLFile(dir, "pnpm-workspace.yaml");
  if (pnpmWorkspaceYaml === undefined) return null;

  if (
    isObject(pnpmWorkspaceYaml) &&
    isStringArray(pnpmWorkspaceYaml.packages)
  ) {
    return pnpmWorkspaceYaml.packages;
  }

  return ["**"];
}

function resolvePackageJsonGlobs(dir: string): string[] | null {
  const packageJson = resolveJSONFile(dir, "package.json");
  if (packageJson === undefined) return null;

  if (isObject(packageJson)) {
    if (isStringArray(packageJson.workspaces)) return packageJson.workspaces;

    if (
      isObject(packageJson.workspaces) &&
      isStringArray(packageJson.workspaces.packages)
    ) {
      return packageJson.workspaces.packages;
    }

    if (
      isObject(packageJson.bolt) &&
      isStringArray(packageJson.bolt.workspaces)
    ) {
      return packageJson.bolt.workspaces;
    }
  }

  return null;
}

type JSONValue =
  | string
  | number
  | boolean
  | null
  | Array<JSONValue>
  | JSONObject;

type JSONObject = { [key: string]: JSONValue | undefined };

function resolveJSONFile(dir: string, file: string): JSONValue | undefined {
  const filePath = join(dir, file);
  try {
    return JSON.parse(readFileSync(filePath).toString());
  } catch {
    return undefined;
  }
}

function resolveYAMLFile(dir: string, file: string): JSONValue | undefined {
  const filePath = join(dir, file);
  try {
    return parseYAML(readFileSync(filePath).toString());
  } catch {
    return undefined;
  }
}

function isObject(value?: JSONValue): value is JSONObject {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isStringArray(value?: JSONValue): value is string[] {
  if (!Array.isArray(value)) return false;
  return value.every((item) => typeof item === "string");
}
