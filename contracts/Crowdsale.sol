// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "./Token.sol"; // importing Token Code

contract Crowdsale {
    address public owner; // Owner of crowdsale contract
    Token public token;
    uint256 public price;
    uint256 public maxTokens;
    uint256 public tokensSold;

    // need code - see import Token
    // need address - see State variable (contructor) of type token smart contract
    
    event Buy(uint256 amount, address buyer);
    event Finalize(uint256 tokenSold, uint256 ethRaised);

    constructor(
        Token _token,     //address of Token
        uint256 _price,
        uint256 _maxTokens
    ) {
        owner = msg.sender;
        token = _token;
        price = _price;
        maxTokens = _maxTokens;
    } 


    modifier onlyOwner() {
        require(msg.sender == owner, 'Caller is no the owner'); // Make sure only the Deployer can call this function
        _;   // do the requirement before the function body in finalize
    }
    
    receive() external payable {        // function is required when sending Ether
        uint256 amount = msg.value / price; // Formuala: Price = 100 Tokens/1 Ether **** 1 Ether == Tokens * Price
        buyTokens(amount * 1e18);
    }

    function buyTokens(uint256 _amount) public payable {    // payable tells Solidity we can send ether with this transaction to the smart contract. Can access this amount
        require(msg.value == (_amount / 1e18) * price); // msg.value is amount sent it with Payable function if 1 = 1000000000000000000
        require(token.balanceOf(address(this)) >= _amount);
        require(token.transfer(msg.sender, _amount));   //token.transfer is used to send Tokens

        tokensSold += _amount;

        emit Buy(_amount, msg.sender);
    }

    
    function setPrice(uint256 _price) public onlyOwner { // Set token Price only can be done by Owner
        price = _price;

    }

     // Send remaining Tokens to Cowdsale creator
    function finalize() public onlyOwner {   // onlyOwner modifier        
       require(token.transfer(owner, token.balanceOf(address(this))));

       // Send Ether to crowdsale creator        
       uint256 value = address(this).balance;     // Get Ether balance
       (bool sent, ) = owner.call{value: value }("");       // .call Current preferrred method to send Ether in Sol
       require(sent);

       emit Finalize(tokensSold, value);    
    }    
}
