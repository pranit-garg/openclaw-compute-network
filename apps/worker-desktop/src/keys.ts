import nacl from "tweetnacl";
import fs from "node:fs";
import path from "node:path";

interface KeyPair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
  pubkeyHex: string;
}

const KEY_PATH = process.env.WORKER_KEY_PATH ?? "./data/worker-key.json";

/** Load existing keypair or generate a new one and persist it. */
export function loadOrCreateKeypair(): KeyPair {
  const keyFile = path.resolve(KEY_PATH);
  const dir = path.dirname(keyFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(keyFile)) {
    const data = JSON.parse(fs.readFileSync(keyFile, "utf-8"));
    const secretKey = Uint8Array.from(data.secretKey);
    const publicKey = Uint8Array.from(data.publicKey);
    return {
      publicKey,
      secretKey,
      pubkeyHex: Buffer.from(publicKey).toString("hex"),
    };
  }

  const pair = nacl.sign.keyPair();
  fs.writeFileSync(
    keyFile,
    JSON.stringify({
      publicKey: Array.from(pair.publicKey),
      secretKey: Array.from(pair.secretKey),
    })
  );

  return {
    publicKey: pair.publicKey,
    secretKey: pair.secretKey,
    pubkeyHex: Buffer.from(pair.publicKey).toString("hex"),
  };
}
