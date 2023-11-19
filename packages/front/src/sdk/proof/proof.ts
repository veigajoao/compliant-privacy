import { getNullifier, inUtxoInputs, outUtxoInputsNoHashed } from "../utxo"
import { poseidon } from 'circomlibjs'
import { deriveBabyJubKeysFromEth } from '../keys'

export const computeInputs = async ({
  batch,
  wallet,
  message,
}: any) => {
  const {
    token,
    roots,
    delta,
    utxosIn,
    utxosOut,
  } = batch

  const {
    pvtkey: secret
  } = deriveBabyJubKeysFromEth(wallet)

  const root = roots.tree

  const secret_token = token

  const subtree_root = roots.subtree

  const mp_path = utxosIn.map((u: any) => u.mp_path)

  const nullifier = utxosIn.map((u: any) => {
    return getNullifier({
      utxo: u,
      secret,
    })
  })

  const mp_sibling = utxosIn.map((u: any) => u.mp_sibling)

  const utxo_out_hash = utxosOut.map(({ hash }: any) => BigInt(hash))

  const subtree_mp_sibling = utxosIn.map((u: any) => u.smp_path)

  const utxo_in_data = utxosIn.map((utxo: any) => inUtxoInputs(utxo).slice(1))

  const utxo_out_data = batch.utxosOut.map((txo: any) => outUtxoInputsNoHashed(txo).slice(1))

  return{
    inputs: {
      root,
      token,
      delta,
      secret,
      mp_path,
      nullifier,
      mp_sibling,
      secret_token,
      subtree_root,
      utxo_in_data,
      utxo_out_hash,
      utxo_out_data,
      subtree_mp_sibling,
      message_hash: message || poseidon([BigInt(1)]),
    }
  }
}
