// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint16, ebool, externalEuint16 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title MiniMBTI
 * @notice Simple personality test with FHE privacy
 * @dev 9 questions, 3 dimensions (Mind, Energy, Nature)
 *      Single euint16 input: 9 bits packed
 *      M: bits 0-2, E: bits 3-5, N: bits 6-8
 */
contract MiniMBTI is ZamaEthereumConfig {
    struct Scores {
        euint8 mScore; // Mind: 0-3
        euint8 eScore; // Energy: 0-3
        euint8 nScore; // Nature: 0-3
        bool hasResult;
    }

    mapping(address => Scores) private userScores;

    event AnswersSubmitted(address indexed user);

    /**
     * @notice Submit encrypted answers
     * @param packedAnswers 9 answers packed into euint16 (bits 0-8)
     * @param inputProof Proof for encrypted input
     */
    function submitAnswers(
        externalEuint16 packedAnswers,
        bytes calldata inputProof
    ) external {
        // Allow re-submission (no duplicate check)

        euint16 data = FHE.fromExternal(packedAnswers, inputProof);

        // Count bits for each dimension
        euint8 mScore = popcount3(data, 0); // bits 0-2
        euint8 eScore = popcount3(data, 3); // bits 3-5
        euint8 nScore = popcount3(data, 6); // bits 6-8

        // Allow access
        FHE.allowThis(mScore);
        FHE.allowThis(eScore);
        FHE.allowThis(nScore);

        FHE.allow(mScore, msg.sender);
        FHE.allow(eScore, msg.sender);
        FHE.allow(nScore, msg.sender);

        userScores[msg.sender] = Scores({
            mScore: mScore,
            eScore: eScore,
            nScore: nScore,
            hasResult: true
        });

        emit AnswersSubmitted(msg.sender);
    }

    /**
     * @notice Count 3 bits starting at position
     */
    function popcount3(euint16 data, uint8 startBit) internal returns (euint8) {
        euint8 count = FHE.asEuint8(0);
        
        for (uint8 i = 0; i < 3; i++) {
            uint16 mask = uint16(1 << (startBit + i));
            ebool isSet = FHE.ne(
                FHE.and(data, FHE.asEuint16(mask)), 
                FHE.asEuint16(0)
            );
            count = FHE.add(count, FHE.select(isSet, FHE.asEuint8(1), FHE.asEuint8(0)));
        }
        
        return count;
    }

    function hasResult(address user) external view returns (bool) {
        return userScores[user].hasResult;
    }

    function getScoreHandles() external view returns (
        bytes32 mScore,
        bytes32 eScore,
        bytes32 nScore
    ) {
        require(userScores[msg.sender].hasResult, "No result");
        return (
            FHE.toBytes32(userScores[msg.sender].mScore),
            FHE.toBytes32(userScores[msg.sender].eScore),
            FHE.toBytes32(userScores[msg.sender].nScore)
        );
    }
}
