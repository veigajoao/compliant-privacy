import path from "path";
import wasmTester from "circom_tester/wasm/tester.js";
import {
  utxo,
  utxo_random,
  utxo_hash,
  transfer_compute,
  PROOF_LENGTH,
} from "../src/inputs.js";
import {
  randrange,
  fr_random,
  proof,
  verifySync,
  u160_random,
  fs_random,
  get_pubkey,
} from "../src/utils.js";
import { MerkleTree } from "../src/merkletree.js";
import { dirname } from "path";
import { fileURLToPath } from "url";
import assert from "assert";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EXPECTED_VALUE =
  11954255677048767585730959529592939615262310191150853775895456173962480955685n;

describe("Transaction test", function () {
  this.timeout(400000);
  const pick2 = (a, b) => {
    const t1 = randrange(a, b);
    const t2 = randrange(a, b - 1);
    return [t1, t1 <= t2 ? t2 + 1 : t2];
  };

  it("Should create a transaction circuit and compute witness", async () => {
    const secret = fs_random();
    const pubkey = get_pubkey(secret);
    const token = u160_random();
    const mt = new MerkleTree(PROOF_LENGTH + 1);
    const smt = new MerkleTree(PROOF_LENGTH + 1);

    const sz = randrange(50, 100);
    const utxos = Array(sz)
      .fill(0n)
      .map((_) => utxo_random({ pubkey, token }));
    const utxo_hashes = utxos.map((e) => utxo_hash(e));
    mt.pushMany(utxo_hashes);

    const sparseTreeComitments = Array(sz).fill(0n);

    const root = mt.root;
    const utxo_in = pick2(0, sz).map((i) => {
      let u = utxos[i];
      u.mp_sibling = mt.proof(i);
      u.mp_path = i;
      sparseTreeComitments[i] = EXPECTED_VALUE;
      return u;
    });
    smt.pushMany(sparseTreeComitments);

    const input_amount = utxo_in.reduce((a, b) => a + b.amount, 0n);

    const utxo_out = [utxo(token, input_amount, pubkey, fr_random())];

    const delta = u160_random();
    const message_hash = fr_random();

    const { inputs } = transfer_compute(
      smt,
      root,
      utxo_in,
      utxo_out,
      token,
      delta,
      message_hash,
      secret
    );

    const circuit = await wasmTester(
      path.join(__dirname, "../circuits", "transaction.circom")
    );
  });

  it("Should create a transaction circuit and verify", async () => {
    const secret = fs_random();
    const pubkey = get_pubkey(secret);
    const token = u160_random();
    const mt = new MerkleTree(PROOF_LENGTH + 1);
    const smt = new MerkleTree(PROOF_LENGTH + 1);

    const sz = randrange(50, 100);
    const utxos = Array(sz)
      .fill(0n)
      .map((_) => utxo_random({ pubkey, token }));
    const utxo_hashes = utxos.map((e) => utxo_hash(e));
    mt.pushMany(utxo_hashes);

    const sparseTreeComitments = Array(sz).fill(0n);

    const root = mt.root;
    const utxo_in = pick2(0, sz).map((i) => {
      let u = utxos[i];
      u.mp_sibling = mt.proof(i);
      u.mp_path = i;
      sparseTreeComitments[i] = EXPECTED_VALUE;
      return u;
    });
    smt.pushMany(sparseTreeComitments);

    const input_amount = utxo_in.reduce((a, b) => a + b.amount, 0n);
    const utxo_out = [utxo(token, input_amount, pubkey, fr_random())];
    const delta = u160_random();
    const message_hash = fr_random();
    const { inputs } = transfer_compute(
      smt,
      root,
      utxo_in,
      utxo_out,
      token,
      delta,
      message_hash,
      secret
    );
    const pi = await proof(
      inputs,
      "./out/transaction_js/transaction.wasm",
      "./out/transaction_0001.zkey"
    );

    assert(await verifySync(pi, "./out/verification_key.json"));

    // attempt with full sparse Merkle Tree
    const smt2 = new MerkleTree(PROOF_LENGTH + 1);
    const sparseTreeComitments2 = Array(sz).fill(EXPECTED_VALUE);
    smt2.pushMany(sparseTreeComitments2);
    const { inputs: inputs2 } = transfer_compute(
      smt,
      root,
      utxo_in,
      utxo_out,
      token,
      delta,
      message_hash,
      secret
    );
    const pi2 = await proof(
      inputs2,
      "./out/transaction_js/transaction.wasm",
      "./out/transaction_0001.zkey"
    );

    assert(
      await verifySync(pi, "./out/verification_key.json"),
      "Verifier should return true"
    );
  });

  it("Transaction should fail if sparseMerkleTree does not cover all elements", async () => {
    const secret = fs_random();
    const pubkey = get_pubkey(secret);
    const token = u160_random();
    const mt = new MerkleTree(PROOF_LENGTH + 1);
    const smt = new MerkleTree(PROOF_LENGTH + 1);

    const sz = randrange(50, 100);
    const utxos = Array(sz)
      .fill(0n)
      .map((_) => utxo_random({ pubkey, token }));
    const utxo_hashes = utxos.map((e) => utxo_hash(e));
    mt.pushMany(utxo_hashes);

    const sparseTreeComitments = Array(sz).fill(0n);

    const root = mt.root;
    const utxo_in = pick2(0, sz).map((i) => {
      let u = utxos[i];
      u.mp_sibling = mt.proof(i);
      u.mp_path = i;
      sparseTreeComitments[i + 1] = EXPECTED_VALUE;
      return u;
    });
    smt.pushMany(sparseTreeComitments);

    const input_amount = utxo_in.reduce((a, b) => a + b.amount, 0n);
    const utxo_out = [utxo(token, input_amount, pubkey, fr_random())];
    const delta = u160_random();
    const message_hash = fr_random();

    const { inputs } = transfer_compute(
      smt,
      root,
      utxo_in,
      utxo_out,
      token,
      delta,
      message_hash,
      secret
    );
    let failed = false;
    try {
      const pi = await proof(
        inputs,
        "./out/transaction_js/transaction.wasm",
        "./out/transaction_0001.zkey"
      );
    } catch (_) {
      failed = true;
    }

    assert(failed, "Proof generation should fail");
  });
});
