import { resolve, join, posix, sep } from "path";
import os from "os";
import { readFileSync } from "fs";
import fg from "fast-glob";
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
  const stopDir = options.stopDir ? resolve(options.stopDir) : os.homedir();
  const cache = options.cache;
  return findRoot(dir, stopDir, cache);
}

export function findWorkspaces(
  dirname?: string,
  options: Options = {},
): Workspace[] | null {
  const cache = options.cache;

  const root = findWorkspacesRoot(dirname, { ...options, cache });

  if (!root) return null;

  const cached = cache?.workspaces.get(root.location);

  if (cached) return cached;

  const workspaces = fg
    .sync(root.globs, {
      cwd: root.location,
      onlyDirectories: true,
      absolute: true,
      ignore: ["**/node_modules/**"],
    })
    .map((location) => ({
      location,
      package: resolveJSONFile(location, "package.json"),
    }))
    .filter((v): v is Workspace => !!v.package && !!v.package.name);

  cache?.workspaces.set(root.location, workspaces);

  return workspaces;
}

function findRoot(
  dir: string,
  stopDir: string,
  cache?: Cache,
  dirs: string[] = [dir],
): WorkspacesRoot | null {
  const cached = cache?.root.get(dir);

  const save = (value: WorkspacesRoot | null) => {
    if (cache) dirs.forEach((d) => cache.root.set(d, value));
    return value;
  };

  if (cached === null) return save(null);

  if (cached) return save(cached);

  const globs = findGlobs(dir);

  if (globs) return save({ location: dir.split(sep).join(posix.sep), globs });

  const next = resolve(dir, "..");

  if (next === stopDir) return save(null);
  if (next === dir) return save(null);

  return findRoot(next, stopDir, cache, [next, ...dirs]);
}

function findGlobs(dir: string): string[] | null {
  const packageJsonGlobs = resolvePackageJsonGlobs(dir);
  if (packageJsonGlobs) return packageJsonGlobs;

  const lernaGlobs = resolveLernaGlobs(dir);
  if (lernaGlobs) return lernaGlobs;

  const pnpmGlobs = resolvePnpmGlobs(dir);
  if (pnpmGlobs) return pnpmGlobs;

  return null;
}

function resolvePackageJsonGlobs(dir: string): string[] | null {
  const packageJson = resolveJSONFile(dir, "package.json");

  if (packageJson) {
    if (isStringArray(packageJson.workspaces)) return packageJson.workspaces;

    if (isStringArray(packageJson.workspaces?.packages)) {
      return packageJson.workspaces.packages;
    }

    if (isStringArray(packageJson.bolt?.workspaces)) {
      return packageJson.bolt.workspaces;
    }
  }

  return null;
}

function resolveLernaGlobs(dir: string): string[] | null {
  const lernaJson = resolveJSONFile(dir, "lerna.json");

  if (lernaJson) {
    if (lernaJson.useWorkspaces === true) return null;
    if (!lernaJson.packages) return ["packages/*"];
    if (isStringArray(lernaJson.packages)) return lernaJson.packages;
  }

  return null;
}

function resolvePnpmGlobs(dir: string): string[] | null {
  const filePath = join(dir, "pnpm-workspace.yaml");

  let pnpmWorkspaceYaml;

  try {
    pnpmWorkspaceYaml = parseYAML(readFileSync(filePath).toString());
  } catch {
    return null;
  }

  if (pnpmWorkspaceYaml && isStringArray(pnpmWorkspaceYaml.packages)) {
    return pnpmWorkspaceYaml.packages;
  }

  return ["**"];
}

function resolveJSONFile(dir: string, file: string) {
  const filePath = join(dir, file);
  try {
    return require(filePath);
  } catch {
    return null;
  }
}

function isStringArray(value: unknown): value is string[] {
  if (!Array.isArray(value)) return false;
  return value.every((item) => typeof item === "string");
}
