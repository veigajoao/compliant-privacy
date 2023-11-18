import { fs_random, get_pubkey } from "../src/utils.js";
import { encrypt_message, decrypt_message } from "../src/encryption.js";
import { in_utxo_inputs, utxo_random, utxo_hash, utxo } from "../src/inputs.js";
import assert from "assert";

describe("encryption test", function () {
  this.timeout(200000);
  it("encrypt and decrypt test", async () => {
    // generate keypair for receiver
    const receiver_secret = fs_random();
    const receiver_public = get_pubkey(receiver_secret);

    // generate utxo
    const _utxo = utxo_random({ pubkey: receiver_public });
    const _utxo_data = in_utxo_inputs(_utxo);
    const _utxo_hash = utxo_hash(_utxo); // corresponds to Tx.utxo in smart contract, so it is public data

    // compute encrypted message at sender side
    const encrypted_message = encrypt_message(
      _utxo_data,
      receiver_public,
      _utxo_hash
    );

    // decrypt encrypted message at receiver side
    const decrypted_message = decrypt_message(
      encrypted_message,
      receiver_secret,
      _utxo_hash
    );

    // recover utxo at receiver side
    const _utxo_rec = utxo(
      decrypted_message[0],
      decrypted_message[1],
      receiver_public,
      decrypted_message[2]
    );

    // check, is recover correct
    assert(utxo_hash(_utxo_rec) == _utxo_hash, "checksum should be correct");
  });
});
