/* eslint-disable */
// @ts-nocheck
import { poseidon } from "circomlibjs";

const maxheight = 256;

const calculateMerkleDefault = async () => {
  const merkleDefaults = Array(maxheight);

  merkleDefaults[0] = 0n;

  for (let i = 1; i < maxheight; i++) {
    (async () => {
      merkleDefaults[i] = poseidon([merkleDefaults[i - 1], merkleDefaults[i - 1]])
    })()
  }

  return {
    merkleDefaults,
  }
}

export class MerkleTree {
  public poseidon
  public merkleDefaults

  constructor(height: any, merkleDefaults: any) {
    // assert(height <= maxheight, `height should be less or equal ${maxheight}`);
    this.merkleDefaults = merkleDefaults
    this.height = height;
    this._merkleState = Array(this.height)
      .fill(0)
      .map(() => []);
    this.length = 0;
  }

  static async build(height: any) {
    const { merkleDefaults } = await calculateMerkleDefault()

    return new MerkleTree(height, merkleDefaults)
  }

  _cell(row: any, index: any) {
    return index < this._merkleState[row].length
      ? this._merkleState[row][index]
      : this.merkleDefaults[row];
  }

  _setcell(row: any, index: any, value: any) {
    if (index >= this._merkleState[row].length)
      this._merkleState[row].push(
        ...Array(index - this._merkleState[row].length + 1).fill(
          this.merkleDefaults[row]
        )
      );
    this._merkleState[row][index] = value;
  }

  _pushcells(row: any, index: any, values: any) {
    // assert(
    //   index >= this._merkleState[row].length,
    //   "should be not overwriting mode"
    // );
    if (index > this._merkleState[row].length)
      this._merkleState[row].push(
        ...Array(index - this._merkleState[row].length).fill(
          this.merkleDefaults[row]
        )
      );
    this._merkleState[row].push(...values);
  }

  proof(index: any) {
    return Array(this.height - 1)
      .fill(0)
      .map((e, i) => this._cell(i, (index >>> i) ^ 1));
  }
  get root() {
    return this._cell(this.height - 1, 0);
  }

  pushMany(elements: any) {
    const index = this.length;
    const s = elements.length;
    // assert(index + s <= 2 ** (this.height - 1), "too many elements");

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
          poseidon([this._cell(i - 1, j * 2), this._cell(i - 1, j * 2 + 1)])
        );
      }
    }
    this.length += s;
  }

  static updateProof(sibling: any, index: any, elements: any) {
    index = BigInt(index);
    let proofsz = BigInt(sibling.length);
    let elementssz = BigInt(elements.length);
    let index2 = index + elementssz;
    let maxproofsz = this.merkleDefaults.length;
    // assert(proofsz <= maxproofsz, "too many long proof");
    // assert(index2 < 1n << BigInt(proofsz), "too many elements");
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
        buff.push(this.merkleDefaults[0]);
        buffsz++;
      }

      let sibling2_i = offset + (index2 ^ 1n) - index;
      sibling2.push(
        sibling2_i >= buffsz ? this.merkleDefaults[0] : buff[sibling2_i]
      );

      for (let i = 1n; i < proofsz; i++) {
        offset = (index >> i) & 1n;
        for (let j = 0n; j < buffsz >> 1n; j++) {
          buff[offset + j] = poseidon([buff[j * 2n], buff[j * 2n + 1n]])
        }

        if (offset > 0n) {
          buff[0] = sibling[i];
        }

        buffsz = offset + (buffsz >> 1n);
        buffsz_was_odd = (buffsz & 1n) == 1n;
        if (buffsz_was_odd) {
          buff[buffsz] = this.merkleDefaults[i];
          buffsz++;
        }

        sibling2_i = offset + (((index2 >> i) ^ 1n) - (index >> i));
        sibling2.push(
          sibling2_i >= buffsz ? this.merkleDefaults[i] : buff[sibling2_i]
        );
      }
    }

    return sibling2;
  }

  static getRoot(proof: any, index: any, leaf: any) {
    let root = leaf;
    for (let i in proof) {
      root =
        ((index >>> i) & 0x1) == 1
          ? poseidon([proof[i], root])
          : poseidon([root, proof[i]])
    }
    return root;
  }
}
