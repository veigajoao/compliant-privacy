# Compliant Privacy

## Introduction

### The Problem

This project aims to implement the concept of subset inclusion proofs for anonymity protocols as described by [Privacy Pools](https://www.privacypools.com/) and by Buterin et al in the article [Blockchain Privacy and Regulatory Compliance: Towards a Practical Equilibrium](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4563364).

The original implementation of Privacy Pools describes a protocol similar to the original [Tornado Cash solution](https://github.com/tornadocash/tornado-core), which allows users to (1) generate a secret value locally, (2) deposit a fixed amount of Ether to a smart contract with a commitment to the secret value (its poseidon hash) and (3) at any later time, by presenting a Zero Knowledge proof of knowledge of one of the secret values committed to the contract, withdraw the deposited amount from the smart contract.
This setup breaks the link between deposit and withdrawal on chain as it is impossible to deduce the secret value from the commitment and the proof. Tornado Cash was famously [sanctioned by the OFAC in 2022](https://www.coindesk.com/policy/2023/10/11/tornado-cash-trading-volumes-nosedived-90-after-us-sanctions/#:~:text=The%20U.S.%20Treasury%20Department's%20Office,malicious%20actors%20to%20launder%20money.) leading to criminal cases against the developers and the users of the protocol.


Privacy pools improves on that design by allowing **subset** membership proofs. These allow a user to prove that they know the preimage of a previous unused commitment while also proving that this preimage belongs to a specific subset of all preimages. By leveraging the subset proofs, user can effectively prove that their withdraws did not come from any known money laundry or other illicit source. 

While the tool created by privacy pools is very useful, it still leaves a lot of unanswered questions which have been explored more in depth by Buterin et al. in their aforementioned article. The main issue is **who** should determine which deposits into the protocol are to be considered malicious and excluded from subset proofs by all users - it is easy to fall into a centralized and permissioned solution when considering the problem which must be avoid at all costs to maintain the censorship resistance property of blockchain systems.

Moreover, the current design of Privacy Pools draws from an early version of Tornado Cash that only allowed fixed sized deposits and withdrawals of fixed asset types. The UX provided by the protocol is not ideal to the everyday user and is a barrier to adoption of privacy solutions. Other protocols have been proposed to address that problem - albeit without considerations for regulatory compliance - such as [Tornado Cash Nova](https://github.com/tornadocash/tornado-nova) and [Railgun](https://www.railgun.org/).

### Our Solution

We propose a solution that combines the best of both worlds: a decentralized and permissionless protocol that allows for subset inclusion proofs and that is also flexible enough to allow for variable sized deposits and withdrawals of any asset type. 

We also propose a solution to the problem of malicious deposit detection by building a decoupled analysis role in the system. This role can be filled by any generic provider that is capable of detecting malicious transactions. For the Hackathon we implemented a simple analysis agent that uses the [VaaS API](https://www.vaas.live/) to detect malicious transactions. VaaS is a company that provides risk analysis for crypto transactions in a similar manner to [Chainalysis](https://www.chainalysis.com/) and [Elyptic](https://www.elliptic.co/).

The agent posts an on chain list of malicious transactions that every withdrawal must dissociate from in order to be considered licit.

**It's important to notice that all considerations regarding maliciousness of transactions and withdrawals are performed by off chain agents that are NOT linked to the core protocol. The protocol is never going to lock funds based on an agent flagging it as possibly malicious - however centralized entities are going to chose not to interact with those funds based on their bad risk score**

## Architecture

The protocol consists of 3 parts:
1. Core singleton smart contract
2. Anti Money Laundry Agents
3. Frontend interface

### Core Singleton Smart Contract

The core singleton smart contract is the only on chain component of the protocol. It works with an UTXO model.
Whenever a user wants to deposit funds within the protocol they must generate an UTXO representing the funds that they're depositing in the following format:
```json
{
    "assetType": "<encoded ERC + specs>",
    "assetQuantity": "<amount of the asset being deposited>",
    "owner": "<public key of owner>",
    "blindingFactor": "<strongly random number>"
}
```

However, this plain text UTXO is never going to be submitted on chain. The user must create 2 private versions of it: (1) a poseidon hash commitment of the UTXO (2) an encrypted version of the UTXO using its owner's public key and an asymmetric encryption scheme.

When the user deposits their assets, the commitment to the UTXO is stored within a merkle tree in the contract and the encrypted version is logged as an event in the blockchain.

To spend each UTXO, the user must provide a zk proof that:
(1) they know the preimage to the commitment (that requires that they know the private key that can decrypted the commitment)
(2) they know the private key to the public key used in the owner field of the UTXO

Additionally, whenever a user does a transaction they can spend multiple UTXO and create new UTXOs - the prove must assert that the quantity of created assets is equal to the quantity of spent assets.

The user also creates an inclusion proof in which they can explicitly exclude known maliciou UTXOs, proving that they did NOT spend those in the transaction.

**more considerations regarding the circuits and contracts are given in the contract and circuits packages' readme.md files**

### Anti Money Laundry (AML) agents

The Anti Money Laundry Agent is an off chain bot that uses a risk scoring API to evaluate all deposits to the protocol. Whenever it finds that a deposit's risk score is too high, it adds the deposit's UTXO to a list of malicious UTXOs that is stored in an on chain contract.

Users that wish to prove to that Anti Money Landry Agent that they are not malicious must always exclude all the UTXOs in the agent's list from their inclusion proofs. If they do not exclude all the UTXOs in the list, the agent will flag their transaction as malicious and the user will not be able to interact with off chain agents that use the Anti Money Laundry Agent as their compliance threshold.

**more considerations regarding the AML agent are given in the agent package's readme.md file**

### Metamask Snap frontend

The frontend is a metamask snap that allows users to deposit and withdraw funds from the protocol. It can be used as a model that integrates with any Anti Money Laundry Agent. The snap fetches the denylist from the AML agent and uses that as a base for their subset proofs.

**more considerations regarding the snap frontend are given in the site and snap packages' readme.md files**