// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import "./IoraclePrice.sol";
import "./Ownable.sol";

contract vendingMachine is Ownable {
    uint public soda;
    IoraclePrice public priceOracle;

    event SodaPurchase(address buyer, uint quantity);

    constructor(address _addressOracle) {
        soda = 100;
        priceOracle = IoraclePrice(_addressOracle);
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function buySoda() public payable {
        uint _price = priceOracle.getPrice();
        require(msg.value == _price, "Incorrect Payment amount for Soda");
        require(soda > 0, "Soda, out of stock!");

        soda = soda - 1;
        emit SodaPurchase(msg.sender, 1);
    }

    function addStock(uint _soda) public onlyOwner {
        soda = soda + _soda;
    }

    function withdraw() public onlyOwner {
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");

        require(success, "Transfer failed");
    }
}
