const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.deploy(1000000);
  await token.deployed();
  console.log("Token deployed to:", token.address);

  const AMM = await hre.ethers.getContractFactory("AMM");
  const amm = await AMM.deploy(token.address);
  await amm.deployed();
  console.log("AMM deployed to:", amm.address);

  console.log('\nDeployment complete.');
  console.log('Token:', token.address);
  console.log('AMM:  ', amm.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
