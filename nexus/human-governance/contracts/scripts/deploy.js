const hre = require("hardhat");

async function main() {
  console.log("Deploying BridgeLog contract...");

  const BridgeLog = await hre.ethers.getContractFactory("BridgeLog");
  const bridgeLog = await BridgeLog.deploy();

  await bridgeLog.waitForDeployment();

  const address = await bridgeLog.getAddress();
  console.log("BridgeLog deployed to:", address);
  console.log("Admin:", await bridgeLog.admin());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });




