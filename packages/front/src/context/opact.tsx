import { getRandomWallet, getWalletFromMnemonic } from '@/sdk';
import { walletStorage } from '@/utils';
import React, { createContext, useReducer, useContext, useState, useEffect } from 'react';
import {
  buildProof,
} from '@/utils/sdk'

const initialState = {
  wallet: null,
  loadingDeposit: false,
  loadingWithdraw: false,
};

const OpactContext = createContext<any>({
  global: { ...initialState },
  createRandomWallet: () => {},
  disconnect: () => {},
});

const reducer = (state: any, updated: any ) => {
  switch (updated.type) {
    case 'setWallet': {
      return {
        ...state,
        wallet: updated.payload
      }
    }

    case 'setLoadingDepoist': {
      return {
        ...state,
        loadingDeposit: updated.payload
      }
    }
  }
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

  const sendDeposit = () => {
    if (global.loadingDeposit) {
      return
    }

    dispatch({
      type: 'setLoadingDeposit',
      payload: true,
    })

    const publicArgs = await buildProof({
      fee: state.fee,
      note: state.note,
      ticket: state.ticket,
      relayer: state.relayer,
      receiver: state.receiver,
      callbackProgress: (message: string) => {
        if (message === 'start') {
          dispatch({
            loading: false,
            generatingProof: true
          })

          return
        }

        dispatch({
          progress: message
        })
      }
    })
  }

  return (
    <OpactContext.Provider
      value={{
        global,
        dispatchState,
        createRandomWallet,
        disconnect
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
