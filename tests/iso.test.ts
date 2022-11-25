import assert from "assert";
import { findWorkspaces } from "../index";
import { join } from "path";
import { posixResolve } from "./posixResolve";

assert.deepStrictEqual(findWorkspaces(join("fixtures", "pnpm-with-defaults")), [
  {
    location: posixResolve("fixtures", "pnpm-with-defaults", "components", "a"),
    package: { name: "@pnpm/component-a", private: true },
  },
  {
    location: posixResolve("fixtures", "pnpm-with-defaults", "components", "b"),
    package: { name: "@pnpm/component-b", private: true },
  },
  {
    location: posixResolve("fixtures", "pnpm-with-defaults", "packages", "a"),
    package: { name: "@pnpm/a", private: true },
  },
  {
    location: posixResolve("fixtures", "pnpm-with-defaults", "packages", "b"),
    package: { name: "@pnpm/b", private: true },
  },
]);
