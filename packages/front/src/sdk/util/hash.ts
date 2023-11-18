/* eslint-disable jsdoc/require-jsdoc */
import { poseidon } from 'circomlibjs';

function stringToBigInt(inputString: string): bigint {
  let asciiBigInt = BigInt(0);
  for (let i = 0; i < inputString.length; i++) {
    const asciiValue = BigInt(inputString.charCodeAt(i));
    asciiBigInt = asciiBigInt * BigInt(256) + asciiValue;
  }
  return asciiBigInt;
}

export const getPoseidonMessageHash = (value: any) => {
  return poseidon([value]);
};

export const getPoseidonTokenHash = (value: any) => {
  return poseidon([stringToBigInt(value)]);
};
