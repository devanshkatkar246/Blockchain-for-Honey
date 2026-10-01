import { createCanonicalBatch, computeSha256 } from './crypto';
import contractConfig from '../contracts/HoneyChain.json';

export const initialBatches = [
  {
    batchId: "HNY-2026-001",
    beekeeper: "Rajesh Kumar",
    apiary: "Ahmedabad Apiary 01",
    hive: "Hive A-12",
    harvestDate: "2026-09-23",
    floralSource: "Mustard",
    quantity: "185 kg",
    processingUnit: "Honey Processing Unit 01",
    qualityReference: "LAB-HNY-001",
    batchDescription: "Premium mustard-floral honey harvested from registered apiary.",
    status: "Verified",
    blockchainAnchored: true,
    blockNumber: 1842,
    txHash: "0x91ab73de5891e4fbc872a4d3209bf19412a87c10b784e93051a87e51f89312ab",
    registrant: "0x7A234BCa8f4B99c1584985b9856A9D71018891F2",
    timestamp: "23 Sep 2026, 11:42 AM",
    anchorTimestamp: 1790163720000
  },
  {
    batchId: "HNY-2026-002",
    beekeeper: "Priya Sharma",
    apiary: "Shimla Valley Apiary 04",
    hive: "Hive S-08",
    harvestDate: "2026-09-20",
    floralSource: "Eucalyptus",
    quantity: "120 kg",
    processingUnit: "Alpine Honey Processing Unit",
    qualityReference: "LAB-HNY-002",
    batchDescription: "Cold-pressed eucalyptus floral honey from high-altitude apiary.",
    status: "Verified",
    blockchainAnchored: true,
    blockNumber: 1848,
    txHash: "0x38fe2109bc47da153841a0942bf9187421ac942851941031958bca782910fae1",
    registrant: "0x9F3389dCA84601A24C9e21708AbDe83748293910",
    timestamp: "20 Sep 2026, 04:15 PM",
    anchorTimestamp: 1789906500000
  },
  {
    batchId: "HNY-2026-003",
    beekeeper: "Amit Patel",
    apiary: "Sundarbans Apiary 02",
    hive: "Hive SB-03",
    harvestDate: "2026-09-28",
    floralSource: "Acacia",
    quantity: "210 kg",
    processingUnit: "Mangrove Processing Hub",
    qualityReference: "LAB-HNY-003",
    batchDescription: "Raw monofloral acacia honey with light golden coloration.",
    status: "Pending",
    blockchainAnchored: false,
    blockNumber: null,
    txHash: null,
    registrant: null,
    timestamp: "28 Sep 2026, 09:30 AM",
    anchorTimestamp: null
  }
];

// Precompute canonical hashes for the preloaded records
initialBatches.forEach(batch => {
  const { compactCanonicalString } = createCanonicalBatch(batch);
  batch.canonicalHash = computeSha256(compactCanonicalString);
  if (batch.blockchainAnchored) {
    batch.registeredHash = batch.canonicalHash;
  }
});

// If deployed on local node, sync actual on-chain transaction hashes
if (contractConfig.initialBatches && Array.isArray(contractConfig.initialBatches)) {
  contractConfig.initialBatches.forEach(init => {
    const target = initialBatches.find(b => b.batchId === init.batchId);
    if (target) {
      if (init.txHash) target.txHash = init.txHash;
      if (init.blockNumber) target.blockNumber = init.blockNumber;
      if (init.hash) target.registeredHash = init.hash;
    }
  });
}
