import { ethers } from 'ethers';

/**
 * Normalizes batch data into a deterministic canonical object.
 * Keys are ordered alphabetically and stripped of whitespace.
 */
export function createCanonicalBatch(batchData) {
  if (!batchData || typeof batchData !== 'object') {
    throw new Error('Invalid batch data object');
  }

  // Key fields defined by the HoneyChain protocol
  const canonicalKeys = [
    'apiary',
    'batchId',
    'beekeeper',
    'floralSource',
    'harvestDate',
    'hive',
    'processingUnit',
    'qualityReference',
    'quantity'
  ];

  const canonicalObj = {};
  for (const key of canonicalKeys) {
    if (batchData[key] !== undefined && batchData[key] !== null) {
      canonicalObj[key] = String(batchData[key]).trim();
    } else {
      canonicalObj[key] = '';
    }
  }

  // Also include optional description if present
  if (batchData.batchDescription) {
    canonicalObj.batchDescription = String(batchData.batchDescription).trim();
  }

  // Sort keys alphabetically
  const sortedObj = {};
  Object.keys(canonicalObj).sort().forEach(k => {
    sortedObj[k] = canonicalObj[k];
  });

  const canonicalString = JSON.stringify(sortedObj, null, 2);
  const compactCanonicalString = JSON.stringify(sortedObj);

  return {
    sortedObj,
    canonicalString,
    compactCanonicalString
  };
}

/**
 * Computes SHA-256 hash using ethers.js / Web Crypto API.
 * Returns 0x-prefixed 64-hex character string (32 bytes).
 */
export function computeSha256(canonicalString) {
  try {
    const utf8Bytes = ethers.toUtf8Bytes(canonicalString);
    const hash = ethers.sha256(utf8Bytes);
    return hash; // 0x...
  } catch (err) {
    console.error('Error computing SHA-256:', err);
    throw err;
  }
}

/**
 * Formats a long hash or address for clean UI display.
 */
export function truncate(str, lead = 6, tail = 4) {
  if (!str) return '';
  if (str.length <= lead + tail) return str;
  return `${str.slice(0, lead)}...${str.slice(-tail)}`;
}
