# Circuits


## Setup

To compile the circuits locally for test run:
    
```bash
yarn run circuits circuit:setup
```

Provide sample entropy when prompted in the terminal.
This is an unsafe setup used to test the circuit in local instances.

To run unit tests:
```bash
yarn run circuits circuit:tests
```

## Circuit Logic

### UTXOs and the Merkle Tree
The protocol is built around an UTXO model. Each UTXO is composed of the following variables:

```JSON
{
    "token": "reference to the token type that the UTXO represents",
    "amount": "amount of tokens in the UTXO",
    "pubkey": "public key of the wallet of the owner of this UTXO",
    "blinding": "randomly generated value"
}
```

The structure of the UTXOs can be found in the `circuits/utxo.circom` file.

UTXOs are stored inside a merkle tree structure. The merkle tree is composed of 2^depth leafs, each leaf is a hash of an UTXO. The merkle tree is implemented in the `circuits/lib/merkleproofposeidon.circom` file.

The merkle tree is used to store the state of the application. The root hash of the merkle tree is stored in the application smart contract and each leaf (UTXO hash) is stored as an event when it is created. The merkle tree is updated every time a user deposits or withdraws funds.

### Nullifiers
Whenever new funds are deposited to the smart contract, new UTXOs are created in the merkle tree. However, when said UTXOs are spent we cannot simply remove them from the tree - that would allow an attacker to infer the original owner of the UTXO and break the anonymity of the protocol.

We need a way to invalidate already used UTXOs without identifying them - this is achieved through nullifiers.

Nullifiers are deterministic values that are generated for each UTXO. They are generated using the Poseidon hash of the UTXO's data and the user's private key. This means that the nullifier is unique for each UTXO and each user.
```
nullifier = poseidon(poseidon(utxo), privkey)
```

Nullifiers are public parameters in the ZK circuit. When proofs are submitted to the contract, nullifiers are stored in the application smart contract and are used to prevent double spends of UTXOs.

### Transactions
Each transaction in the circuit is composed of a list of inputs and a list of outputs. Each input is a reference to a UTXO that is being spent and each output is a new UTXO that is being created.

The transaction is deemed valid as long as:
- All inputs being consumed belong to the user submitting the proof (checked through privkey)
- The sum of the inputs is equal to the sum of the outputs (plus value being deposited or minus value being withdrawn - referred to as `delta`)

Other business requirements are not checked in the circuit, but rather in the application smart contract. These include:
- Nullifiers of the inputs being spent are not already in the contract's state
- Delta value provided in the circuit is equal to value being deposited or withdrawn from Smart Contract
- `message_hash` provided in the circuit is equal to the hash of the message signed by the user when calling the contract - guarantees front runners are not tampering with the transaction

### Anti Money Laundry policy
The AML framework is enforced through the `subtree_root` and `subtree_mp_sibling`.

The subtree is an indexed Merkle Tree. It essentially mimics the UTXO merkle tree but only accepts 2 values: `accept` and `deny` (those values can be any random integer). The `subtree_root` is the root hash of the subtree and the `subtree_mp_sibling` is the list of siblings of the leaf being used in the proof.

AML providers are responsible for evaluating all deposits to the protocol and flagging any UTXOs that are deemed malicious. By default, all leafs in the subtree start out with the `accept` value. If an UTXO deposited to the contract is deemed to be malicious, its value must be changed to `deny` in the AML provider's state.
To build a proof, the user must provide a list of all UTXOs being spent in the transaction. The circuit then checks that all UTXOs being spent are not flagged as `deny` in the AML provider's state, according to the merkle root and path provided. This allow a proof that no malicious UTXO is being used in the transaction, following the AML provider's analysis.