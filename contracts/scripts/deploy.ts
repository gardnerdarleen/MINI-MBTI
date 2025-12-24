import { ethers } from "hardhat";

async function main() {
  console.log("Deploying MiniMBTI contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const MiniMBTI = await ethers.getContractFactory("MiniMBTI");
  const contract = await MiniMBTI.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("MiniMBTI deployed to:", address);
  console.log("");
  console.log("Next steps:");
  console.log(`1. Verify: npx hardhat verify --network sepolia ${address}`);
  console.log(`2. Update frontend/lib/contract.ts with: "${address}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

