// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * STUB — TODO: Full receipt verification + staking/slashing — See BACKLOG.md#receipt-anchoring
 *
 * Simple receipt anchor contract for Monad testnet.
 * Stores receipt hashes on-chain as proof that work was completed.
 */
contract ReceiptAnchor {
    mapping(bytes32 => bool) public anchored;

    event ReceiptAnchored(bytes32 indexed receiptHash, address indexed submitter, uint256 timestamp);

    function anchor(bytes32 receiptHash) external {
        require(!anchored[receiptHash], "Already anchored");
        anchored[receiptHash] = true;
        emit ReceiptAnchored(receiptHash, msg.sender, block.timestamp);
    }

    function isAnchored(bytes32 receiptHash) external view returns (bool) {
        return anchored[receiptHash];
    }
}
