// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * Wrapped BOLT (wBOLT) — ERC-20 representation of BOLT on Monad.
 *
 * The coordinator is the owner and mints wBOLT when workers complete jobs.
 * Custodial model: coordinator mints to itself, tracks per-worker balances off-chain.
 * Workers can claim wBOLT to their own EVM address in a future update.
 *
 * Decimals = 9 to match BOLT SPL token on Solana.
 */
contract WrappedBolt is ERC20, Ownable {
    constructor() ERC20("Wrapped BOLT", "wBOLT") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 9;
    }
}
