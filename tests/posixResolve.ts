import { posix, resolve, sep } from "path";

export const posixResolve = (...segments: string[]) =>
  resolve(...segments)
    .split(sep)
    .join(posix.sep);
