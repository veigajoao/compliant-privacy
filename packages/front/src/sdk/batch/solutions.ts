import { formatInteger, isValidNullifierCount } from '../util';
import { getUtxo } from '../utxo';

const base =
  21888242871839275222246405745257275088548364400416034343698204186575808495617n;

const getUTXOIDPosition = ({ txid, position }: any): string => {
  return `${txid as string}-${position as string}`;
};

export const filterZeroUTXOs = (utxos: any[]): any[] => {
  return utxos.filter((utxo) => utxo.amount !== 0n);
};

export const calculateTotalSpend = (utxos: any[]): bigint => {
  return utxos.reduce(
    (left, right) => (left as bigint) + BigInt(right.amount),
    BigInt(0),
  );
};

export const getDelta = async ({ utxosIn, utxosOut }: any) => {
  const totalIn = calculateTotalSpend(utxosIn);

  const totalOut = calculateTotalSpend(utxosOut);

  const rawAmount = totalOut - totalIn;

  return rawAmount < 0n ? base + rawAmount : rawAmount;
};

export const getSolutionOuts = async ({
  utxosIn,
  treeBalance,
  senderPubkey,
  totalRequired,
  selectedToken,
  receiverPubkey,
  isDeposit = false,
}: any): Promise<any> => {
  if (typeof totalRequired !== 'bigint') {
    totalRequired = BigInt(formatInteger(totalRequired, 12));
  }

  const totalSpend = calculateTotalSpend(utxosIn);

  const amount = isDeposit ? totalRequired : totalSpend - totalRequired;

  return [
    await getUtxo({
      amount,
      pubkey: senderPubkey,
      token: treeBalance.token,
      address: selectedToken,
    }),
    receiverPubkey
      ? await getUtxo({
          amount: totalRequired,
          pubkey: receiverPubkey,
          address: selectedToken,
          token: selectedToken,
        })
      : await getUtxo({
          pubkey: senderPubkey,
          address: selectedToken,
          token: treeBalance.token,
        }),
  ];
};

const sortUTXOsByAscendingValue = (utxos: any[]): void => {
  utxos.sort((left, right) => {
    const leftNum = left.amount;

    const rightNum = right.amount;

    if (leftNum < rightNum) {
      return -1;
    }

    if (leftNum > rightNum) {
      return 1;
    }

    return 0;
  });
};

export const findSubsetsWithSum = (arr: any, target: bigint): any => {
  const result: any = [];
  const max = 1 << arr.length;

  for (let i = 1; i < max; i++) {
    let sum = 0n;
    const subset = [];

    for (let j = 0; j < arr.length; j++) {
      if (i & (1 << j)) {
        sum += BigInt(arr[j].amount);
        subset.push(arr[j]);
      }
    }

    if (sum >= target) {
      result.push(subset);
    }
  }

  return result;
};

export const getSolutionBatchForNFT = async ({ pubkey, treeBalance }: any) => {
  const nft = treeBalance.utxos.find(
    (utxo: any) => utxo.token === treeBalance.token,
  );

  if (!nft) {
    throw new Error('No NFT found');
  }

  return [
    nft,
    getUtxo({ token: treeBalance.token, pubkey }),
    getUtxo({ token: treeBalance.token, pubkey }),
  ];
};

export const getSolutionBatch = async ({
  pubkey,
  treeBalance,
  totalRequired,
  excludedUTXOIDPositions = [],
}: any): Promise<any> => {
  if (typeof totalRequired !== 'bigint') {
    totalRequired = BigInt(formatInteger(totalRequired, 12));
  }

  const removedZeroUTXOs = filterZeroUTXOs(treeBalance.utxos);

  const filteredUTXOs = removedZeroUTXOs.filter(
    (utxo) => !excludedUTXOIDPositions.includes(getUTXOIDPosition(utxo)),
  );

  if (!filteredUTXOs.length) {
    return undefined;
  }

  // Use exact match if it exists.
  // TODO: Use exact matches from any tree, not just the first tree examined.
  const exactMatch = filteredUTXOs.find(
    (utxo) => BigInt(utxo.amount) >= totalRequired,
  );

  if (exactMatch) {
    return [
      exactMatch,
      getUtxo({ token: treeBalance.token, pubkey }),
      getUtxo({ token: treeBalance.token, pubkey }),
    ];
  }

  // Sort UTXOs by smallest size
  sortUTXOsByAscendingValue(filteredUTXOs);

  // TODO: CHECK IF HAS SUM OF UTXOS BY CIRCUIT
  return findSubsetsWithSum(removedZeroUTXOs, totalRequired).find(
    (batch: any) => isValidNullifierCount(batch.length),
  );
};
