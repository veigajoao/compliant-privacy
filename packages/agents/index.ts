import { createWalletClient, createPublicClient, http } from "viem";
import { goerli } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { getScoreMock } from "./scripts/helpers";
import { ethRegisterControllerAbi } from "./scripts/abi";
import "dotenv/config";

const { PRIVATE_KEY, INFURA_API_KEY } = process.env;

async function main() {
  const account = privateKeyToAccount(PRIVATE_KEY as any);

  const publicClient = createPublicClient({
    chain: goerli,
    transport: http(),
  });
  const client = createWalletClient({
    account,
    chain: goerli,
    transport: http(`https://goerli.infura.io/v3/${INFURA_API_KEY}`),
  });

  const data = await publicClient.readContract({
    address: "0xCc5e7dB10E65EED1BBD105359e7268aa660f6734",
    abi: ethRegisterControllerAbi,
    functionName: "maxCommitmentAge",
  });

  console.log(data);
  // Listen new UTXO Creation

  // Evaluate tx/sender
  const score = getScoreMock();

  // Evaluate Sparse Merkle Tree/subRoot

  // Update Sparse Merkle Tree based on evaluation
}

main();
