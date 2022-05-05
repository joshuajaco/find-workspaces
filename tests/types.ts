import { expectType, TypeEqual } from "ts-expect";
import { createWorkspacesCache, findWorkspaces, Workspace } from "../index";

expectType<Workspace | undefined>(findWorkspaces()?.at(0));

expectType<Workspace<{ foo: "bar" }> | undefined>(
  findWorkspaces<{ foo: "bar" }>()?.at(0)
);

expectType<
  TypeEqual<
    ReturnType<typeof createWorkspacesCache>["workspaces"][string],
    Workspace[] | undefined
  >
>(true);

const cache = createWorkspacesCache<{ foo: "bar" }>();

expectType<
  TypeEqual<
    typeof cache.workspaces[string],
    Workspace<{ foo: "bar" }>[] | undefined
  >
>(true);
