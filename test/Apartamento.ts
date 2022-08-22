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
    expect((await apartamento.balance()).eq(ethers.utils.parseEther("3"))).to.be.true;
    expect((await apartamento.balance()).gt(ethers.utils.parseEther("0"))).to.be.true;
    expect((await Marta.getBalance()).gt(balanceMartaPrerretirada)).to.be.true;
  })

  // Caso de test 8
  it("Un accionista no debe poder retirar más de una vez", async () => {
    const Apartamento = await ethers.getContractFactory("Apartamento");
    const apartamento = await Apartamento.deploy();

    [propietario, Marta, Pedro] = await ethers.getSigners();

    await apartamento.deployed();
    await apartamento.transfer(Marta.address, 40);

    await Pedro.sendTransaction({
      to: apartamento.address,
      value: ethers.utils.parseEther("5")
    });

    await apartamento.connect(Marta).retirar(); 
    await expect(apartamento.connect(Marta).retirar()).to.be.revertedWith("No hay fondos para retirar");
  })

  // Caso de test 9
  it("Un accionista puede retirar varias veces si hay nuevos ingresos entre los intentos", async () => {
    const Apartamento = await ethers.getContractFactory("Apartamento");
    const apartamento = await Apartamento.deploy();

    [propietario, Marta, Pedro, Juan] = await ethers.getSigners();

    await apartamento.deployed();
    await apartamento.transfer(Marta.address, 40);

    await Pedro.sendTransaction({
      to: apartamento.address,
      value: ethers.utils.parseEther("5")
    });

    await apartamento.connect(Marta).retirar(); 

    await Juan.sendTransaction({
      to: apartamento.address,
      value: ethers.utils.parseEther("3")
    });

    await expect(apartamento.connect(Marta).retirar()).not.to.be.revertedWith("No hay fondos para retirar");
  })

  // Caso de test 10
  it("Cada retirada debe ser calculada sobre los nuevos ingresos, no el balance total", async () => {
    const Apartamento = await ethers.getContractFactory("Apartamento");
    const apartamento = await Apartamento.deploy();

    [propietario, Marta, Pedro, Juan] = await ethers.getSigners();

    await apartamento.deployed();
    await apartamento.transfer(Marta.address, 40);

    const balanceInicial = await Marta.getBalance();

    // Pedro paga 5 ETH de alquiler
    await Pedro.sendTransaction({
      to: apartamento.address,
      value: ethers.utils.parseEther("5")
    });

    // Marta hace una retirada (40/100 * 5) = ~2 ETH
    await apartamento.connect(Marta).retirar(); 
    // Se guarda el balance de Marta después de la primera retirada
    const balancePostRetirada1 = await Marta.getBalance();

    // Juan pagas 3 ETH de alquiler
    await Juan.sendTransaction({
      to: apartamento.address,
      value: ethers.utils.parseEther("3")
    });

    // Marta hace una retirada (40/100 * nuevosIngresos(3)) = ~1.2 ETH
    await apartamento.connect(Marta).retirar();
    // Se guarda el balance de Marta después de la segunda retirada
    const balancePostRetirada2 = await Marta.getBalance();

    expect(balanceInicial.lt(balancePostRetirada1)).to.be.true;
    expect(balancePostRetirada1.lt(balancePostRetirada2)).to.be.true;

    /*
    Balance disponible apartamento:
    - Pedro paga el alquiler : 5 ETH
    - Marta retira 1º vez: 3 ETH
    - Juan paga el alquiler : 6 ETH
    - Marta retira 2º vez: 4.8 ETH
    */
    expect((await apartamento.balance()).eq(ethers.utils.parseEther("4.8"))).to.be.true;
  })
});
