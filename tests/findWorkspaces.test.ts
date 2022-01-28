import assert from "assert";
import { join } from "path";
import { posixResolve } from "./posixResolve";
import { findWorkspaces } from "../index";

assert.equal(findWorkspaces(), null);

assert.deepEqual(findWorkspaces(join("fixtures", "bolt")), [
  {
    location: posixResolve("fixtures", "bolt", "packages", "a"),
    package: { name: "@bolt/a", private: true },
  },
  {
    location: posixResolve("fixtures", "bolt", "packages", "b"),
    package: { name: "@bolt/b", private: true },
  },
]);

assert.deepEqual(findWorkspaces(join("fixtures", "lerna")), [
  {
    location: posixResolve("fixtures", "lerna", "packages", "a"),
    package: { name: "@lerna/a", private: true },
  },
  {
    location: posixResolve("fixtures", "lerna", "packages", "b"),
    package: { name: "@lerna/b", private: true },
  },
]);

assert.equal(
  findWorkspaces(join("fixtures", "lerna-with-invalid-packages")),
  null
);

assert.deepEqual(findWorkspaces(join("fixtures", "lerna-with-defaults")), [
  {
    location: posixResolve("fixtures", "lerna-with-defaults", "packages", "a"),
    package: { name: "@lerna-with-defaults/a", private: true },
  },
  {
    location: posixResolve("fixtures", "lerna-with-defaults", "packages", "b"),
    package: { name: "@lerna-with-defaults/b", private: true },
  },
]);

assert.equal(
  findWorkspaces(join("fixtures", "lerna-with-invalid-workspaces")),
  null
);

assert.deepEqual(findWorkspaces(join("fixtures", "yarn-npm")), [
  {
    location: posixResolve("fixtures", "yarn-npm", "packages", "a"),
    package: { name: "@yarn-npm/a", private: true },
  },
  {
    location: posixResolve("fixtures", "yarn-npm", "packages", "b"),
    package: { name: "@yarn-npm/b", private: true },
  },
]);

assert.deepEqual(findWorkspaces(join("fixtures", "yarn-npm-with-packages")), [
  {
    location: posixResolve(
      "fixtures",
      "yarn-npm-with-packages",
      "packages",
      "a"
    ),
    package: { name: "@yarn-npm-with-packages/a", private: true },
  },
  {
    location: posixResolve(
      "fixtures",
      "yarn-npm-with-packages",
      "packages",
      "b"
    ),
    package: { name: "@yarn-npm-with-packages/b", private: true },
  },
]);

assert.deepEqual(
  findWorkspaces(join("fixtures", "yarn-npm", "packages", "a", "b")),
  [
    {
      location: posixResolve("fixtures", "yarn-npm", "packages", "a"),
      package: { name: "@yarn-npm/a", private: true },
    },
    {
      location: posixResolve("fixtures", "yarn-npm", "packages", "b"),
      package: { name: "@yarn-npm/b", private: true },
    },
  ]
);

assert.deepEqual(findWorkspaces(posixResolve("fixtures", "yarn-npm")), [
  {
    location: posixResolve("fixtures", "yarn-npm", "packages", "a"),
    package: { name: "@yarn-npm/a", private: true },
  },
  {
    location: posixResolve("fixtures", "yarn-npm", "packages", "b"),
    package: { name: "@yarn-npm/b", private: true },
  },
]);
