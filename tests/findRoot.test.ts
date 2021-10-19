import assert from "assert";
import { resolve, join } from "path";
import { findRoot } from "../index";

assert.equal(findRoot(), null);

assert.deepEqual(findRoot(join("fixtures", "bolt")), {
  location: resolve("fixtures", "bolt"),
  globs: ["packages/*"],
});

assert.deepEqual(findRoot(join("fixtures", "lerna")), {
  location: resolve("fixtures", "lerna"),
  globs: ["packages/*"],
});

assert.equal(findRoot(join("fixtures", "lerna-with-invalid-packages")), null);

assert.deepEqual(findRoot(join("fixtures", "lerna-with-defaults")), {
  location: resolve("fixtures", "lerna-with-defaults"),
  globs: ["packages/*"],
});

assert.equal(findRoot(join("fixtures", "lerna-with-invalid-workspaces")), null);

assert.deepEqual(findRoot(join("fixtures", "yarn-npm")), {
  location: resolve("fixtures", "yarn-npm"),
  globs: ["packages/*"],
});

assert.deepEqual(findRoot(join("fixtures", "yarn-npm-with-packages")), {
  location: resolve("fixtures", "yarn-npm-with-packages"),
  globs: ["packages/*"],
});

assert.deepEqual(findRoot(join("fixtures", "yarn-npm", "a", "b", "c")), {
  location: resolve("fixtures", "yarn-npm"),
  globs: ["packages/*"],
});

assert.deepEqual(findRoot(resolve("fixtures", "yarn-npm")), {
  location: resolve("fixtures", "yarn-npm"),
  globs: ["packages/*"],
});
