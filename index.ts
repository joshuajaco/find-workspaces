import { resolve } from "path";
import globby from "globby";

export type WorkspacesRoot = { location: string; globs: string[] };
export type Workspace = { location: string; package: any };

type Cache = {
  root: { [dir: string]: WorkspacesRoot | null | undefined };
  workspaces: { [dir: string]: Workspace[] | undefined };
};

const cache: Cache = { root: {}, workspaces: {} };

export function findRoot(dirname?: string) {
  const dir = dirname ? resolve(dirname) : process.cwd();
  return findWorkspacesRoot(dir);
}

findRoot.clearCache = () => {
  cache.root = {};
};

export function findWorkspaces(dirname?: string): Workspace[] | null {
  const root = findRoot(dirname);

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
    .map((location) => {
      const resolved = resolve(location);
      return {
        location: resolved,
        package: resolveJSONFile(resolved, "package.json"),
      };
    })
    .filter((v): v is Workspace => !!v.package);

  cache.workspaces[root.location] = workspaces;

  return workspaces;
}

findWorkspaces.clearCache = () => {
  findRoot.clearCache();
  cache.workspaces = {};
};

function findWorkspacesRoot(
  dir: string,
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

  if (globs) return save({ location: dir, globs });

  const next = resolve(dir, "..");

  if (next === dir) return save(null);

  return findWorkspacesRoot(next, [next, ...dirs]);
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
  const filePath = resolve(dir, file);
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
