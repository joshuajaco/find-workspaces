import { posix, resolve, sep } from "node:path";

export const posixResolve = (path: string) =>
  resolve(path).split(sep).join(posix.sep);
