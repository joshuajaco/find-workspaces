import assert from "assert";
import { join, resolve } from "path";
import { posixResolve } from "./posixResolve";
import { createWorkspacesCache, findWorkspacesRoot } from "../index";

assert.deepStrictEqual(findWorkspacesRoot(join("."), { stopDir: "bla" }), null);

assert.deepStrictEqual(
  findWorkspacesRoot(join("fixtures", "bolt", "packages", "a"), {
    stopDir: join("fixtures", "bolt", "packages"),
  }),
  null
);

assert.strictEqual(findWorkspacesRoot(), null);

assert.deepStrictEqual(findWorkspacesRoot(join("fixtures", "bolt")), {
  location: posixResolve("fixtures", "bolt"),
  globs: ["packages/*"],
});

assert.deepStrictEqual(findWorkspacesRoot(join("fixtures", "lerna")), {
  location: posixResolve("fixtures", "lerna"),
  globs: ["packages/*"],
});

assert.strictEqual(
  findWorkspacesRoot(join("fixtures", "lerna-with-invalid-packages")),
  null
);

assert.deepStrictEqual(
  findWorkspacesRoot(join("fixtures", "lerna-with-defaults")),
  {
    location: posixResolve("fixtures", "lerna-with-defaults"),
    globs: ["packages/*"],
  }
);

assert.strictEqual(
  findWorkspacesRoot(join("fixtures", "lerna-with-invalid-workspaces")),
  null
);

assert.deepStrictEqual(findWorkspacesRoot(join("fixtures", "yarn-npm")), {
  location: posixResolve("fixtures", "yarn-npm"),
  globs: ["packages/*"],
});

assert.deepStrictEqual(
  findWorkspacesRoot(join("fixtures", "yarn-npm-with-packages")),
  {
    location: posixResolve("fixtures", "yarn-npm-with-packages"),
    globs: ["packages/*"],
  }
);

assert.deepStrictEqual(
  findWorkspacesRoot(join("fixtures", "yarn-npm", "packages", "a", "b")),
  {
    location: posixResolve("fixtures", "yarn-npm"),
    globs: ["packages/*"],
  }
);

assert.deepStrictEqual(
  findWorkspacesRoot(posixResolve("fixtures", "yarn-npm")),
  {
    location: posixResolve("fixtures", "yarn-npm"),
    globs: ["packages/*"],
  }
);

const cache = createWorkspacesCache();
const options = { cache, stopDir: "." };

assert.deepStrictEqual(findWorkspacesRoot(join("fixtures", "bolt"), options), {
  location: posixResolve("fixtures", "bolt"),
  globs: ["packages/*"],
});

assert.deepStrictEqual(findWorkspacesRoot(join("fixtures", "bolt"), options), {
  location: posixResolve("fixtures", "bolt"),
  globs: ["packages/*"],
});

assert.strictEqual(
  findWorkspacesRoot(join("fixtures", "lerna-with-invalid-packages"), options),
  null
);

assert.strictEqual(
  findWorkspacesRoot(join("fixtures", "lerna-with-invalid-packages"), options),
  null
);

assert.deepStrictEqual(cache.root, {
  [resolve("fixtures", "bolt")]: {
    location: posixResolve("fixtures", "bolt"),
    globs: ["packages/*"],
  },
  [resolve("fixtures")]: null,
  [resolve("fixtures", "lerna-with-invalid-packages")]: null,
});

assert.deepStrictEqual(cache.workspaces, {});

cache.clear();

assert.deepStrictEqual(cache.root, {});
assert.deepStrictEqual(cache.workspaces, {});
