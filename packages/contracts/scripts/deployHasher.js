const { ethers } = require("hardhat");
const { utils } = ethers;

// This is a Hardhat script, to be run with `npx hardhat run <path>`.
async function main() {
  require("./compileHasher");

  const Hasher = await await ethers.getContractFactory("Hasher");
  const hasher = await Hasher.deploy();
  await hasher.deployed();
  console.log(`hasher: ${hasher.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
