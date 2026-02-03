// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address, address, uint256) external returns (bool);
    function transfer(address, uint256) external returns (bool);
}

contract AMM {
    IERC20 public token;

    uint256 public tokenReserve;
    uint256 public ethReserve;

    mapping(address => uint256) public liquidity;
    uint256 public totalLiquidity;

    error ZeroAmount();
    error InsufficientLiquidity();

    constructor(address _token) {
        token = IERC20(_token);
    }

    function addLiquidity(uint256 tokenAmount) external payable {
        if (tokenAmount == 0 || msg.value == 0) revert ZeroAmount();

        token.transferFrom(msg.sender, address(this), tokenAmount);

        liquidity[msg.sender] += msg.value;
        totalLiquidity += msg.value;

        tokenReserve += tokenAmount;
        ethReserve += msg.value;
    }

    function swapEthForToken() external payable {
        if (msg.value == 0) revert ZeroAmount();

        uint256 tokenOut = getAmountOut(msg.value, ethReserve, tokenReserve);
        if (tokenOut == 0) revert InsufficientLiquidity();

        ethReserve += msg.value;
        tokenReserve -= tokenOut;

        token.transfer(msg.sender, tokenOut);
    }

    function getAmountOut(
        uint256 input,
        uint256 inputReserve,
        uint256 outputReserve
    ) public pure returns (uint256) {
        uint256 inputWithFee = input * 997;
        uint256 numerator = inputWithFee * outputReserve;
        uint256 denominator = (inputReserve * 1000) + inputWithFee;
        return numerator / denominator;
    }

    receive() external payable {}
}
