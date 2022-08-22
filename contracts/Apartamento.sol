// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Apartamento is ERC20 {

    uint public balance;
    uint public ingresosTotales;
    mapping(address => uint) registroRetirada;

    constructor() ERC20("ContratoApartamento", "APRTM") {
        // Asignar 100 tokens (100% de las acciones del piso) al propietario del contrato 
        super._mint(_msgSender(), 100);
        console.log("Desplegando contrato Apartamento");
    }

    receive() external payable {
        balance += msg.value;
        ingresosTotales += msg.value;
    }

    // funcion para retirar fondos (transfiere en función del porcentaje de acciones del apartamento)
    // sólo la puede llamar quien tenga más de 0 tokens y si no tiene registro de retirada
    function retirar() public {
        require(this.balanceOf(msg.sender) > 0, "No autorizado para retirar fondos");
        require(ingresosTotales > registroRetirada[msg.sender], "No hay fondos para retirar");

        uint cantidadDeRetirada = (ingresosTotales - registroRetirada[msg.sender]) / 100 * this.balanceOf(msg.sender);
        balance = balance - cantidadDeRetirada;
        registroRetirada[msg.sender] = ingresosTotales;
        payable(msg.sender).transfer(cantidadDeRetirada);
    }
}
