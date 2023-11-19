// TODO: FIX ESLINT
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { groth16 } from 'snarkjs'

export const getPublicArgs = (proof: any, publicSignals: string[]): any => {
  return groth16.exportSolidityCallData(proof, publicSignals)

  return {
    public_values: publicSignals.map(item => {
      let string = BigInt(item).toString(16)

      if (string.length < 64) {
        string = string.padStart(64, '0')
        console.log('string', string)
      }

      return '0x' + string
    }),
    a: {
      x: '0x' + BigInt(proof.pi_a[0]).toString(16),
      y: '0x' + BigInt(proof.pi_a[1]).toString(16),
    },
    b: {
      x: proof.pi_b[0].map(item => '0x' + BigInt(item).toString(16)),
      y: proof.pi_b[1].map(item => '0x' + BigInt(item).toString(16)),
    },
    c: {
      x: '0x' + BigInt(proof.pi_c[0]).toString(16),
      y: '0x' + BigInt(proof.pi_c[1]).toString(16),
    },
  };
};
