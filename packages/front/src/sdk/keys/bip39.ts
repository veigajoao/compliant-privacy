/* eslint-disable */
import { toHex } from 'ethereum-cryptography/utils';
import * as bip39 from 'ethereum-cryptography/bip39';
import { wordlist } from 'ethereum-cryptography/bip39/wordlists/english';
import { MnemonicType, MnemonicStrengthType, MnemonicPasswordType } from './types/bip39.types';

export const generateMnemonic = (strength: MnemonicStrengthType = 256): string => bip39.generateMnemonic(wordlist, strength);

export const validateMnemonic = (mnemonic: MnemonicType): boolean => bip39.validateMnemonic(mnemonic, wordlist)

export const mnemonicToSeed = (mnemonic: MnemonicType, password: MnemonicPasswordType = ''): any => {
  const seed = bip39.mnemonicToSeedSync(mnemonic, password)

  return {
    seed,
    seedHex: toHex(seed)
  }
}
