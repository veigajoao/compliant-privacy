import "dotenv/config";
import { createWalletClient, createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

const { PRIVATE_KEY, INFURA_API_KEY } = process.env;

const account = privateKeyToAccount(PRIVATE_KEY as any);

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

export const client = createWalletClient({
  account,
  chain: sepolia,
  transport: http(`https://sepolia.infura.io/v3/${INFURA_API_KEY}`),
});
