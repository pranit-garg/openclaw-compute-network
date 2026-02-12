// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {WrappedBolt} from "../src/WrappedBolt.sol";

/**
 * Deploy wBOLT ERC-20 to Monad testnet.
 *
 * Prerequisites:
 *   curl -L https://foundry.paradigm.xyz | bash && foundryup
 *   cd chain/monad/contracts
 *   forge install foundry-rs/forge-std --no-commit
 *   forge install OpenZeppelin/openzeppelin-contracts --no-commit
 *
 * Deploy:
 *   forge script script/DeployWrappedBolt.s.sol \
 *     --rpc-url https://testnet-rpc.monad.xyz \
 *     --broadcast \
 *     --private-key $ERC8004_PRIVATE_KEY
 *
 * After deploy: record the contract address in .env as WBOLT_CONTRACT
 */
contract DeployWrappedBolt is Script {
    function run() external {
        vm.startBroadcast();
        WrappedBolt wbolt = new WrappedBolt();
        console.log("wBOLT deployed at:", address(wbolt));
        console.log("Owner:", wbolt.owner());
        console.log("Decimals:", wbolt.decimals());
        vm.stopBroadcast();
    }
}
