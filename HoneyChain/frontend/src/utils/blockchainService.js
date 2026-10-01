import { ethers } from 'ethers';
import contractConfig from '../contracts/HoneyChain.json';

const CONTRACT_ADDRESS = contractConfig.address;
const CONTRACT_ABI = contractConfig.abi;
const DEFAULT_RPC = "http://127.0.0.1:8545";

export class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.account = null;
    this.chainId = null;
    this.isMetaMaskAvailable = typeof window !== 'undefined' && Boolean(window.ethereum);
    this.useSimulationMode = false;
  }

  /**
   * Check if MetaMask is available in the browser
   */
  hasMetaMask() {
    return typeof window !== 'undefined' && Boolean(window.ethereum);
  }

  /**
   * Connect MetaMask wallet
   */
  async connectWallet() {
    if (!this.hasMetaMask()) {
      throw new Error('MetaMask is not detected. You can switch to Simulated Local Blockchain node for instant testing.');
    }

    try {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await this.provider.send('eth_requestAccounts', []);
      this.signer = await this.provider.getSigner();
      this.account = accounts[0];

      const network = await this.provider.getNetwork();
      this.chainId = Number(network.chainId);

      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);

      return {
        account: this.account,
        chainId: this.chainId,
        networkName: this.getNetworkName(this.chainId),
        isLocal: this.chainId === 31337 || this.chainId === 1337
      };
    } catch (err) {
      console.error('Wallet connection failed:', err);
      throw err;
    }
  }

  getNetworkName(chainId) {
    if (chainId === 31337 || chainId === 1337) return 'Local Test Network (Hardhat)';
    if (chainId === 11155111) return 'Sepolia Testnet';
    if (chainId === 1) return 'Ethereum Mainnet';
    return `Chain ID #${chainId}`;
  }

  /**
   * Register batch hash on blockchain
   */
  async registerBatchOnChain(batchId, hashHex, simulationFallbackState = null) {
    // Ensure 0x prefix for bytes32
    const formattedHash = hashHex.startsWith('0x') ? hashHex : `0x${hashHex}`;

    // If real wallet connected and not in forced simulation
    if (this.contract && this.signer && !this.useSimulationMode) {
      try {
        console.log(`Sending tx to register batch ${batchId}...`);
        const tx = await this.contract.registerBatch(batchId, formattedHash);
        const receipt = await tx.wait();

        return {
          success: true,
          txHash: receipt.hash,
          blockNumber: Number(receipt.blockNumber),
          registrant: this.account,
          timestamp: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          rawTimestamp: Math.floor(Date.now() / 1000),
          gasUsed: receipt.gasUsed ? receipt.gasUsed.toString() : '48,219',
          isSimulated: false
        };
      } catch (err) {
        console.warn('Real contract transaction failed or rejected. Falling back to simulation if enabled:', err);
        if (err.code === 'ACTION_REJECTED' || err.message?.includes('user rejected')) {
          throw new Error('Transaction rejected by user in MetaMask.');
        }
        if (err.message?.includes('BatchAlreadyExists')) {
          throw new Error(`Batch ID ${batchId} is already anchored on-chain!`);
        }
        // If contract not deployed at that address yet, provide helpful message
        throw err;
      }
    }

    // High-fidelity simulation mode for presentation if MetaMask or local node is offline
    const randomHex = Math.random().toString(16).substring(2, 10);
    const mockTxHash = `0x91ab${randomHex}5891e4fbc872a4d3209bf19412a87c10b784e93051a87e51f89312ab`.substring(0, 66);
    const mockBlock = (simulationFallbackState?.latestBlock || 1848) + 1;
    const mockRegistrant = this.account || '0x7A234BCa8f4B99c1584985b9856A9D71018891F2';

    return {
      success: true,
      txHash: mockTxHash,
      blockNumber: mockBlock,
      registrant: mockRegistrant,
      timestamp: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      rawTimestamp: Math.floor(Date.now() / 1000),
      gasUsed: '48,219',
      isSimulated: true
    };
  }

  /**
   * Verify batch on blockchain
   */
  async verifyBatchOnChain(batchId, currentHashHex, localAnchoredRecord = null) {
    const formattedHash = currentHashHex.startsWith('0x') ? currentHashHex : `0x${currentHashHex}`;

    if (this.contract && !this.useSimulationMode) {
      try {
        const result = await this.contract.verifyBatch(batchId, formattedHash);
        // returns [isMatch, registeredHash, timestamp, registrant, blockNumber]
        return {
          isMatch: Boolean(result[0]),
          registeredHash: result[1],
          currentHash: formattedHash,
          timestamp: Number(result[2]),
          registrant: result[3],
          blockNumber: Number(result[4]),
          exists: true
        };
      } catch (err) {
        console.warn('On-chain read error, checking local store:', err);
      }
    }

    // Local / preloaded verification fallback
    if (localAnchoredRecord) {
      const regHash = localAnchoredRecord.registeredHash || localAnchoredRecord.canonicalHash;
      const isMatch = regHash.toLowerCase() === formattedHash.toLowerCase();
      return {
        isMatch,
        registeredHash: regHash,
        currentHash: formattedHash,
        timestamp: localAnchoredRecord.anchorTimestamp || Date.now(),
        registrant: localAnchoredRecord.registrant || '0x7A234BCa8f4B99c1584985b9856A9D71018891F2',
        blockNumber: localAnchoredRecord.blockNumber || 1842,
        exists: true
      };
    }

    return {
      exists: false,
      isMatch: false,
      registeredHash: null,
      currentHash: formattedHash,
      error: `Batch ${batchId} is not anchored on the blockchain.`
    };
  }
}

export const blockchainService = new BlockchainService();
