export const useWalletVerification = (walletAddress: string) => {
  const blacklistedWallets = ["0xFD9eE68000Dc92aa6c67F8f6EB5d9d1a24086fAd"];

  return {
    isBlacklisted: blacklistedWallets.includes(walletAddress),
  };
};
