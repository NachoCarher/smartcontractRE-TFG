import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
let propietario, Pedro, Juan, Marta;

describe("Apartamento", function () {

  it("El creador del contrato debe tener 100 acciones del apartamento",async () => {
    const Apartamento = await ethers.getContractFactory("Apartamento");
    const apartamento = await Apartamento.deploy();

    // Usuarios que interactuan con el contrato y los se usan en el test
    [propietario] = await ethers.getSigners();

    // Se despliega el contrato en un entorno local
    await apartamento.deployed();
    let balancePropietario = await apartamento.balanceOf(propietario.address);

    expect(balancePropietario).to.equal(100);
  })

  it("Se debe poder transferir una cantidad de acciones a otro individuo", async () => {
    const Apartamento = await ethers.getContractFactory("Apartamento");
    const apartamento = await Apartamento.deploy();

    [propietario, Marta] = await ethers.getSigners();

    await apartamento.deployed();
    await apartamento.transfer(Marta.address, 40);
    expect(await apartamento.balanceOf(Marta.address)).to.equal(40);
    expect(await apartamento.balanceOf(propietario.address)).to.equal(60);
  })

  

});
