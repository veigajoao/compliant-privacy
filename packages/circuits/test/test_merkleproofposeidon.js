import { assert } from "chai";
import path from "path";
import snarkjs_0_1_20 from "../node_modules/snarkjs_0_1_20/index.js";
import crypto from "crypto";
import buildBabyjub from "../node_modules/circomlibjs/src/babyjub.js";
import { buildPoseidonReference } from "circomlibjs";
import wasmTester from "circom_tester/wasm/tester.js";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { bigInt } = snarkjs_0_1_20;
const babyJub = await buildBabyjub();
const poseidon = await buildPoseidonReference();

const randrange = function (from, to) {
  if (from == to) return from;
  if (from > to) [from, to] = [to, from];
  const interval = to - from;
  let t = 0;
  while (interval > bigInt.one.shl(t)) t++;
  return from + (bigInt.leBuff2int(crypto.randomBytes(t)) % interval);
};

describe("Merkle proof circuit test", function () {
  this.timeout(200000);

  it("Should create and test a merkle proof circuit", async () => {
    const n = 10;
    const leaf = randrange(0n, babyJub.p);
    const _path = Array(n)
      .fill(0)
      .map((x) => (Math.random() < 0.5 ? 1n : 0n));
    const sibling = Array(n);
    let root = leaf;
    for (let i = 0; i < n; i++) {
      sibling[i] = randrange(0n, babyJub.p);
      root =
        _path[i] == 0n
          ? poseidon.F.toObject(poseidon([root, sibling[i]]))
          : poseidon.F.toObject(poseidon([sibling[i], root]));
    }

    const circuit = await wasmTester(
      path.join(__dirname, "circuits", "test_merkleproofposeidon.circom")
    );

    const witness = await circuit.calculateWitness({
      sibling,
      path: _path,
      leaf,
    });

    assert(witness[1].equals(root));
  });

  it("Should validate poseidon hash", async () => {
    const poseidonHash1 = poseidon.F.toObject(poseidon([1]));
    const poseidonHash2 = poseidon.F.toObject(poseidon([1, 2]));
    const poseidonHash3 = poseidon.F.toObject(poseidon([1, 2, 3]));
    const poseidonHash4 = poseidon.F.toObject(poseidon([1, 2, 3, 4]));
    const poseidonHash5 = poseidon.F.toObject(poseidon([1, 2, 3, 4, 5]));
    const poseidonHash6 = poseidon.F.toObject(poseidon([1, 2, 3, 4, 5, 6]));
    const poseidonHash7 = poseidon.F.toObject(poseidon([1, 2, 3, 4, 5, 6, 7]));
    const poseidonHash8 = poseidon.F.toObject(poseidon([1, 2, 3, 4, 5, 6, 7, 8]));

    assert(poseidonHash1 == 18586133768512220936620570745912940619677854269274689475585506675881198879027n);
    assert(poseidonHash2 == 7853200120776062878684798364095072458815029376092732009249414926327459813530n);
    assert(poseidonHash3 == 6542985608222806190361240322586112750744169038454362455181422643027100751666n);
    assert(poseidonHash4 == 18821383157269793795438455681495246036402687001665670618754263018637548127333n);
    assert(poseidonHash5 == 6183221330272524995739186171720101788151706631170188140075976616310159254464n);
    assert(poseidonHash6 == 20400040500897583745843009878988256314335038853985262692600694741116813247201n);
    assert(poseidonHash7 == 12748163991115452309045839028154629052133952896122405799815156419278439301912n);
    assert(poseidonHash8 == 18604317144381847857886385684060986177838410221561136253933256952257712543953n);
  });
});