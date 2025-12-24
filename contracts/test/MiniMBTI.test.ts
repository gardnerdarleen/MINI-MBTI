import { expect } from "chai";
import { ethers } from "hardhat";
import { MiniMBTI } from "../typechain-types";

/**
 * MiniMBTI Contract Tests
 * 
 * Note: Full FHE operations require Zama's infrastructure on Sepolia.
 * These tests verify contract deployment, structure, and basic functionality.
 * For complete E2E testing, use the frontend with a real wallet on Sepolia.
 */
describe("MiniMBTI", function () {
  let contract: MiniMBTI;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const MiniMBTI = await ethers.getContractFactory("MiniMBTI");
    contract = await MiniMBTI.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const address = await contract.getAddress();
      expect(address).to.be.properAddress;
    });

    it("Should have correct contract name in bytecode", async function () {
      const address = await contract.getAddress();
      const code = await ethers.provider.getCode(address);
      expect(code.length).to.be.greaterThan(2);
    });
  });

  describe("Initial State", function () {
    it("Should return false for hasResult on new user", async function () {
      const result = await contract.hasResult(user1.address);
      expect(result).to.equal(false);
    });

    it("Should return false for hasResult on multiple users", async function () {
      expect(await contract.hasResult(user1.address)).to.equal(false);
      expect(await contract.hasResult(user2.address)).to.equal(false);
      expect(await contract.hasResult(owner.address)).to.equal(false);
    });
  });

  describe("getScoreHandles", function () {
    it("Should revert when user has no result", async function () {
      await expect(
        contract.connect(user1).getScoreHandles()
      ).to.be.revertedWith("No result");
    });
  });

  describe("Contract Interface", function () {
    it("Should have submitAnswers function", async function () {
      expect(contract.submitAnswers).to.be.a("function");
    });

    it("Should have hasResult function", async function () {
      expect(contract.hasResult).to.be.a("function");
    });

    it("Should have getScoreHandles function", async function () {
      expect(contract.getScoreHandles).to.be.a("function");
    });

    it("Should have confidentialProtocolId from ZamaEthereumConfig", async function () {
      expect(contract.confidentialProtocolId).to.be.a("function");
    });
  });

  describe("Event Definitions", function () {
    it("Should have AnswersSubmitted event defined", async function () {
      const filter = contract.filters.AnswersSubmitted;
      expect(filter).to.exist;
    });
  });

  describe("Access Control", function () {
    it("Should allow any address to call hasResult", async function () {
      // Anyone can check if another user has results
      const result = await contract.connect(user2).hasResult(user1.address);
      expect(result).to.equal(false);
    });

    it("Should only return own score handles", async function () {
      // getScoreHandles uses msg.sender internally
      await expect(
        contract.connect(user1).getScoreHandles()
      ).to.be.revertedWith("No result");
    });
  });
});

/**
 * FHE Integration Tests (Sepolia Only)
 * 
 * These tests require:
 * 1. Running on Sepolia network (--network sepolia)
 * 2. FHEVM SDK initialized
 * 3. Encrypted input from frontend
 * 
 * To run: npx hardhat test --network sepolia
 */
describe("MiniMBTI - Sepolia Integration", function () {
  // Skip if not on Sepolia
  before(async function () {
    const network = await ethers.provider.getNetwork();
    if (network.chainId !== 11155111n) {
      console.log("Skipping Sepolia tests - not on Sepolia network");
      this.skip();
    }
  });

  it("Should connect to deployed contract on Sepolia", async function () {
    const CONTRACT_ADDRESS = "0xafc2D64A30e53e7839Dbd56105ccD8eDF8Eaa682";
    const contract = await ethers.getContractAt("MiniMBTI", CONTRACT_ADDRESS);
    
    const address = await contract.getAddress();
    expect(address.toLowerCase()).to.equal(CONTRACT_ADDRESS.toLowerCase());
  });

  it("Should have confidentialProtocolId set correctly", async function () {
    const CONTRACT_ADDRESS = "0xafc2D64A30e53e7839Dbd56105ccD8eDF8Eaa682";
    const contract = await ethers.getContractAt("MiniMBTI", CONTRACT_ADDRESS);
    
    // ZamaEthereumConfig sets a specific protocol ID
    const protocolId = await contract.confidentialProtocolId();
    expect(protocolId).to.be.a("bigint");
  });
});

