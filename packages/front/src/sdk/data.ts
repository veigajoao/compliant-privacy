import commitments from '../../commitments.json'
import { decrypt } from './encryption'
import { deriveBabyJubKeysFromEth } from './keys'
import { getNullifier } from './utxo'

export const getUserBalanceBySecret = async (
  secret: any,
  currentId: any,
  storedUtxos: any,
  nullifiers: any,
  encryptedCommitments: any,
) => {
  const encrypted = encryptedCommitments.map((item: any) => {
    try {
      const value = decrypt({
        encrypted: item,
        privateKey: secret,
      })

      return value
    } catch (e) {
      return null
    }
  }).filter(item => !!item)

  return {
    ...groupUtxoByToken([...storedUtxos, ...encrypted], nullifiers, secret)
  }
}

export const groupUtxoByToken = (encrypted: any, nullifiers: any, secret: any) => {
  return encrypted.reduce((acc: any, curr: any) => {
    const derivedKeys = deriveBabyJubKeysFromEth({ pvtkey: secret })

    const nullifier = getNullifier({
      utxo: curr,
      secret: derivedKeys.pvtkey
    })

    const isOnUtxos = acc.utxos.find((value: any) => {
      return value.blinding === curr.blinding
    })

    if (nullifiers.includes(nullifier.toString()) || curr.amount === 0n || !!isOnUtxos) {
      return acc
    }

    acc.utxos.push(curr)

    const {
      address
    } = curr

    if (!acc.treeBalances[address]) {
      acc.treeBalances[address] = {
        address,
        utxos: [],
        balance: 0n,
      }
    }

    acc.treeBalances[address].balance += curr.amount
    acc.treeBalances[address].utxos = [...acc.treeBalances[address].utxos, curr]

    return acc
  }, {
    utxos: [],
    treeBalances: {},
  })
}
