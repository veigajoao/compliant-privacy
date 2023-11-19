// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MerkleTreeWithHistory.sol";

contract AmlMerkle is MerkleTreeWithHistory {

    uint8 public constant MERKLE_TREE_HEIGHT = 31;
    uint256 public constant INCLUDE_VALUE = 11954255677048767585730959529592939615262310191150853775895456173962480955685;

    address public admin;

    event NewLeaf(
        uint256 indexed index,
        bool shouldRemove,
        bytes32 merkleRoot
    );

    constructor() MerkleTreeWithHistory(MERKLE_TREE_HEIGHT) {
        admin = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == admin, "Only owner can call this function");
        _;
    }

    function insertNew(bool shouldRemove) public onlyOwner {
        if (shouldRemove) {
            _insert(bytes32(ZERO_VALUE));
        } else {
            _insert(bytes32(INCLUDE_VALUE));
        }

        emit NewLeaf(
            nextIndex - 1,
            shouldRemove,
            roots[currentRootIndex]
        );
    }

}
