/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import Big from "big.js";

export function getDecimals(decimals: number) {
  return Big(10).pow(decimals || 1);
}

export const formatBigNumberWithDecimals = (
  value: string | number | Big,
  decimals: Big
) => {
  return new Big(value).div(decimals).toFixed(1);
};

export const formatInteger = (
  amount: string | number,
  decimals: number
): string => {
  return Big(amount.toString()).mul(Big(10).pow(decimals)).toFixed(0);
};
