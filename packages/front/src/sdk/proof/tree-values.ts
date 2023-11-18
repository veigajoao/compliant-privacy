/* eslint-disable no-negated-condition */
/* eslint-disable @typescript-eslint/naming-convention */
import { MerkleTree, MerkleTreeService } from '../merkletree';

const PROOF_LENGTH = 32;

/**
 * SUBTREE
 */
const EXPECTED_VALUE =
  11954255677048767585730959529592939615262310191150853775895456173962480955685n;

export const computeTreeValues = async (utxosIn: any, isDeposit = false) => {
  const { tree, branches } = await new MerkleTreeService().initMerkleTree([
    0, 0, 0,
  ]);

  /**
   * SUBTREE
   */
  const subtree = await MerkleTree.build(PROOF_LENGTH + 1);

  /**
   * SUBTREE
   */
  let sparseTreeComitments = Array(12).fill(0n);

  let newIns = utxosIn.map((utxo: any, i: any) => {
    const base = {
      hash: BigInt(utxo.hash),
      token: BigInt(utxo.token),
      amount: BigInt(utxo.amount),
      blinding: BigInt(utxo.blinding),
      pubkey: BigInt(utxo.pubkey),
    };

    if (utxo.amount === 0n || isDeposit) {
      return {
        ...base,
        mp_path: i,
        mp_sibling: tree.path(i).pathElements,
      };
    }

    const index = tree.indexOf(BigInt(utxo.hash) as any);

    sparseTreeComitments[index] = EXPECTED_VALUE;

    return {
      ...base,
      mp_path: index,
      mp_sibling: tree.proof(BigInt(utxo.hash) as any).pathElements,
    };
  });

  /**
   * SUBTREE
   */
  sparseTreeComitments = [...sparseTreeComitments].map((value: any) =>
    !value ? 0n : value,
  );

  /**
   * SUBTREE
   */
  subtree.pushMany(sparseTreeComitments);

  newIns = newIns.map((utxo: any, i: any) => {
    const { order } =
      branches.find(({ value }: any) => BigInt(value) === utxo.hash) || {};

    if (order && !isDeposit) {
      return {
        ...utxo,
        smp_path: subtree.proof(order - 1),
      };
    }

    return {
      ...utxo,
      smp_path: subtree.proof(i),
    };
  });

  return {
    newIns,
    roots: {
      tree: tree.root,
      subtree: subtree.root,
    },
  };
};
