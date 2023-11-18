import { computeInputs, decrypt, encrypt, getDepositSoluctionBatch, getRandomWallet, getTransferSolutionBatch, getWalletFromMnemonic } from '@/sdk';
import { walletStorage } from '@/utils';
import React, { createContext, useReducer, useContext, useState, useEffect } from 'react';
import {
  buildProof,
} from '@/utils/proof'
import { loadArtifact } from '@/utils/artifacts';
import { computeData } from '@/utils/data';
import contractABI from '../contractAbi.json'
import { ethers } from 'ethers';

const contractAddress = '0x7E8C10a65e54c552557CcF59Ca5DaBE85180cB7C'
const tokenAddress = '0xcf185f2F3Fe19D82bFdcee59E3330FD7ba5f27ce'

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

      const treeBalances = await computeData({
        secret: wallet.pvtkey,
        currentId: 0,
        storedUtxos: [],
      })

      dispatch({
        type: 'setTreeBalances',
        payload: treeBalances,
      })
    })()
  }, [])

  const sendDeposit = async ({
    amount = 1,
  }) => {
    if (global.loadingDeposit || !global.wallet || !window?.ethereum) {
      return
    }

    dispatch({
      type: 'setLoadingDeposit',
      payload: true,
    })

    const { wallet } = global

    const batch = await getDepositSoluctionBatch({
      senderWallet: wallet,
      totalRequired: amount,
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

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const signer = provider.getSigner();

    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer,
    );

    const tx = contract.transact(
      publicArgs,
      {
        tokenAddress,
        outputCommitments,
        recipient: account,
        tokenAmount: amount,
        encryptedCommitments,
        encryptedReceipts: [],
      },
    )

    dispatch({
      type: 'setLoadingDeposit',
      payload: false,
    })
  }

  const sendWithdraw = async ({
    treeBalance,
  }) => {
    if (global.loadingDeposit || !global.wallet || !window?.ethereum) {
      return
    }

    dispatch({
      type: 'setLoadingWithdraw',
      payload: true,
    })

    const { wallet } = global

    const batch = await getTransferSolutionBatch({
      treeBalance,
      selectedToken: 'erc2020',
      senderWallet: wallet,
      totalRequired: 10
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

    const account = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];

    console.log('window.eth', account)
    console.log('publicArgs', publicArgs)
    console.log('encryptedCommitments', encryptedCommitments)
    console.log('decrypted', encryptedCommitments.map((i: string) => decrypt({
      encrypted: i,
      privateKey: wallet.pvtkey
    })))

    dispatch({
      type: 'setLoadingWithdraw',
      payload: false,
    })
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
