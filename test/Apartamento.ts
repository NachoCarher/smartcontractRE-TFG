import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
let propietario, Pedro, Juan, Marta;

describe("Apartamento", function () {

  it("El creador del contrato debe tener 100 acciones del apartamento",async () => {
    const Apartamento = await ethers.getContractFactory("Apartamento");
    const apartamento = await Apartamento.deploy();

    // Usuarios que interactuan con el contrato y los se usan en los tests
    [propietario, Pedro, Juan, Marta] = await ethers.getSigners();

    // Se despliega el contrato en un entorno local
    await apartamento.deployed();
    let balancePropietario = await apartamento.balanceOf(propietario.address);

    expect(balancePropietario).to.equal(100);
  })
});