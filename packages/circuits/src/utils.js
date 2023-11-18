import { groth16 } from "snarkjs";
import snarkjs_0_1_20 from "snarkjs_0_1_20";
import { unstringifyBigInts, bigInt } from "snarkjs_0_1_20";
import { buildBabyjub } from "circomlibjs";
import crypto from "crypto";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const babyJub = await buildBabyjub();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function randrange(from, to) {
  if (from == to) return from;
  if (from > to) [from, to] = [to, from];
  const interval = to - from;
  if (typeof from === "number")
    return from + Math.floor(Math.random() * interval);
  let t = 0;
  while (interval > bigInt.one.shl(t * 8)) t++;
  return from + (bigInt.leBuff2int(crypto.randomBytes(t)) % interval);
}

const fload = (f) => unstringifyBigInts(JSON.parse(fs.readFileSync(f)));

export async function proof(input, wasmPath, zkeyPath) {
  const { proof, publicSignals } = await groth16.fullProve(
    input,
    wasmPath,
    zkeyPath
  );

  return { proof, publicSignals };
}

export async function verifySync({ proof, publicSignals }, vkFileName) {
  const vk = fload(vkFileName);
  return await groth16.verify(vk, publicSignals, proof);
}

export function get_pubkey(pk) {
  let pubkey = babyJub.mulPointEscalar(babyJub.Base8, pk)[0];
  return babyJub.F.toObject(pubkey);
}

export function subgroupDecompress(x) {
  x = bigInt(x);

  const p = babyJub.p;

  const x2 = x.mul(x, p);
  const A = babyJub.F.toObject(babyJub.A);
  const D = babyJub.F.toObject(babyJub.D);

  const t = A.mul(x2)
    .sub(bigInt.one)
    .mul(D.mul(x2).sub(bigInt.one).inverse(p))
    .affine(p);
  const y = snarkjs_0_1_20.bn128.Fr.sqrt(t);

  if (babyJub.inSubgroup([babyJub.F.e(x), babyJub.F.e(y)])) return [x, y];

  if (babyJub.inSubgroup([babyJub.F.e(x), babyJub.F.e(-y)])) return [x, -y];

  throw "Not a compressed point at subgroup";
}

export function fr_random() {
  return randrange(0n, snarkjs_0_1_20.bn128.r);
}

export function fs_random() {
  return randrange(0n, babyJub.subOrder);
}

export function u160_random() {
  return randrange(0n, 1n << 160n);
}
