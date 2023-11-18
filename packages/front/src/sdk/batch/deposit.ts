import { getUtxo } from '../utxo'
import { getPoseidonTokenHash } from '../util'
import { computeTreeValues } from '../proof/tree-values'
import { getDelta, getSolutionOuts } from "./solutions"
import { deriveBabyJubKeysFromEth } from '../keys'

export const getDepositSoluctionBatch = async ({
  treeBalance,
  senderWallet,
  totalRequired,
  selectedToken,
}: any) => {
  const derivedKeys = deriveBabyJubKeysFromEth(senderWallet)

  const token = getPoseidonTokenHash(selectedToken)

  const utxosIn =  [
    getUtxo({
      token,
      id: 0,
      amount: 0n,
      pubkey: derivedKeys.pubkey,
      address: selectedToken,
    }),
    getUtxo({
      token,
      id: 0,
      amount: 0n,
      pubkey: derivedKeys.pubkey,
      address: selectedToken,
    }),
    getUtxo({
      token,
      id: 0,
      amount: 0n,
      pubkey: derivedKeys.pubkey,
      address: selectedToken,
    }),
  ]

  const utxosOut = await getSolutionOuts({
    utxosIn,
    treeBalance: {
      ...treeBalance,
      token,
    },
    totalRequired,
    selectedToken,
    senderPubkey: derivedKeys.pubkey,
    isDeposit: true,
  })

  const delta = await getDelta({ utxosOut, utxosIn })

  const {
    roots,
    newIns
  } = await computeTreeValues(utxosIn)

  return {
    delta,
    roots,
    token,
    utxosOut,
    utxosIn: newIns,
  }
}
