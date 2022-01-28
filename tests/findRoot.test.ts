import assert from "assert";
import { join } from "path";
import { posixResolve } from "./posixResolve";
import { findRoot } from "../index";

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
