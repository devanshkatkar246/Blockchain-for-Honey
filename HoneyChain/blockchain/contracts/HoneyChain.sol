// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HoneyChain
 * @notice Blockchain-Based Honey Traceability & Smart Beekeeping Management
 * @dev Anchors canonical SHA-256 batch hashes off-chain to an immutable distributed ledger.
 * Problem Statement: PS 26021 | Team: Binary Brains (PIEMR-SIH-26)
 *
 * Core Principle:
 * Storing the complete honey batch record off-chain and anchoring its cryptographic
 * SHA-256 hash on-chain ensures tamper-evidence and data integrity without incurring
 * prohibitive gas costs or storing private farm records publicly.
 */
contract HoneyChain {
    struct BatchRecord {
        string batchId;
        bytes32 recordHash;
        address registrant;
        uint256 timestamp;
        uint256 blockNumber;
        bool exists;
    }

    // Mapping from batchId => BatchRecord
    mapping(string => BatchRecord) private batches;

    // Track all registered batch IDs for enumeration and explorer
    string[] private registeredBatchIds;

    // Events
    event BatchRegistered(
        string indexed indexedBatchId,
        string batchId,
        bytes32 recordHash,
        address indexed registrant,
        uint256 timestamp,
        uint256 blockNumber
    );

    error BatchAlreadyExists(string batchId);
    error BatchNotFound(string batchId);
    error EmptyBatchId();
    error InvalidHash();

    /**
     * @notice Register a honey batch with its canonical SHA-256 hash
     * @param batchId Unique identifier for the batch (e.g. HNY-2026-001)
     * @param recordHash Cryptographic SHA-256 hash (bytes32) of the canonical batch record
     */
    function registerBatch(string calldata batchId, bytes32 recordHash) external {
        if (bytes(batchId).length == 0) revert EmptyBatchId();
        if (recordHash == bytes32(0)) revert InvalidHash();
        if (batches[batchId].exists) revert BatchAlreadyExists(batchId);

        batches[batchId] = BatchRecord({
            batchId: batchId,
            recordHash: recordHash,
            registrant: msg.sender,
            timestamp: block.timestamp,
            blockNumber: block.number,
            exists: true
        });

        registeredBatchIds.push(batchId);

        emit BatchRegistered(
            batchId,
            batchId,
            recordHash,
            msg.sender,
            block.timestamp,
            block.number
        );
    }

    /**
     * @notice Verify if a given record hash matches the registered hash on-chain
     * @param batchId The batch identifier to verify
     * @param recordHash The recomputed canonical SHA-256 hash
     * @return isMatch True if hash matches the on-chain registered record
     * @return registeredHash The actual hash stored on-chain
     * @return timestamp When the batch was registered
     * @return registrant Address of the account that registered the batch
     * @return blockNumber The block in which the batch was anchored
     */
    function verifyBatch(string calldata batchId, bytes32 recordHash) external view returns (
        bool isMatch,
        bytes32 registeredHash,
        uint256 timestamp,
        address registrant,
        uint256 blockNumber
    ) {
        if (!batches[batchId].exists) revert BatchNotFound(batchId);
        
        BatchRecord memory rec = batches[batchId];
        return (
            rec.recordHash == recordHash,
            rec.recordHash,
            rec.timestamp,
            rec.registrant,
            rec.blockNumber
        );
    }

    /**
     * @notice Retrieve batch record information
     */
    function getBatch(string calldata batchId) external view returns (BatchRecord memory) {
        if (!batches[batchId].exists) revert BatchNotFound(batchId);
        return batches[batchId];
    }

    /**
     * @notice Check if a batch ID exists
     */
    function batchExists(string calldata batchId) external view returns (bool) {
        return batches[batchId].exists;
    }

    /**
     * @notice Get total number of registered batches
     */
    function getTotalBatches() external view returns (uint256) {
        return registeredBatchIds.length;
    }

    /**
     * @notice Get all registered batch IDs
     */
    function getAllBatchIds() external view returns (string[] memory) {
        return registeredBatchIds;
    }
}
