import {
  evaluate,
  getAmlAnalysis,
  getAmlAnalysisMock,
  publicClient,
} from "./scripts/helpers";
import { coreAbi, amlMerkleAbi, erc20Abi } from "./scripts/abi";
import "dotenv/config";

const coreAddress = "0xA077afBD9c8858dd90b8713416cA22F3831722Ab";
const amlMerkleAddress = "0x097e2065047663b5ef0A45EE7Dda3dC5cA0a4Cd7";

async function main() {
  // Sync
  const logs = await publicClient.getContractEvents({
    abi: coreAbi,
    address: coreAddress,
    eventName: "NewCommitment",
    fromBlock: 4722127n,
  });
  const filteredLogs = logs.filter(
    (log) => log.args.index! % 2n == 0n && log.args.depositValue! > 0n
  );
  console.log(filteredLogs);
  return;
  // Listen new UTXO Creation
  const unwatch = publicClient.watchContractEvent({
    abi: coreAbi,
    address: coreAddress,
    eventName: "NewCommitment",
    onLogs: (logs) => console.log(logs),
  });

  //   // Evaluate tx/sender
  //   const evaluation = await evaluate(sender, subtreeRootUsedInProof);

  //   if (evaluation) {
  //     // await client.writeContract({
  //     //   address: amlMerkleAddress,
  //     //   abi: amlMerkleAbi,
  //     //   functionName: "insertNew",
  //     //   args: [false],
  //     // });
  //     console.log("UTXO tagged as compliant");
  //   } else {
  //     // await client.writeContract({
  //     //   address: amlMerkleAddress,
  //     //   abi: amlMerkleAbi,
  //     //   functionName: "insertNew",
  //     //   args: [true],
  //     // });
  //     console.log("UTXO tagged as not compliant");
  //   }
}

main();
