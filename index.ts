import { resolve, join, posix, sep } from "path";
import os from "os";
import globby from "globby";

export type WorkspacesRoot = { location: string; globs: string[] };
export type Workspace = { location: string; package: any };

type Cache = {
  root: { [dir: string]: WorkspacesRoot | null | undefined };
  workspaces: { [dir: string]: Workspace[] | undefined };
  clear: () => void;
};

export function createCache(): Cache {
  return {
    root: {},
    workspaces: {},
    clear() {
      this.root = {};
      this.workspaces = {};
    },
  };
}

type Options = { stopDir?: string; cache?: Cache };

export function findRoot(dirname?: string, options: Options = {}) {
  const dir = dirname ? resolve(dirname) : process.cwd();
  const stopDir = options.stopDir ? resolve(options.stopDir) : os.homedir();
  const cache = options.cache ?? createCache();
  return findWorkspacesRoot(dir, stopDir, cache);
}

export function findWorkspaces(
  dirname?: string,
  options: Options = {}
): Workspace[] | null {
  const cache = options.cache ?? createCache();

  const root = findRoot(dirname, { ...options, cache });

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
    .filter((v): v is Workspace => !!v.package);

  cache.workspaces[root.location] = workspaces;

  return workspaces;
}

function findWorkspacesRoot(
  dir: string,
  stopDir: string,
  cache: Cache,
  dirs: string[] = [dir]
): WorkspacesRoot | null {
  const cached = cache.root[dir];

  const save = (value: WorkspacesRoot | null) => {
    dirs.forEach((d) => (cache.root[d] = value));
    return value;
  };

  if (cached === null) return save(null);

  if (cached) return save(cached);

  const globs = findWorkspaceGlobs(dir);

  if (globs) return save({ location: dir.split(sep).join(posix.sep), globs });

  const next = resolve(dir, "..");

  if (next === stopDir) return save(null);
  if (next === dir) return save(null);

  return findWorkspacesRoot(next, stopDir, cache, [next, ...dirs]);
}

function findWorkspaceGlobs(dir: string): string[] | null {
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
