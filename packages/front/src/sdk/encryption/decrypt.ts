/* eslint-disable import/no-extraneous-dependencies */
import { decrypt as _decrypt } from '@metamask/eth-sig-util';
import { decode } from 'js-base64';

import { DecryptInterface } from './types/decrypt.type';
import { strip0x } from '../util';

export const decrypt = ({ encrypted, privateKey }: DecryptInterface) => {
  const decodedEncrypted = decode(encrypted);

  const encryptedData = JSON.parse(decodedEncrypted);

  console.log('privateKey', privateKey);
  console.log('encryptedData', encryptedData);

  const decrypted = _decrypt({
    encryptedData,
    privateKey: strip0x(privateKey),
  });

  // return parseUtxoString(decrypted);
  return decrypted;
};
