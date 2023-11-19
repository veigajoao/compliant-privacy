/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import MerkleTree, { MerkleTree as FixedMerkleTree } from "fixed-merkle-tree";
import { PoseidonClass } from "./hash";
import { publicClient } from "@/context/opact";
import contractABI from '../../contractAbi.json'

const contractAddress = '0xD2756f78c72ad740BB8f82dD97F0CBa01E6e5337'

export class MerkleTreeService {
  readonly name: string;

  RPC: string;

  tree: any | undefined;

  branches: any = []

  constructor(
    name = 'commitments',
  ) {
    this.name = name;
    this.RPC = 'https://bpsd19dro1.execute-api.us-east-2.amazonaws.com'
  }

  async initMerkleTree(localItems: any[], branches: any[] = [], onlyLocal = false): Promise<any> {
    const { hash } = await (new PoseidonClass()).load();

    // const branches = await this.getBranches();

    let items: any[] = [...localItems];

    if (!onlyLocal) {
      items = [...items, ...branches]
    }

    this.branches = branches

    const tree = new FixedMerkleTree(32, [],
      {
        zeroElement: 19014214495641488759237505126948346942972912379615652741039992445865937985820n as any,
        hashFunction: hash,
      } as any
    );

    if (!items) {
      this.tree = tree;

      return tree;
    }

    items.forEach((value: any, i: number) => {
      const pos = 0 + i

      try {
        tree.update(pos, value);
      } catch (e) {
        console.warn(e);

        throw new Error("Error when update Merkle Tree");
      }
    });

    this.tree = tree;

    return {
      tree,
      branches,
    };
  }

  // TODO: GET BRANCHES FROM THEGRAPH ONLY
  async getBranches(): Promise<any> {
    return []
    // let branches: any[] = []

    // const nullifiersEvent = await publicClient.getContractEvents({
    //   address: contractAddress,
    //   abi: contractABI,
    //   eventName: 'NewNullifier',
    //   fromBlock: 4720739n,
    // })

    // const nullifiers = nullifiersEvent.map(({ args }: any) => args.nullifier).flat(1)

    // let isLastPage = false

    // while (!isLastPage) {
    //   const response = await fetch(`${this.RPC}/commitments`)

    //   const {
    //     data,
    //     is_last_page
    //   } = await response.json()

    //   branches = [...branches, ...data]

    //   isLastPage = is_last_page
    // }

    // return branches
  }
}
