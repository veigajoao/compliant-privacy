import commitments from '../../commitments.json'
import { decrypt } from './encryption'
import { deriveBabyJubKeysFromEth } from './keys'
import { getNullifier } from './utxo'

export const getUserBalanceBySecret = async (
  secret: any,
  currentId: any,
  storedUtxos: any,
) => {
  let lastId = currentId

  let isLastPage = false

  let encrypted: any[] = []

  while (!isLastPage) {
    // const response = await fetch(`${RPC}/encrypted?salt=${currentId as string}`)

    // const {
    //   data,
    //   last_tx_id,
    //   is_last_page
    // } = await response.json()
    const data = commitments

    encrypted = [...encrypted, ...data]

    isLastPage = true
    // isLastPage = is_last_page

    if (isLastPage) {
      lastId = 10
    }
  }

  let nullifierIsLastPage = false

  let nullifiers: any[] = []

  while (!nullifierIsLastPage) {
    // const response = await fetch(`${RPC}/nullifiers`)

    // const {
    //   data,
    //   is_last_page
    // } = await response.json()
    const data = []

    nullifiers = [...nullifiers, ...data]

    nullifierIsLastPage = true
    // nullifierIsLastPage = is_last_page
  }

  encrypted = encrypted.map((item: any) => {
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
    lastId,
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
