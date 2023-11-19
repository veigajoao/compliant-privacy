import assert from "assert";
import path from "path";
import wasmTester from "circom_tester/wasm/tester.js";
import { obj_utxo_inputs, utxo_hash, utxo_random } from "../src/inputs.js";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("UTXO hasing circuit test", function () {
  this.timeout(200000);
  it("Should create a utxo hashing circuit", async () => {
    const circuit = await wasmTester(
      path.join(__dirname, "circuits", "test_utxo.circom")
    );
    const inputs = utxo_random();
    const witness = await circuit.calculateWitness(obj_utxo_inputs(inputs));

    assert(witness[1] === utxo_hash(inputs));
  });
});
