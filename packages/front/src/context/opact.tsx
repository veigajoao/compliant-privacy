import { computeInputs, decrypt, encrypt, formatInteger, getDepositSoluctionBatch, getRandomWallet, getTransferSolutionBatch, getWalletFromMnemonic } from '@/sdk';
import { walletStorage } from '@/utils';
import React, { createContext, useReducer, useContext, useEffect } from 'react';
import {
  buildProof,
} from '@/utils/proof'
import { loadArtifact } from '@/utils/artifacts';
import { computeData } from '@/utils/data';
import contractABI from '../contractAbi.json'
import { ethers } from "ethers";
import tokenABI from '../tokenABI.json'
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
})

export const tokenAddress = '0xcf185f2F3Fe19D82bFdcee59E3330FD7ba5f27ce'
export const contractAddress = '0x67aC456e9B879Ba57326917c3E8c16Dc40785F23'

const initialState = {
  wallet: null,
  treeBalances: null,
  loadingDeposit: false,
  loadingWithdraw: false,
};

const OpactContext = createContext<any>({
  global: { ...initialState },
  createRandomWallet: () => {},
  disconnect: () => {},
  sendDeposit: () => {},
  sendWithdraw: () => {},
});

const reducer = (state: any, updated: any ) => {
  switch (updated.type) {
    case 'setWallet': {
      return {
        ...state,
        wallet: updated.payload
      }
    }

    case 'setLoadingDeposit': {
      return {
        ...state,
        loadingDeposit: updated.payload
      }
    }

    case 'setLoadingWithdraw': {
      return {
        ...state,
        loadingWithdraw: updated.payload
      }
    }

    case 'setTreeBalances': {
      return {
        ...state,
        treeBalances: updated.payload
      }
    }
  }

  return state
}

