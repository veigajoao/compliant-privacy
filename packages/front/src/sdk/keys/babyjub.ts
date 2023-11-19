/* eslint-disable */
import { babyjub } from 'circomlibjs';
import { stripOZK } from '../util';

/**
 * TODO: Refact this function
 */
export function subgroupDecompress(x: bigint | number): [bigint, bigint] {
  x = BigInt(x);

  const p: bigint = babyjub.p;
  const one: bigint = BigInt(1);

  const x2: bigint = (x * x) % p;
  const A: bigint = babyjub.A;
  const D: bigint = babyjub.D;

  // Função auxiliar para calcular o inverso modular usando o Algoritmo Estendido de Euclides
  function modInverse(a: bigint, mod: bigint): bigint {
      const b: bigint = BigInt(mod);

      let [lastRem, rem] = [a, b];

      let [x, lastX]: [bigint, bigint] = [0n, 1n];

      while (rem) {
          let quotient: bigint = lastRem / rem;

          [lastRem, rem] = [rem, lastRem % rem];
          [x, lastX] = [lastX - quotient * x, x];
      }

      return (lastX < 0) ? lastX + mod : lastX;
  }

  const t: bigint = (A * x2 - one) * modInverse(D * x2 - one, p) % p;

  const y: bigint = BigInt(babyjub.F.sqrt(t));

  if (babyjub.inSubgroup([x, y])) {
    return [x, y]
  };

  if (babyjub.inSubgroup([x, babyjub.p - y])) {
    return [x, babyjub.p - y]
  };

  throw new Error("Not a compressed point at subgroup");
}

export const validatePubkey = (pubkey: bigint) => {
  const decompressed = subgroupDecompress(pubkey)

  return babyjub.inCurve(decompressed)
}

export const deriveBabyJubKeysFromEth = (wallet: any) => {
  const adjustedPrivateKey = BigInt(wallet.pvtkey) % babyjub.subOrder;

  const pubkey = babyjub.mulPointEscalar(babyjub.Base8, adjustedPrivateKey)[0];

  if (!validatePubkey(pubkey)) {
    throw new Error('Invalid public key')
  }

  return {
    pubkey,
    pvtkey: adjustedPrivateKey,
  };
}
