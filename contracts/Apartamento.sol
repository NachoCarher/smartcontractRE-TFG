// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Apartamento is ERC20 {

    uint public balance;

    constructor() ERC20("ContratoApartamento", "APRTM") {
        // Asignar 100 tokens (100% de las acciones del piso) al propietario del contrato 
        super._mint(_msgSender(), 100);
        console.log("Desplegando contrato Apartamento");
    }

    receive() external payable {
        console.log("Recibiendo tokens");
        balance += msg.value;
    }

    // funcion para retirar fondos (transfiere en función del porcentaje de acciones del apartamento)
    // sólo la puede llamar quien tenga más de 0 tokens
    function retirar() public {
        require(this.balanceOf(msg.sender) > 0, "No autorizado para retirar fondos");

        uint cantidadDeRetirada = address(this).balance / 100 * this.balanceOf(msg.sender);
        balance = balance - cantidadDeRetirada;
        payable(msg.sender).transfer(cantidadDeRetirada);
    }
}
