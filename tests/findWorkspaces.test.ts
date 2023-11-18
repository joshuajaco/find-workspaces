import assert from "assert";
import { join, resolve } from "path";
import { posixResolve } from "./posixResolve";
import { createWorkspacesCache, findWorkspaces } from "../index";

assert.strictEqual(findWorkspaces(), null);

assert.deepStrictEqual(findWorkspaces(join("fixtures", "bolt")), [
  {
    location: posixResolve("fixtures", "bolt", "packages", "a"),
    package: { name: "@bolt/a", private: true },
  },
  {
    location: posixResolve("fixtures", "bolt", "packages", "b"),
    package: { name: "@bolt/b", private: true },
  },
]);

assert.deepStrictEqual(
  findWorkspaces(join("fixtures", "lerna-with-packages")),
  [
    {
      location: posixResolve(
        "fixtures",
        "lerna-with-packages",
        "packages",
        "a",
      ),
      package: { name: "@lerna-with-packages/a", private: true },
    },
    {
      location: posixResolve(
        "fixtures",
        "lerna-with-packages",
        "packages",
        "b",
      ),
      package: { name: "@lerna-with-packages/b", private: true },
    },
  ],
);

assert.strictEqual(
  findWorkspaces(join("fixtures", "lerna-with-invalid-packages")),
  null,
);

assert.deepStrictEqual(findWorkspaces(join("fixtures", "lerna")), [
  {
    location: posixResolve("fixtures", "lerna", "packages", "a"),
    package: { name: "@lerna/a", private: true },
  },
  {
    location: posixResolve("fixtures", "lerna", "packages", "b"),
    package: { name: "@lerna/b", private: true },
  },
]);

assert.strictEqual(
  findWorkspaces(join("fixtures", "lerna-with-invalid-workspaces")),
  null,
);

assert.deepStrictEqual(
  findWorkspaces(join("fixtures", "lerna-with-invalid-lerna-json")),
  null,
);

assert.strictEqual(
  findWorkspaces(join("fixtures", "yarn-npm-with-invalid-package-json")),
  null,
);

assert.strictEqual(
  findWorkspaces(join("fixtures", "yarn-npm-with-invalid-workspaces")),
  null,
);

assert.deepStrictEqual(findWorkspaces(join("fixtures", "pnpm")), [
  {
    location: posixResolve("fixtures", "pnpm", "packages", "a"),
    package: { name: "@pnpm/a", private: true },
  },
  {
    location: posixResolve("fixtures", "pnpm", "packages", "b"),
    package: { name: "@pnpm/b", private: true },
  },
  {
    location: posixResolve("fixtures", "pnpm", "components", "a"),
    package: { name: "@pnpm/component-a", private: true },
  },
  {
    location: posixResolve("fixtures", "pnpm", "components", "b"),
    package: { name: "@pnpm/component-b", private: true },
  },
  {
    location: posixResolve(
      "fixtures",
      "pnpm",
      "components",
      "nested",
      "component",
    ),
    package: { name: "@pnpm/nested-component", private: true },
  },
]);
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

assert.deepStrictEqual(findWorkspaces(join("fixtures", "yarn-npm")), [
  {
    location: posixResolve("fixtures", "yarn-npm", "packages", "a"),
    package: { name: "@yarn-npm/a", private: true },
  },
  {
    location: posixResolve("fixtures", "yarn-npm", "packages", "b"),
    package: { name: "@yarn-npm/b", private: true },
  },
]);

assert.deepStrictEqual(
  findWorkspaces(join("fixtures", "yarn-npm-with-packages")),
  [
    {
      location: posixResolve(
        "fixtures",
        "yarn-npm-with-packages",
        "packages",
        "a",
      ),
      package: { name: "@yarn-npm-with-packages/a", private: true },
    },
    {
      location: posixResolve(
        "fixtures",
        "yarn-npm-with-packages",
        "packages",
        "b",
      ),
      package: { name: "@yarn-npm-with-packages/b", private: true },
    },
  ],
);

assert.deepStrictEqual(
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
  ],
);

assert.deepStrictEqual(findWorkspaces(posixResolve("fixtures", "yarn-npm")), [
  {
    location: posixResolve("fixtures", "yarn-npm", "packages", "a"),
    package: { name: "@yarn-npm/a", private: true },
  },
  {
    location: posixResolve("fixtures", "yarn-npm", "packages", "b"),
    package: { name: "@yarn-npm/b", private: true },
  },
]);

const cache = createWorkspacesCache();

assert.deepStrictEqual(
  findWorkspaces(posixResolve("fixtures", "lerna-with-packages", "foo"), {
    cache,
  }),
  [
    {
      location: posixResolve(
        "fixtures",
        "lerna-with-packages",
        "packages",
        "a",
      ),
      package: { name: "@lerna-with-packages/a", private: true },
    },
    {
      location: posixResolve(
        "fixtures",
        "lerna-with-packages",
        "packages",
        "b",
      ),
      package: { name: "@lerna-with-packages/b", private: true },
    },
  ],
);

assert.deepStrictEqual(
  findWorkspaces(posixResolve("fixtures", "lerna-with-packages", "bar"), {
    cache,
  }),
  [
    {
      location: posixResolve(
        "fixtures",
        "lerna-with-packages",
        "packages",
        "a",
      ),
      package: { name: "@lerna-with-packages/a", private: true },
    },
    {
      location: posixResolve(
        "fixtures",
        "lerna-with-packages",
        "packages",
        "b",
      ),
      package: { name: "@lerna-with-packages/b", private: true },
    },
  ],
);

assert.deepStrictEqual(
  findWorkspaces(posixResolve("fixtures", "lerna"), { cache }),
  [
    {
      location: posixResolve("fixtures", "lerna", "packages", "a"),
      package: { name: "@lerna/a", private: true },
    },
    {
      location: posixResolve("fixtures", "lerna", "packages", "b"),
      package: { name: "@lerna/b", private: true },
    },
  ],
);

assert.deepStrictEqual(
  cache.root,
  new Map([
    [
      resolve("fixtures", "lerna-with-packages"),
      {
        globs: ["packages/*"],
        location: posixResolve("fixtures", "lerna-with-packages"),
      },
    ],
    [
      resolve("fixtures", "lerna"),
      {
        globs: ["packages/*"],
        location: posixResolve("fixtures", "lerna"),
      },
    ],
  ]),
);

assert.deepStrictEqual(
  cache.workspaces,
  new Map([
    [
      posixResolve("fixtures", "lerna-with-packages"),
      [
        {
          location: posixResolve(
            "fixtures",
            "lerna-with-packages",
            "packages",
            "a",
          ),
          package: { name: "@lerna-with-packages/a", private: true },
        },
        {
          location: posixResolve(
            "fixtures",
            "lerna-with-packages",
            "packages",
            "b",
          ),
          package: { name: "@lerna-with-packages/b", private: true },
        },
      ],
    ],
    [
      posixResolve("fixtures", "lerna"),
      [
        {
          location: posixResolve("fixtures", "lerna", "packages", "a"),
          package: { name: "@lerna/a", private: true },
        },
        {
          location: posixResolve("fixtures", "lerna", "packages", "b"),
          package: { name: "@lerna/b", private: true },
        },
      ],
    ],
  ]),
);

cache.clear();

assert.deepStrictEqual(cache.root, new Map());
assert.deepStrictEqual(cache.workspaces, new Map());
