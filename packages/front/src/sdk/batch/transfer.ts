/* eslint-disable no-param-reassign */
import {
  getDelta,
  getSolutionBatch,
  getSolutionOuts,
} from './solutions';
import { deriveBabyJubKeysFromEth } from '../keys';
import { computeTreeValues } from '../proof/tree-values';
import { getPoseidonTokenHash } from '../util';

export const getTransferSolutionBatch = async ({
  treeBalance,
  senderWallet,
  totalRequired,
  receiverPubkey,
  selectedToken,
  excludedUTXOIDPositions = [],
}: any) => {
  if (receiverPubkey) {
    receiverPubkey = BigInt(receiverPubkey);
  }

  const derivedKeys = deriveBabyJubKeysFromEth(senderWallet);

  const token = getPoseidonTokenHash(selectedToken);

  const utxosIn = await getSolutionBatch({
    treeBalance: {
      ...treeBalance,
      token,
    },
    totalRequired,
    excludedUTXOIDPositions,
    pubkey: derivedKeys.pubkey,
  });

  const utxosOut = await getSolutionOuts({
    utxosIn,
    treeBalance: {
      ...treeBalance,
      token,
    },
    selectedToken,
    totalRequired,
    receiverPubkey,
    senderPubkey: derivedKeys.pubkey,
  });

  const delta = await getDelta({ utxosOut, utxosIn });

  const { roots, newIns } = await computeTreeValues(utxosIn);

  return {
    delta,
    roots,
    token,
    utxosOut,
    utxosIn: newIns,
  };
};
