// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/Token.sol";
import "../contracts/AMM.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        Token token = new Token(1_000_000);
        AMM amm = new AMM(address(token));

        vm.stopBroadcast();
    }
}
