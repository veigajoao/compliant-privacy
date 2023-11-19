/* eslint-disable import/no-extraneous-dependencies */
import { encrypt as _encrypt } from '@metamask/eth-sig-util';
import { encode } from 'js-base64';
import * as naclUtil from 'tweetnacl-util';

import { EncryptInterface } from './types/encrypt.type';
import { separateHex, hexToUint8Array, stringifyUtxo, strip0x } from '../util';

export const encrypt = ({ data, address }: EncryptInterface) => {
  const { encryptionPubkey } = separateHex(address);

  const addressUint8 = hexToUint8Array(strip0x(encryptionPubkey));

  const publicKey = naclUtil.encodeBase64(addressUint8);

  const dataString = stringifyUtxo(data);

  const encrypted = _encrypt({
    publicKey,
    data: dataString,
    version: 'x25519-xsalsa20-poly1305',
  });

  return encode(JSON.stringify(encrypted));
};
