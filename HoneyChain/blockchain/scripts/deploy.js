const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Canonical batch data for HNY-2026-001
const demoBatch1 = {
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

const demoBatch2 = {
  batchId: "HNY-2026-002",
  beekeeper: "Priya Sharma",
  apiary: "Shimla Valley Apiary 04",
  hive: "Hive S-08",
  harvestDate: "2026-09-20",
  floralSource: "Eucalyptus",
  quantity: "120 kg",
  processingUnit: "Alpine Honey Processing Unit",
  qualityReference: "LAB-HNY-002"
};

function computeCanonicalSha256(batchData) {
  // Sort keys alphabetically for canonical representation
  const sorted = {};
  Object.keys(batchData).sort().forEach(key => {
    sorted[key] = batchData[key];
  });
  const canonicalJson = JSON.stringify(sorted);
  const hash = crypto.createHash("sha256").update(canonicalJson).digest("hex");
  return "0x" + hash;
}

async function main() {
  console.log("----------------------------------------------------");
  console.log("HONEY CHAIN: Deploying Smart Contract to Local Node...");
  console.log("----------------------------------------------------");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer account:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH");

  const HoneyChain = await hre.ethers.getContractFactory("HoneyChain");
  const honeyChain = await HoneyChain.deploy();
  await honeyChain.waitForDeployment();

  const contractAddress = await honeyChain.getAddress();
  console.log(">> HoneyChain deployed successfully at:", contractAddress);

  // Pre-register Batch 1 and Batch 2
  const hash1 = computeCanonicalSha256(demoBatch1);
  console.log(`\nPre-registering Batch 1: ${demoBatch1.batchId}`);
  console.log(`Canonical Hash: ${hash1}`);
  let tx1 = await honeyChain.registerBatch(demoBatch1.batchId, hash1);
  let receipt1 = await tx1.wait();
  console.log(`Batch 1 anchored in Block #${receipt1.blockNumber}, Tx: ${receipt1.hash}`);

  const hash2 = computeCanonicalSha256(demoBatch2);
  console.log(`\nPre-registering Batch 2: ${demoBatch2.batchId}`);
  console.log(`Canonical Hash: ${hash2}`);
  let tx2 = await honeyChain.registerBatch(demoBatch2.batchId, hash2);
  let receipt2 = await tx2.wait();
  console.log(`Batch 2 anchored in Block #${receipt2.blockNumber}, Tx: ${receipt2.hash}`);

  // Export contract deployment info to frontend
  const frontendContractsDir = path.join(__dirname, "..", "..", "frontend", "src", "contracts");
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  const artifact = await hre.artifacts.readArtifact("HoneyChain");

  const deploymentData = {
    address: contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    initialBatches: [
      {
        batchId: demoBatch1.batchId,
        hash: hash1,
        txHash: receipt1.hash,
        blockNumber: receipt1.blockNumber
      },
      {
        batchId: demoBatch2.batchId,
        hash: hash2,
        txHash: receipt2.hash,
        blockNumber: receipt2.blockNumber
      }
    ],
    abi: artifact.abi
  };

  fs.writeFileSync(
    path.join(frontendContractsDir, "HoneyChain.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  console.log(`\nExported deployment info to: frontend/src/contracts/HoneyChain.json`);
  console.log("----------------------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment error:", error);
    process.exit(1);
  });
