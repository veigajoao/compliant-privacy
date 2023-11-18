// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MerkleTreeWithHistory.sol";
import "./Groth16Verifier.sol";
import "forge-std/console.sol";

interface IERC20 {
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);

    function approve(address spender, uint256 value) external returns (bool);
}

interface IVerifier {
    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[10] memory input
    ) external returns (bool);
}

contract Core is MerkleTreeWithHistory {
    address public admin;

    struct G1Point {
        uint x;
        uint y;
    }

    struct G2Point {
        uint[2] x;
        uint[2] y;
    }

    struct CoreProof {
        uint[] publicValues;
        G1Point a;
        G2Point b;
        G1Point c;
    }

    struct ExtData {
        address recipient;
        int256 tokenAmount;
        address tokenAddress;
        string[] encryptedReceipts;
        string[] encryptedCommitments;
        uint256[] outputCommitments;
    }

    struct Nullifier {
        uint256 value;
        bool isSpent;
    }

    uint256 public nullifiersLength;
    uint256 public nullifierCounter;
    mapping(uint256 => bool) public nullifiers;

    event NewCommitment(
        uint256 indexed commitment,
        uint256 indexed index,
        string indexed encryptedOutput,
        uint256 subtreeRoot,
        address sender,
        int256 depositValue
    );
    event NewNullifier(uint256[] indexed nullifier);
    event NewTransaction(string indexed encryptedValue);
    event NewEncryptedOutput(string indexed encryptedOutput);

    uint256 public constant MAX_EXT_AMOUNT = 10000000000;
    uint8 public constant MERKLE_TREE_HEIGHT = 31;

    IVerifier public verifier;

    constructor(address _verifier) MerkleTreeWithHistory(MERKLE_TREE_HEIGHT) {
        verifier = IVerifier(_verifier);
    }

    function markNullifierAsSpent(uint256 value) internal {
        nullifiers[value] = true;
    }

    function isSpent(uint256 nullifier) public view returns (bool) {
        return nullifiers[nullifier];
    }

    function calculatePublicAmount(
        int256 amountInteger
    ) public pure returns (uint256) {
        int256 amount = amountInteger;
        require(
            amount > int256(MAX_EXT_AMOUNT) * -1 &&
                amount < int256(MAX_EXT_AMOUNT),
            "Invalid ext amount"
        );

        if (amountInteger >= 0) {
            return uint256(amountInteger);
        } else {
            return uint256(int256(FIELD_SIZE) - amountInteger * -1);
        }
    }

    function verifyWithLength(
        uint256 n,
        CoreProof memory proof
    ) public returns (bool) {
        if (n == 3) {
            return groth16_3x2_verify(proof);
        } else {
            revert("Invalid number of inputs");
        }
    }

    function verifyCoreProof(CoreProof memory proof) public returns (bool) {
        uint256 lengthUtxosIn = proof.publicValues.length - 7;

        require(
            lengthUtxosIn >= 1 && lengthUtxosIn <= 10,
            "Invalid number of inputs"
        );

        return verifyWithLength(lengthUtxosIn, proof);
    }

    function depositFungible(
        address sender,
        address recipient,
        uint256 amount,
        address tokenAddress
    ) internal {
        require(tokenAddress != address(0), "Invalid token address");

        IERC20 token = IERC20(tokenAddress);
        bool success = token.transferFrom(sender, recipient, amount);
        require(success, "Token transfer failed");
    }

    function withdrawFungible(
        address sender,
        address recipient,
        uint256 amount,
        address tokenAddress
    ) internal {
        require(tokenAddress != address(0), "Invalid token address");
        IERC20 token = IERC20(tokenAddress);
        require(
            token.transferFrom(sender, recipient, amount),
            "Transfer failed"
        );
    }

    function validateTransact(
        CoreProof memory proof,
        ExtData memory extData
    ) public returns (bool) {
        // uint256 publicRoot = proof.publicValues[0];
        // require(isKnownRoot(bytes32(publicRoot)), "Invalid public root");

        uint256 publicAmount = proof.publicValues[
            proof.publicValues.length - 2
        ];

        require(
            publicAmount == calculatePublicAmount(extData.tokenAmount),
            "Invalid public amount"
        );

        uint256[] memory publicNullifiers = extractPublicNullifiers(
            proof.publicValues
        );

        for (uint i = 0; i < publicNullifiers.length; i++) {
            require(!isSpent(publicNullifiers[i]), "Nullifier already spent");
        }

        require(verifyCoreProof(proof), "Invalid transaction proof");

        return true;
    }

    function groth16_3x2_verify(
        CoreProof memory proof
    ) internal returns (bool) {
        uint[10] memory input = [
            proof.publicValues[0],
            proof.publicValues[1],
            proof.publicValues[2],
            proof.publicValues[3],
            proof.publicValues[4],
            proof.publicValues[5],
            proof.publicValues[6],
            proof.publicValues[7],
            proof.publicValues[8],
            proof.publicValues[9]
        ];

        bool result = verifier.verifyProof(
            [proof.a.x, proof.a.y],
            [[proof.b.x[0], proof.b.x[1]], [proof.b.y[0], proof.b.y[1]]],
            [proof.c.x, proof.c.y],
            input
        );

        return result;
    }

    function transact(
        CoreProof memory proof,
        ExtData memory extData
    ) public returns (bool) {
        require(verifier != IVerifier(address(0)), "Verifier address not set");

        bool isValid = validateTransact(proof, extData);
        require(isValid, "Invalid transaction");

        int256 amount = extData.tokenAmount;

        if (amount > 0) {
            depositFungible(
                msg.sender,
                address(this),
                uint256(amount),
                extData.tokenAddress
            );
        }
        if (amount < 0) {
            withdrawFungible(
                address(this),
                extData.recipient,
                uint256(-amount),
                extData.tokenAddress
            );
        }

        eventTransact(proof, extData);

        return true;
    }

    function eventTransact(
        CoreProof memory proof,
        ExtData memory extData
    ) internal {
        // Public values:
        // ;  root,
        // ;  subtree_root,
        // ;  nullifier,
        // ;  utxo_out_hash,
        // ;  token,
        // ;  delta,
        // ;  message_hash

        uint256[] memory outputCommitments = extData.outputCommitments;

        require(outputCommitments.length == 2, "Invalid number of outputs");

        string[] memory encryptedOutput = extData.encryptedCommitments;
        // string[] memory encryptedValue = extData.encryptedReceipts;
        uint256[] memory publicValues = proof.publicValues;

        uint256[] memory publicNullifiers = extractPublicNullifiers(
            publicValues
        );

        for (uint i = 0; i < publicNullifiers.length; i++) {
            markNullifierAsSpent(publicNullifiers[i]);
        }

        bytes32 outputCommitment0 = bytes32(outputCommitments[0]);
        bytes32 outputCommitment1 = bytes32(outputCommitments[1]);

        uint256 index = _insert(outputCommitment0, outputCommitment1);

        uint256 subtreeRoot = publicValues[1];
        int256 depositValue = 0;

        if (extData.tokenAmount > 0) {
            depositValue = extData.tokenAmount;
        }

        emit NewCommitment(
            outputCommitments[0],
            index,
            encryptedOutput[0],
            subtreeRoot,
            msg.sender,
            depositValue
        );

        emit NewCommitment(
            outputCommitments[1],
            index,
            encryptedOutput[1],
            subtreeRoot,
            msg.sender,
            depositValue
        );

        // for (uint i = 0; i < encryptedOutput.length; i++) {
        //     emit NewEncryptedOutput(encryptedOutput[i]);
        // }
        // for (uint i = 0; i < encryptedValue.length; i++) {
        //     emit NewTransaction(encryptedValue[i]);
        // }

        emit NewNullifier(publicNullifiers);
    }

    function extractPublicNullifiers(
        uint256[] memory publicValues
    ) private pure returns (uint256[] memory) {
        uint256[] memory publicNullifiers = new uint256[](
            publicValues.length - 3
        );
        for (uint i = 0; i < publicValues.length - 3; i++) {
            publicNullifiers[i] = publicValues[i + 2];
        }

        return publicNullifiers;
    }
}
