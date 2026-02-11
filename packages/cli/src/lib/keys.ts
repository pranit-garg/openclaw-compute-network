import fs from "node:fs";
import path from "node:path";
import nacl from "tweetnacl";

export interface StoredKeypair {
  publicKey: number[];
  secretKey: number[];
}

export interface Keypair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
  pubkeyHex: string;
}

function toKeypair(stored: StoredKeypair): Keypair {
  const publicKey = Uint8Array.from(stored.publicKey);
  const secretKey = Uint8Array.from(stored.secretKey);
  return {
    publicKey,
    secretKey,
    pubkeyHex: Buffer.from(publicKey).toString("hex"),
  };
}

export function generateKeypair(): Keypair {
  const pair = nacl.sign.keyPair();
  return {
    publicKey: pair.publicKey,
    secretKey: pair.secretKey,
    pubkeyHex: Buffer.from(pair.publicKey).toString("hex"),
  };
}

export function saveKeypair(keyPath: string, keypair: Keypair): void {
  const filePath = path.resolve(keyPath);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const data: StoredKeypair = {
    publicKey: Array.from(keypair.publicKey),
    secretKey: Array.from(keypair.secretKey),
  };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export function loadKeypair(keyPath: string): Keypair {
  const filePath = path.resolve(keyPath);
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw) as StoredKeypair;
  return toKeypair(parsed);
}

export function loadOrCreateKeypair(keyPath: string): Keypair {
  const filePath = path.resolve(keyPath);
  if (fs.existsSync(filePath)) {
    return loadKeypair(filePath);
  }

  const generated = generateKeypair();
  saveKeypair(filePath, generated);
  return generated;
}
