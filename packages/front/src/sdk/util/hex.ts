export const combineHex = ({
  derivedKeys,
  encryptionPubkey,
}: {
  derivedKeys: any;
  encryptionPubkey: string;
}): string => {
  const {
    pubkey
  } = derivedKeys

  const encryptionPubkeyBigInt = BigInt(encryptionPubkey)

  const combined = (encryptionPubkeyBigInt << 256n) | pubkey;

  return `0x${combined.toString(16)}`
}

export const separateHex = (combined: string) => {
  const combinedBigInt = BigInt(combined);

  const encryptionPubkeyBigInt = combinedBigInt >> 256n;
  const babyjubPubkeyBigInt = combinedBigInt & ((1n << 256n) - 1n);

  const babyjubPubkey = `0x${babyjubPubkeyBigInt.toString(16)}`;
  const encryptionPubkey = `0x${encryptionPubkeyBigInt.toString(16)}`;

  return { encryptionPubkey, babyjubPubkey };
}
