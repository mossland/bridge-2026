// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title OracleToken
 * @notice Governance token for BRIDGE 2026 / ORACLE
 * @dev ERC20 with voting capabilities (ERC20Votes) and permit (ERC20Permit)
 */
contract OracleToken is ERC20, ERC20Permit, ERC20Votes, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18; // 1 billion tokens

    constructor(
        address initialOwner
    )
        ERC20("Oracle Governance Token", "ORACLE")
        ERC20Permit("Oracle Governance Token")
        Ownable(initialOwner)
    {
        // Mint initial supply to owner
        _mint(initialOwner, MAX_SUPPLY);
    }

    /**
     * @notice Get the voting power of an account at a specific block
     * @param account The address to check
     * @param blockNumber The block number to check at
     */
    function getPastVotingPower(
        address account,
        uint256 blockNumber
    ) external view returns (uint256) {
        return getPastVotes(account, blockNumber);
    }

    /**
     * @notice Get current voting power of an account
     * @param account The address to check
     */
    function getVotingPower(address account) external view returns (uint256) {
        return getVotes(account);
    }

    // Required overrides for ERC20Votes

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    function nonces(
        address owner
    ) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
