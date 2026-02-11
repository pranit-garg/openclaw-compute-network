import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export async function handler(): Promise<void> {
  const pkg = require("../../package.json") as { version: string };
  const protocolPkg = require("@dispatch/protocol/package.json") as { version: string };
  process.stdout.write(`dispatch v${pkg.version} (protocol v${protocolPkg.version})\n`);
}
