import { computeInputs, getDepositSoluctionBatch, getRandomWallet, getWalletFromMnemonic } from '@/sdk';
import { walletStorage } from '@/utils';
import React, { createContext, useReducer, useContext, useState, useEffect } from 'react';
import {
  buildProof,
} from '@/utils/proof'
import { loadArtifact } from '@/utils/artifacts';

const initialState = {
  wallet: null,
  loadingDeposit: false,
  loadingWithdraw: false,
};

const OpactContext = createContext<any>({
  global: { ...initialState },
  createRandomWallet: () => {},
  disconnect: () => {},
  sendDeposit: () => {},
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
    })()
  }, [])

  const sendDeposit = async ({
    amount,
  }) => {
    if (global.loadingDeposit || !global.wallet) {
      return
    }

    dispatch({
      type: 'setLoadingDeposit',
      payload: true,
    })

    const { wallet } = global

    const batch = await getDepositSoluctionBatch({
      senderWallet: wallet,
      totalRequired: 10,
      selectedToken: 'erc2020',
    });

    const { inputs } = await computeInputs({
      batch,
      wallet,
    });

    const publicArgs = await buildProof({
      inputs,
    })

    dispatch({
      type: 'setLoadingDeposit',
      payload: false,
    })

    if (!window?.ethereum) {
      return
    }

    const account = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];

    console.log('publicArgs', publicArgs)
    console.log('window.eth', account)
  }

  return (
    <OpactContext.Provider
      value={{
        global,
        dispatchState,
        createRandomWallet,
        disconnect,
        sendDeposit,
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
