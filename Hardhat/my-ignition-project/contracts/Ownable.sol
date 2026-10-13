// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract Ownable{

    address public owner;

    constructor(){
        owner = msg.sender;
    }

    event OwnerShipTransfer(address indexed previousOwner,address indexed newOwner);

    modifier onlyOwner(){
        require(msg.sender==owner,"You are not the owner");
        _;
    }

    function transferOwnerShip(address _newOwner) public virtual onlyOwner{
        require(_newOwner!=address(0),"Invalid address");
        
        emit OwnerShipTransfer(owner, _newOwner);
        owner = _newOwner;

    }
}