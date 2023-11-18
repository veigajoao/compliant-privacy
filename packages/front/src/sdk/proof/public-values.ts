// TODO: FIX ESLINT
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
export const getPublicArgs = (proof: any, publicSignals: string[]): any => {
  return {
    public_values: publicSignals,
    a: {
      x: proof.pi_a[0],
      y: proof.pi_a[1],
    },
    b: {
      x: proof.pi_b[0],
      y: proof.pi_b[1],
    },
    c: {
      x: proof.pi_c[0],
      y: proof.pi_c[1],
    },
  };
};
