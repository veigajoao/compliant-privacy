import { ContractFactory } from 'ethers';
import Hasher from './Hasher.json' assert { type: "json" };


const factory = new ContractFactory(Hasher.abi, Hasher.bytecode);

// If your contract requires constructor args, you can specify them here
const contract = await factory.deploy();

console.log(contract.address);
console.log(contract.deployTransaction);