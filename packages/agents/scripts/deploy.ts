import hre from "hardhat";

async function main() {
  const contract = await hre.viem.deployContract("AmlMerkle");

  console.log(`Deployed at ${contract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
