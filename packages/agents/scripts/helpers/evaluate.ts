import { amlMerkleAbi } from "../abi";
import { publicClient } from "./clients";
import { getAmlAnalysis } from "./getAmlAnalysis";

const amlMerkleAddress = "0x097e2065047663b5ef0A45EE7Dda3dC5cA0a4Cd7";

export const evaluate = async (
  sender: string,
  subtreeRootUsedInProof: bigint
): Promise<boolean> => {
  // Evaluate tx/sender
  console.log("Evaluate Sender of transaction");
  const isTransactionCompliant = await getAmlAnalysis(sender);

  console.log("Evaluate Sparse Merkle Tree/subRoot");
  const currentSubtreeRoot = BigInt(
    await publicClient.readContract({
      address: amlMerkleAddress,
      abi: amlMerkleAbi,
      functionName: "getLastRoot",
    })
  );
  console.log(" currentSubtreeRoot: ", BigInt(currentSubtreeRoot));

  return subtreeRootUsedInProof == currentSubtreeRoot && isTransactionCompliant;
};
