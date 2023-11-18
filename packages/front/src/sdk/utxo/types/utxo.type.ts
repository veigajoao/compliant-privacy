export type mp_sibling = string[];

export type mp_path = number;

export enum TokenType {
  ERC20 = 0,
  ERC721 = 1,
  ERC1155 = 2,
}

export type TokenData = {
  tokenType: TokenType;
  tokenAddress: string;
  tokenSubID: string;
};

export type TreeBalance = {
  balance: bigint;
  tokenData: TokenData;
  utxos: TXO[];
};

export type TokenSpec = {
  id: string;
  refName: {
    name: string;
    namespace: string;
  };
  refSpec: {
    name: string;
    namespace: string;
  };
};

export type TXO = {
  token: string;
  amount: bigint;
  pubkey: string;
  blinding: string;
  mp_sibling: string;
  mp_path: string;
};

export type EncryptedTXO = {
  txo: TXO;
  txid: string;
  token: string;
  chain: string;
  sender: string;
  amount: bigint;
  position: string;
  receiver: string;
  spec: TokenSpec;
};

export type ProofInputInterface = {
  // Secret key of user
  secret: string;

  // Address of token to be updated to withdraw or deposit
  secret_token: string;

  // The Merkletree root
  root: string;

  // The SubMerkletree root
  subtree_root: string;

  // Array of nullifiers of each utxo_in
  nullifier: string[];

  // Array of hashes of each utxo_out
  utxo_out_hash: string[];

  // TODO: Token address
  token: string;

  // TODO: Delta value: if negative is a withdraw, if postive is deposit
  delta: bigint;

  // TODO: The message hash (Note version to wallets?)
  message_hash: string;

  // Array of mp sibling of each UTXO
  mp_sibling: mp_sibling[];

  // Array of mp sibling of each UTXO
  mp_path: mp_path[];

  // Array of proof of each UTXO in subtree
  subtree_mp_sibling: mp_sibling[];

  // Array of UTXOs in
  utxo_in_data: any[];

  // Array of UTXO out
  utxo_out_data: any[];
};
