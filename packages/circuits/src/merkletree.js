import { fr_random } from "./utils.js";
import { buildPoseidonReference } from "circomlibjs";
import assert from "assert";

const poseidon = await buildPoseidonReference();
const maxheight = 256;
const merkleDefaults = Array(maxheight);
merkleDefaults[0] = 0n;

for (let i = 1; i < maxheight; i++) {
  merkleDefaults[i] = poseidon.F.toObject(
    poseidon([merkleDefaults[i - 1], merkleDefaults[i - 1]])
  );
}

export class MerkleTree {
  constructor(height) {
    assert(height <= maxheight, `height should be less or equal ${maxheight}`);
    this.height = height;
    this._merkleState = Array(this.height)
      .fill(0)
      .map(() => []);
    this.length = 0;
  }

  _cell(row, index) {
    return index < this._merkleState[row].length
      ? this._merkleState[row][index]
      : merkleDefaults[row];
  }

  _setcell(row, index, value) {
    if (index >= this._merkleState[row].length)
      this._merkleState[row].push(
        ...Array(index - this._merkleState[row].length + 1).fill(
          merkleDefaults[row]
        )
      );
    this._merkleState[row][index] = value;
  }

  _pushcells(row, index, values) {
    assert(
      index >= this._merkleState[row].length,
      "should be not overwriting mode"
    );
    if (index > this._merkleState[row].length)
      this._merkleState[row].push(
        ...Array(index - this._merkleState[row].length).fill(
          merkleDefaults[row]
        )
      );
    this._merkleState[row].push(...values);
  }

  proof(index) {
    return Array(this.height - 1)
      .fill(0)
      .map((e, i) => this._cell(i, (index >>> i) ^ 1));
  }
  get root() {
    return this._cell(this.height - 1, 0);
  }

  pushMany(elements) {
    const index = this.length;
    const s = elements.length;
    assert(index + s <= 2 ** (this.height - 1), "too many elements");

    this._pushcells(0, index, elements);

    let from = index;
    let to = index + s;
    for (let i = 1; i < this.height; i++) {
      from >>>= 1;
      to >>>= 1;
      for (let j = from; j <= to; j++) {
        this._setcell(
          i,
          j,
          poseidon.F.toObject(
            poseidon([this._cell(i - 1, j * 2), this._cell(i - 1, j * 2 + 1)])
          )
        );
      }
    }
    this.length += s;
  }

  static updateProof(sibling, index, elements) {
    index = BigInt(index);
    let proofsz = BigInt(sibling.length);
    let elementssz = BigInt(elements.length);
    let index2 = index + elementssz;
    let maxproofsz = merkleDefaults.length;
    assert(proofsz <= maxproofsz, "too many long proof");
    assert(index2 < 1n << BigInt(proofsz), "too many elements");
    let sibling2 = [];

    if (elementssz == 0n) {
      for (let i = 0n; i < proofsz; i++) {
        sibling2.push(sibling[i]);
      }
    } else {
      let offset = index & 1n;
      let buffsz = offset + elementssz;
      let buffsz_was_odd = (buffsz & 1n) == 1n;

      let buff = [];

      if (offset > 0n) {
        buff.push(sibling[0]);
      }

      for (let i = 0n; i < elementssz; i++) {
        buff.push(elements[i]);
      }

      if (buffsz_was_odd) {
        buff.push(merkleDefaults[0]);
        buffsz++;
      }

      let sibling2_i = offset + (index2 ^ 1n) - index;
      sibling2.push(
        sibling2_i >= buffsz ? merkleDefaults[0] : buff[sibling2_i]
      );

      for (let i = 1n; i < proofsz; i++) {
        offset = (index >> i) & 1n;
        for (let j = 0n; j < buffsz >> 1n; j++) {
          buff[offset + j] = poseidon.F.toObject(
            poseidon([buff[j * 2n], buff[j * 2n + 1n]])
          );
        }

        if (offset > 0n) {
          buff[0] = sibling[i];
        }

        buffsz = offset + (buffsz >> 1n);
        buffsz_was_odd = (buffsz & 1n) == 1n;
        if (buffsz_was_odd) {
          buff[buffsz] = merkleDefaults[i];
          buffsz++;
        }

        sibling2_i = offset + (((index2 >> i) ^ 1n) - (index >> i));
        sibling2.push(
          sibling2_i >= buffsz ? merkleDefaults[i] : buff[sibling2_i]
        );
      }
    }

    return sibling2;
  }

  static getRoot(proof, index, leaf) {
    let root = leaf;
    for (let i in proof) {
      root =
        ((index >>> i) & 0x1) == 1
          ? poseidon.F.toObject(poseidon([proof[i], root]))
          : poseidon.F.toObject(poseidon([root, proof[i]]));
    }
    return root;
  }

  static genRandomRightProof(length, index) {
    let pi = Array(length).fill(0n);
    for (let i = 0; i < length; i++) {
      pi[i] = (index >>> i) & (0x1 == 1) ? fr_random() : merkleDefaults[i];
    }
    return pi;
  }
}