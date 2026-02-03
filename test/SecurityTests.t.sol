// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/AMM.sol";

contract SecurityTest is Test {
    AMM amm;

    function setUp() public {
        amm = new AMM(address(0x123));
    }

    function testFailZeroSwap() public {
        amm.swapEthForToken{value: 0}();
    }
}
