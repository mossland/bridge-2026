import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  // Deploy OracleToken
  const OracleToken = await ethers.getContractFactory("OracleToken");
  const token = await OracleToken.deploy(deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("OracleToken deployed to:", tokenAddress);

  // Deploy OracleGovernance
  const OracleGovernance = await ethers.getContractFactory("OracleGovernance");
  const governance = await OracleGovernance.deploy();
  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  console.log("OracleGovernance deployed to:", governanceAddress);

  console.log("\nDeployment complete!");
  console.log("---");
  console.log("OracleToken:", tokenAddress);
  console.log("OracleGovernance:", governanceAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
