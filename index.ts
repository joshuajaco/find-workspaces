import { resolve, join, posix, sep } from "path";
import os from "os";
import globby from "globby";

type Primitive = string | number | boolean | null;
type Json = { [key: string]: Primitive | Array<Primitive> | Json };

export type WorkspacesRoot = { location: string; globs: string[] };
export type Workspace<T extends Json = Json> = { location: string; package: T };

type Cache<T extends Json> = {
  root: { [dir: string]: WorkspacesRoot | null | undefined };
  workspaces: { [dir: string]: Workspace<T>[] | undefined };
  clear: () => void;
};

export function createWorkspacesCache<T extends Json>(): Cache<T> {
  return {
    root: {},
    workspaces: {},
    clear() {
      this.root = {};
      this.workspaces = {};
    },
  };
}

type Options<T extends Json> = { stopDir?: string; cache?: Cache<T> };

export function findWorkspacesRoot<T extends Json>(
  dirname?: string,
  options: Options<T> = {}
) {
  const dir = dirname ? resolve(dirname) : process.cwd();
  const stopDir = options.stopDir ? resolve(options.stopDir) : os.homedir();
  const cache = options.cache ?? createWorkspacesCache();
  return findRoot(dir, stopDir, cache);
}

export function findWorkspaces<T extends Json>(
  dirname?: string,
  options: Options<T> = {}
): Workspace<T>[] | null {
  const cache = options.cache ?? createWorkspacesCache<T>();

  const root = findWorkspacesRoot<T>(dirname, { ...options, cache });

  if (!root) return null;

  const cached = cache.workspaces[root.location];

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
    .filter((v): v is Workspace<T> => !!v.package);

  cache.workspaces[root.location] = workspaces;

  return workspaces;
}

function findRoot<T extends Json>(
  dir: string,
  stopDir: string,
  cache: Cache<T>,
  dirs: string[] = [dir]
): WorkspacesRoot | null {
  const cached = cache.root[dir];

  const save = (value: WorkspacesRoot | null) => {
    dirs.forEach((d) => (cache.root[d] = value));
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
