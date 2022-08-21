// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Apartamento is ERC20 {

    constructor() ERC20("ContratoApartamento", "APRTM") {
        // Asignar 100 tokens (100% de las acciones del piso) al propietario del contrato 
        super._mint(_msgSender(), 100);
        console.log("Desplegando contrato Apartamento");
    }
}