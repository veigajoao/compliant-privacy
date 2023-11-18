/* eslint-disable */
// @ts-ignore
import { poseidon } from 'circomlibjs'
import { TXO } from './types/utxo.type';
import { toHex } from 'ethereum-cryptography/utils';
import { getRandomBytesSync } from 'ethereum-cryptography/random';

export const utxoHash = ({ token, amount, pubkey, blinding }: TXO) => outUtxoInputs({ token, amount, pubkey, blinding })

export const ownerCommit = ({ pubkey, blinding }: any) => poseidon([pubkey, blinding]);

export const outUtxoInputs = ({ token, amount, pubkey, blinding }: any) => poseidon([token, amount, ownerCommit({pubkey, blinding})]);

export const inUtxoInputs = ({ token, amount, blinding }: any) => [token, amount, blinding];

export const getNullifier = ({ utxo, secret }: any) => poseidon([secret, utxoHash(utxo)])

export const objUtxoInputs = ({ token, amount, pubkey, blinding }: any) => ({
  token,
  amount,
  owner_commit: ownerCommit({ pubkey, blinding }),
})

export const outUtxoInputsNoHashed = ({ blinding, token, amount, pubkey }: any) => {
  const owner = ownerCommit({
    blinding,
    pubkey,
  })

  return [BigInt(token), BigInt(amount), BigInt(owner)]
}

export const getUtxo = ({
  token,
  pubkey,
  id = "0",
  amount = 0n,
  address = 'coin',
}: any): any => {
  const blinding = BigInt(`0x${toHex(getRandomBytesSync(32))}`)

  const core =  {
    token,
    amount,
    blinding,
    pubkey: BigInt(pubkey),
  }

  const hash = utxoHash(core as any)

  return {
    id,
    hash,
    address: address.name || address,
    ...core
  };
};