const OpactContextProvider = ({ children }: any) => {
  const [global, dispatch] = useReducer(reducer, initialState);

  const dispatchState = (value: any) => dispatch(value)

  const createRandomWallet = async () => {
    const wallet = getRandomWallet()

    await walletStorage.store(wallet.mnemonic)

    dispatch({
      type: 'setWallet',
      payload: wallet,
    })
  }

  const disconnect = async () => {
    dispatch({
      type: 'setWallet',
      payload: null,
    })

    await walletStorage.store('')
  }

  useEffect(() => {
    (async () => {
      await loadArtifact()

      const cached = await walletStorage.get()

      if (!cached) {
        return
      }

      const wallet = getWalletFromMnemonic(cached as string)

      dispatch({
        type: 'setWallet',
        payload: wallet,
      })

      const encryptedEvents = await publicClient.getContractEvents({
        address: contractAddress,
        abi: contractABI,
        eventName: 'NewEncryptedOutput',
        fromBlock: 4720739n,
      })

      const encryptedCommitments = encryptedEvents.map(({ args }: any) => args.encryptedOutput)

      const nullifiersEvent = await publicClient.getContractEvents({
        address: contractAddress,
        abi: contractABI,
        eventName: 'NewNullifier',
        fromBlock: 4720739n,
      })

      const nullifiers = nullifiersEvent.map(({ args }: any) => args.nullifier).flat(1)

      const treeBalances = await computeData({
        storedUtxos: [],
        currentId: 0,
        nullifiers,
        encryptedCommitments,
        secret: wallet.pvtkey,
      })

      console.log('treeBalances', treeBalances)

      dispatch({
        type: 'setTreeBalances',
        payload: treeBalances,
      })
    })()
  }, [])

  const sendDeposit = async (rawAmount: string) => {
    if (global.loadingDeposit || !global.wallet || !window?.ethereum) {
      return
    }

    dispatch({
      type: 'setLoadingDeposit',
      payload: true,
    })

    const { wallet } = global

    const commitmentsEvent = await publicClient.getContractEvents({
      address: contractAddress,
      abi: contractABI,
      eventName: 'NewCommitment',
      fromBlock: 4720739n,
    })

    const commitments = commitmentsEvent.map(({ args}: any) => ({
      value: args.commitment
    }))

    const batch = await getDepositSoluctionBatch({
      commitments,
      senderWallet: wallet,
      totalRequired: rawAmount,
      selectedToken: tokenAddress,
    });

    const { inputs } = await computeInputs({
      batch,
      wallet,
    });

    const publicArgs = await buildProof({
      inputs,
    })

    const encryptedCommitments = batch.utxosOut.map((utxo: any) => encrypt({
      data: utxo,
      address: wallet.address
    }))

    const outputCommitments = batch.utxosOut.map((utxo: any) => utxo.hash.toString())

    const account = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];

    const provider = new ethers.BrowserProvider(window.ethereum)

    const signer = await provider.getSigner();

    const contractToken = new ethers.Contract(
      tokenAddress,
      tokenABI,
      signer,
    )

    const amount = formatInteger(rawAmount, 18)

    await contractToken.approve(contractAddress, amount)

    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer,
    );

    const [
      a,
      b,
      c,
      public_values
    ] = JSON.parse(`[${publicArgs}]`)

    try {
      const tx = await contract.transact(
        [
          public_values,
          a,
          b,
          c,
        ],
        [
          account,
          amount,
          tokenAddress,
          [],
          encryptedCommitments,
          outputCommitments,
        ]
      )

      console.log('tx', tx)
    } catch (e) {
      console.warn(e)
    } finally {
      dispatch({
        type: 'setLoadingDeposit',
        payload: false,
      })
    }
  }

  const sendWithdraw = async (amount = 1) => {
    if (global.loadingDeposit || !global.wallet || !window?.ethereum) {
      return
    }

    dispatch({
      type: 'setLoadingWithdraw',
      payload: true,
    })

    const { wallet, treeBalances } = global

    const treeBalance = treeBalances[tokenAddress]

    const commitmentsEvent = await publicClient.getContractEvents({
      address: contractAddress,
      abi: contractABI,
      eventName: 'NewCommitment',
      fromBlock: 4720739n,
    })

    console.log('commitmentsEvent, ', commitmentsEvent)

    const commitments = commitmentsEvent.map(({ args}: any) => ({
      value: args.commitment
    }))

    const batch = await getTransferSolutionBatch({
      treeBalance,
      commitments,
      selectedToken: tokenAddress,
      senderWallet: wallet,
      totalRequired: amount
    })

    const { inputs } = await computeInputs({
      batch,
      wallet,
    });

    const publicArgs = await buildProof({
      inputs,
    })

    const encryptedCommitments = batch.utxosOut.map((utxo: any) => encrypt({
      data: utxo,
      address: wallet.address
    }))

    const outputCommitments = batch.utxosOut.map((utxo: any) => utxo.hash.toString())

    const account = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];

    const provider = new ethers.BrowserProvider(window.ethereum)

    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer,
    );

    const [
      a,
      b,
      c,
      public_values
    ] = JSON.parse(`[${publicArgs}]`)

    try {
      const tx = await contract.transact(
        [
          public_values,
          a,
          b,
          c,
        ],
        [
          account,
          formatInteger(amount, 18),
          tokenAddress,
          [],
          encryptedCommitments,
          outputCommitments,
        ]
      )

      console.log('tx', tx)
    } catch (e) {
      console.warn(e)
    } finally {
      dispatch({
        type: 'setLoadingWithdraw',
        payload: false,
      })
    }
  }

  return (
    <OpactContext.Provider
      value={{
        global,
        disconnect,
        sendDeposit,
        sendWithdraw,
        dispatchState,
        createRandomWallet,
      }}
    >
      {children}
    </OpactContext.Provider>
  );
};

const useOpactContext = () => {
  return useContext(OpactContext);
};

export { OpactContextProvider, useOpactContext };
