import { buildPoseidonReference, buildBabyjub } from "circomlibjs";
import { fs_random, subgroupDecompress, get_pubkey } from "./utils.js";

import assert from "assert";

const babyJub = await buildBabyjub();
const poseidon = await buildPoseidonReference();

export function encrypt_message(message, pubkey, iv) {
  assert(message.length == 3);
  const ephemeral_secret = fs_random();
  const ephemeral_public = get_pubkey(ephemeral_secret);

  pubkey = subgroupDecompress(pubkey);
  pubkey = [babyJub.F.e(pubkey[0]), babyJub.F.e(pubkey[1])];

  const edh = babyJub.mulPointEscalar(pubkey, ephemeral_secret)[0];

  return [
    ephemeral_public,
    ...message.map((e, i) => {
      return e + poseidon.F.toObject(poseidon([edh, iv + BigInt(i)]));
    }),
  ];
}

export function decrypt_message(encrypted_message, secret, iv) {
  assert(encrypted_message.length == 4);
  const ephemeral_public = encrypted_message[0];
  let pubkey = subgroupDecompress(ephemeral_public);
  pubkey = [babyJub.F.e(pubkey[0]), babyJub.F.e(pubkey[1])];

  const edh = babyJub.mulPointEscalar(pubkey, secret)[0];
  const decrypted_message = encrypted_message
    .slice(1)
    .map((e, i) => e - poseidon.F.toObject(poseidon([edh, iv + BigInt(i)])));
  return decrypted_message;
}