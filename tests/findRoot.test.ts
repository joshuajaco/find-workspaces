import assert from "node:assert";
import { describe, it } from "node:test";
import { resolve } from "node:path";
import { posixResolve } from "./posixResolve";
import { createWorkspacesCache, findWorkspacesRoot } from "../src";

describe("findWorkspacesRoot", () => {
  it("returns root for yarn/npm", () => {
    assert.deepStrictEqual(findWorkspacesRoot("fixtures/yarn-npm/foo/bar"), {
      location: posixResolve("fixtures/yarn-npm"),
      globs: ["packages/*"],
    });
  });

  it("returns root for yarn/npm with packages", () => {
    assert.deepStrictEqual(
      findWorkspacesRoot("fixtures/yarn-npm-with-packages"),
      {
        location: posixResolve("fixtures/yarn-npm-with-packages"),
        globs: ["packages/*"],
      },
    );
  });

  it("returns root for lerna", () => {
    assert.deepStrictEqual(findWorkspacesRoot("fixtures/lerna"), {
      location: posixResolve("fixtures/lerna"),
      globs: ["packages/*"],
    });
  });

  it("returns root for lerna with packages", () => {
    assert.deepStrictEqual(findWorkspacesRoot("fixtures/lerna-with-packages"), {
      location: posixResolve("fixtures/lerna-with-packages"),
      globs: ["packages/*"],
    });
  });

  it("returns root for bolt", () => {
    assert.deepStrictEqual(findWorkspacesRoot("fixtures/bolt"), {
      location: posixResolve("fixtures/bolt"),
      globs: ["packages/**/*"],
    });
  });

  it("returns null for lerna with invalid packages", () => {
    assert.strictEqual(
      findWorkspacesRoot("fixtures/lerna-with-invalid-packages"),
      null,
    );
  });

  it("returns null for lerna with invalid workspaces", () => {
    assert.strictEqual(
      findWorkspacesRoot("fixtures/lerna-with-invalid-workspaces"),
      null,
    );
  });

  it("stops searching at stop dir", () => {
    assert.deepStrictEqual(
      findWorkspacesRoot("fixtures/bolt/packages/a", {
        stopDir: "fixtures/bolt/packages",
      }),
      null,
    );
  });

  it("fills cache", () => {
    const cache = createWorkspacesCache();
    const options = { cache, stopDir: "." };

    assert.deepStrictEqual(findWorkspacesRoot("fixtures/bolt", options), {
      location: posixResolve("fixtures/bolt"),
      globs: ["packages/**/*"],
    });

    assert.deepStrictEqual(findWorkspacesRoot("fixtures/bolt", options), {
      location: posixResolve("fixtures/bolt"),
      globs: ["packages/**/*"],
    });

    assert.strictEqual(
      findWorkspacesRoot("fixtures/lerna-with-invalid-packages", options),
      null,
    );

    assert.strictEqual(
      findWorkspacesRoot("fixtures/lerna-with-invalid-packages", options),
      null,
    );

    assert.deepStrictEqual(
      cache.root,
      new Map([
        [
          resolve("fixtures/bolt"),
          {
            location: posixResolve("fixtures/bolt"),
            globs: ["packages/**/*"],
          },
        ],
        [resolve("fixtures"), null],
      ]),
    );

    assert.deepStrictEqual(cache.workspaces, new Map());

    cache.clear();

    assert.deepStrictEqual(cache.root, new Map());
    assert.deepStrictEqual(cache.workspaces, new Map());
  });

  it("returns root from cache", () => {
    const cache = createWorkspacesCache();
    const options = { cache, stopDir: "." };

    const root = {
      location: posixResolve("fixtures/bolt"),
      globs: ["packages/**/*"],
    };

    cache.root.set(resolve("fixtures/bolt"), root);

    assert.strictEqual(findWorkspacesRoot("fixtures/bolt/foo", options), root);
    assert.strictEqual(findWorkspacesRoot("fixtures/bolt", options), root);
  });
});
