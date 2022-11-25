import { resolve, join, posix, sep } from "path";
import os from "os";
import globby from "globby";
import { PackageJson } from "type-fest";

export type WorkspacesRoot = { location: string; globs: string[] };
export type Workspace = { location: string; package: PackageJson };

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
  const cache = options.cache ?? createWorkspacesCache();
  return findRoot(dir, stopDir, cache);
}

export function findWorkspaces(
  dirname?: string,
  options: Options = {}
): Workspace[] | null {
  const cache = options.cache ?? createWorkspacesCache();

  const root = findWorkspacesRoot(dirname, { ...options, cache });

  if (!root) return null;

  const cached = cache.workspaces.get(root.location);

  if (cached) return cached;

  const workspaces = globby
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
    .filter((v): v is Workspace => !!v.package);

  cache.workspaces.set(root.location, workspaces);

  return workspaces;
}

function findRoot(
  dir: string,
  stopDir: string,
  cache: Cache,
  dirs: string[] = [dir]
): WorkspacesRoot | null {
  const cached = cache.root.get(dir);

  const save = (value: WorkspacesRoot | null) => {
    dirs.forEach((d) => cache.root.set(d, value));
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

  const lernaJson = resolveJSONFile(dir, "lerna.json");

  if (lernaJson) {
    if (lernaJson.useWorkspaces === true) return null;
    if (!lernaJson.packages) return ["packages/*"];
    if (isStringArray(lernaJson.packages)) return lernaJson.packages;
  }

  return null;
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
