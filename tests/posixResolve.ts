import { posix, resolve, sep } from "node:path";

export const posixResolve = (...segments: string[]) =>
  resolve(...segments)
    .split(sep)
    .join(posix.sep);
