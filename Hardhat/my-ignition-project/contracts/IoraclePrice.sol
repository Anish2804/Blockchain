// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;


interface IoraclePrice{
    function getPrice() external view returns(uint); 
}