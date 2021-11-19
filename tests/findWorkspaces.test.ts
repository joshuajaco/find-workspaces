import assert from "assert";
import { resolve, join } from "path";
import { findRoot, findWorkspaces } from "../index";

assert.equal(findWorkspaces(), null);

assert.deepEqual(findWorkspaces(join("fixtures", "bolt")), [
  {
    location: resolve("fixtures", "bolt", "packages", "a"),
    package: { name: "@bolt/a", private: true },
  },
  {
    location: resolve("fixtures", "bolt", "packages", "b"),
    package: { name: "@bolt/b", private: true },
  },
]);

assert.deepEqual(findWorkspaces(join("fixtures", "lerna")), [
  {
    location: resolve("fixtures", "lerna", "packages", "a"),
    package: { name: "@lerna/a", private: true },
  },
  {
    location: resolve("fixtures", "lerna", "packages", "b"),
    package: { name: "@lerna/b", private: true },
  },
]);

assert.equal(
  findWorkspaces(join("fixtures", "lerna-with-invalid-packages")),
  null
);

assert.deepEqual(findWorkspaces(join("fixtures", "lerna-with-defaults")), [
  {
    location: resolve("fixtures", "lerna-with-defaults", "packages", "a"),
    package: { name: "@lerna-with-defaults/a", private: true },
  },
  {
    location: resolve("fixtures", "lerna-with-defaults", "packages", "b"),
    package: { name: "@lerna-with-defaults/b", private: true },
  },
]);

assert.equal(
  findWorkspaces(join("fixtures", "lerna-with-invalid-workspaces")),
  null
);

assert.deepEqual(findWorkspaces(join("fixtures", "yarn-npm")), [
  {
    location: resolve("fixtures", "yarn-npm", "packages", "a"),
    package: { name: "@yarn-npm/a", private: true },
  },
  {
    location: resolve("fixtures", "yarn-npm", "packages", "b"),
    package: { name: "@yarn-npm/b", private: true },
  },
]);

assert.deepEqual(findWorkspaces(join("fixtures", "yarn-npm-with-packages")), [
  {
    location: resolve("fixtures", "yarn-npm-with-packages", "packages", "a"),
    package: { name: "@yarn-npm-with-packages/a", private: true },
  },
  {
    location: resolve("fixtures", "yarn-npm-with-packages", "packages", "b"),
    package: { name: "@yarn-npm-with-packages/b", private: true },
  },
]);

assert.deepEqual(
  findWorkspaces(join("fixtures", "yarn-npm", "packages", "a", "b")),
  [
    {
      location: resolve("fixtures", "yarn-npm", "packages", "a"),
      package: { name: "@yarn-npm/a", private: true },
    },
    {
      location: resolve("fixtures", "yarn-npm", "packages", "b"),
      package: { name: "@yarn-npm/b", private: true },
    },
  ]
);

assert.deepEqual(findWorkspaces(resolve("fixtures", "yarn-npm")), [
  {
    location: resolve("fixtures", "yarn-npm", "packages", "a"),
    package: { name: "@yarn-npm/a", private: true },
  },
  {
    location: resolve("fixtures", "yarn-npm", "packages", "b"),
    package: { name: "@yarn-npm/b", private: true },
  },
]);
