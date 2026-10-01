const { expect } = require("chai");
const { ethers } = require("hardhat");
const crypto = require("crypto");

describe("HoneyChain Smart Contract", function () {
  let honeyChain;
  let owner;
  let addr1;

  const testBatch = {
    batchId: "HNY-2026-001",
    beekeeper: "Rajesh Kumar",
    apiary: "Ahmedabad Apiary 01",
    hive: "Hive A-12",
    harvestDate: "2026-09-23",
    floralSource: "Mustard",
    quantity: "185 kg",
    processingUnit: "Honey Processing Unit 01",
    qualityReference: "LAB-HNY-001"
  };

  function computeHash(batch) {
    const sorted = {};
    Object.keys(batch).sort().forEach(k => sorted[k] = batch[k]);
    return "0x" + crypto.createHash("sha256").update(JSON.stringify(sorted)).digest("hex");
  }

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const HoneyChain = await ethers.getContractFactory("HoneyChain");
    honeyChain = await HoneyChain.deploy();
    await honeyChain.waitForDeployment();
  });

  it("Should register a honey batch with valid SHA-256 hash", async function () {
    const hash = computeHash(testBatch);
    const tx = await honeyChain.registerBatch(testBatch.batchId, hash);
    const receipt = await tx.wait();

    expect(await honeyChain.batchExists(testBatch.batchId)).to.equal(true);
    expect(await honeyChain.getTotalBatches()).to.equal(1);

    const batch = await honeyChain.getBatch(testBatch.batchId);
    expect(batch.batchId).to.equal(testBatch.batchId);
    expect(batch.recordHash).to.equal(hash);
    expect(batch.registrant).to.equal(owner.address);
    expect(batch.exists).to.equal(true);
  });

  it("Should verify batch hash match correctly", async function () {
    const hash = computeHash(testBatch);
    await honeyChain.registerBatch(testBatch.batchId, hash);

    const [isMatch, registeredHash, timestamp, registrant, blockNumber] = 
      await honeyChain.verifyBatch(testBatch.batchId, hash);

    expect(isMatch).to.equal(true);
    expect(registeredHash).to.equal(hash);
  });

  it("Should detect mismatch if batch data has been modified", async function () {
    const originalHash = computeHash(testBatch);
    await honeyChain.registerBatch(testBatch.batchId, originalHash);

    // Modify quantity from 185 kg to 190 kg
    const tamperedBatch = { ...testBatch, quantity: "190 kg" };
    const tamperedHash = computeHash(tamperedBatch);

    expect(originalHash).to.not.equal(tamperedHash);

    const [isMatch, registeredHash] = await honeyChain.verifyBatch(testBatch.batchId, tamperedHash);
    expect(isMatch).to.equal(false);
    expect(registeredHash).to.equal(originalHash);
  });

  it("Should prevent duplicate registration of the same batch ID", async function () {
    const hash = computeHash(testBatch);
    await honeyChain.registerBatch(testBatch.batchId, hash);

    await expect(
      honeyChain.registerBatch(testBatch.batchId, hash)
    ).to.be.revertedWithCustomError(honeyChain, "BatchAlreadyExists");
  });

  it("Should revert on non-existent batch verification", async function () {
    const hash = computeHash(testBatch);
    await expect(
      honeyChain.verifyBatch("NON-EXISTENT", hash)
    ).to.be.revertedWithCustomError(honeyChain, "BatchNotFound");
  });
});
