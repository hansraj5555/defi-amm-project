// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/Token.sol";
import "../contracts/AMM.sol";

contract AMMTest is Test {
    Token token;
    AMM amm;
    address user = address(1);

    function setUp() public {
        token = new Token(1_000_000);
        amm = new AMM(address(token));

        token.transfer(user, 1000 ether);
        vm.deal(user, 10 ether);
    }

    function testAddLiquidity() public {
        vm.startPrank(user);
        token.approve(address(amm), 500 ether);
        amm.addLiquidity{value: 1 ether}(500 ether);
        vm.stopPrank();

        assertEq(amm.ethReserve(), 1 ether);
    }

    function testSwap() public {
        vm.startPrank(user);
        token.approve(address(amm), 500 ether);
        amm.addLiquidity{value: 1 ether}(500 ether);
        amm.swapEthForToken{value: 0.1 ether}();
        vm.stopPrank();
    }
}
