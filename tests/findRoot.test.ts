import assert from "assert";
import { join, resolve } from "path";
import { posixResolve } from "./posixResolve";
import { createCache, findRoot } from "../index";

assert.deepEqual(findRoot(join("."), { stopDir: "bla" }), null);

assert.deepEqual(
  findRoot(join("fixtures", "bolt", "packages", "a"), {
    stopDir: join("fixtures", "bolt", "packages"),
  }),
  null
);

assert.equal(findRoot(), null);

assert.deepEqual(findRoot(join("fixtures", "bolt")), {
  location: posixResolve("fixtures", "bolt"),
  globs: ["packages/*"],
});

assert.deepEqual(findRoot(join("fixtures", "lerna")), {
  location: posixResolve("fixtures", "lerna"),
  globs: ["packages/*"],
});

assert.equal(findRoot(join("fixtures", "lerna-with-invalid-packages")), null);

assert.deepEqual(findRoot(join("fixtures", "lerna-with-defaults")), {
  location: posixResolve("fixtures", "lerna-with-defaults"),
  globs: ["packages/*"],
});

assert.equal(findRoot(join("fixtures", "lerna-with-invalid-workspaces")), null);

assert.deepEqual(findRoot(join("fixtures", "yarn-npm")), {
  location: posixResolve("fixtures", "yarn-npm"),
  globs: ["packages/*"],
});

assert.deepEqual(findRoot(join("fixtures", "yarn-npm-with-packages")), {
  location: posixResolve("fixtures", "yarn-npm-with-packages"),
  globs: ["packages/*"],
});

assert.deepEqual(findRoot(join("fixtures", "yarn-npm", "packages", "a", "b")), {
  location: posixResolve("fixtures", "yarn-npm"),
  globs: ["packages/*"],
});

assert.deepEqual(findRoot(posixResolve("fixtures", "yarn-npm")), {
  location: posixResolve("fixtures", "yarn-npm"),
  globs: ["packages/*"],
});

const cache = createCache();
const options = { cache, stopDir: "." };

assert.deepEqual(findRoot(join("fixtures", "bolt"), options), {
  location: posixResolve("fixtures", "bolt"),
  globs: ["packages/*"],
});

assert.deepEqual(findRoot(join("fixtures", "bolt"), options), {
  location: posixResolve("fixtures", "bolt"),
  globs: ["packages/*"],
});

assert.equal(
  findRoot(join("fixtures", "lerna-with-invalid-packages"), options),
  null
);

assert.equal(
  findRoot(join("fixtures", "lerna-with-invalid-packages"), options),
  null
);

assert.deepEqual(cache.root, {
  [resolve("fixtures", "bolt")]: {
    location: posixResolve("fixtures", "bolt"),
    globs: ["packages/*"],
  },
  [resolve("fixtures")]: null,
  [resolve("fixtures", "lerna-with-invalid-packages")]: null,
});

assert.deepEqual(cache.workspaces, {});

cache.clear();

assert.deepEqual(cache.root, {});
assert.deepEqual(cache.workspaces, {});
