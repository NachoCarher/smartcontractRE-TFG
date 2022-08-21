import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
let propietario, Pedro, Juan, Marta;

describe("Apartamento", function () {

  // Caso de test 1
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

  // Caso de test 2
  it("Se debe poder transferir una cantidad de acciones a otro individuo", async () => {
    const Apartamento = await ethers.getContractFactory("Apartamento");
    const apartamento = await Apartamento.deploy();

    [propietario, Marta] = await ethers.getSigners();

    await apartamento.deployed();
    await apartamento.transfer(Marta.address, 40);

    expect(await apartamento.balanceOf(Marta.address)).to.equal(40);
    expect(await apartamento.balanceOf(propietario.address)).to.equal(60);
  })

  // Caso de test 3
  it("Se debe poder pagar el alquiler y despositarlo en ether en el contrato del apartamento", async () => {
    const Apartamento = await ethers.getContractFactory("Apartamento");
    const apartamento = await Apartamento.deploy();

    [propietario, Marta, Pedro] = await ethers.getSigners();

    await apartamento.deployed();

    // Un inquilino paga el alquiler y se desposita en ether en la direccion del contrato
    await Pedro.sendTransaction({
      to: apartamento.address,
      value: ethers.utils.parseEther("5")
    })

    // Se consulta el saldo del smart contract
    expect(await apartamento.balance()).to.equal(ethers.utils.parseEther("5"));
  })
  
  // Caso de test 4
  it("El propietario debe poder retirar los fondos pagados como alquiler", async () => {
    const Apartamento = await ethers.getContractFactory("Apartamento");
    const apartamento = await Apartamento.deploy();

    [propietario, Marta, Pedro] = await ethers.getSigners();

    await apartamento.deployed();
    await apartamento.transfer(Marta.address, 40);

    await Pedro.sendTransaction({
      to: apartamento.address,
      value: ethers.utils.parseEther("5")
    });

    const balancePropietarioPrerretirada = await propietario.getBalance();
    await apartamento.retirar();

    // El balance del propietario debe ser mayor que el balance antes de retirar
    expect((await propietario.getBalance()).gt(balancePropietarioPrerretirada)).to.be.true;

  })

  // Caso de test 5
  it("Otros inversores deben poder retirar los fondos pagados como alquiler", async () => {
    const Apartamento = await ethers.getContractFactory("Apartamento");
    const apartamento = await Apartamento.deploy();

    [propietario, Marta, Pedro] = await ethers.getSigners();

    await apartamento.deployed();
    await apartamento.transfer(Marta.address, 40);

    await Pedro.sendTransaction({
      to: apartamento.address,
      value: ethers.utils.parseEther("5")
    });

    const balanceMartaPrerretirada = await Marta.getBalance();
    await apartamento.connect(Marta).retirar();
    expect((await Marta.getBalance()).gt(balanceMartaPrerretirada)).to.be.true;
  })

  // Caso de test 6
  it("El intento de retirada por un no accionista debe ser revertido", async () => {
    const Apartamento = await ethers.getContractFactory("Apartamento");
    const apartamento = await Apartamento.deploy();

    [propietario, Marta, Pedro] = await ethers.getSigners();

    await apartamento.deployed();
    await apartamento.transfer(Marta.address, 40);

    await Pedro.sendTransaction({
      to: apartamento.address,
      value: ethers.utils.parseEther("5")
    });

    await expect(apartamento.connect(Pedro).retirar()).to.be.revertedWith("No autorizado para retirar fondos");
  })

  // Caso de test 7
  it("Un accionista debe retirar lo correspondiente a su cantidad de acciones sobre el inmueble", async () => {
    const Apartamento = await ethers.getContractFactory("Apartamento");
    const apartamento = await Apartamento.deploy();

    [propietario, Marta, Pedro] = await ethers.getSigners();

    await apartamento.deployed();
    await apartamento.transfer(Marta.address, 40);

    await Pedro.sendTransaction({
      to: apartamento.address,
      value: ethers.utils.parseEther("5")
    });

    const balanceMartaPrerretirada = await Marta.getBalance();

    await apartamento.connect(Marta).retirar();
    expect(await (await apartamento.balance()).eq(ethers.utils.parseEther("3"))).to.be.true;
    expect(await (await apartamento.balance()).gt(ethers.utils.parseEther("0"))).to.be.true;
    expect(await (await Marta.getBalance()).gt(balanceMartaPrerretirada)).to.be.true;
  })


});
