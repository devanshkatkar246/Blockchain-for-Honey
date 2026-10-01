# HONEY CHAIN: Blockchain-Based Honey Traceability & Smart Beekeeping Management

> **SIH 2026 Problem Statement: PS 26021**  
> **Tagline:** *“Every Drop Has a Story. Make That Story Verifiable.”*  
> **Team:** Binary Brains  
> **Team ID:** PIEMR-SIH-26

---

## 🍯 Project Overview

**HONEY CHAIN** is a Web3 and blockchain prototype designed to solve supply chain fraud and adulteration in the beekeeping industry. By establishing a cryptographically anchored audit trail, HoneyChain allows apiaries, packaging facilities, accredited testing laboratories, and end consumers to verify that harvest records have not been tampered with since registration.

### Core Architectural Principle: Off-Chain Canonical Data + On-Chain Cryptographic Anchoring
- **Off-Chain Storage:** The comprehensive honey batch records (harvest dates, beekeeper info, floral sources, processing facilities, lab references) are maintained off-chain in canonical JSON form.
- **On-Chain Anchoring:** Only the **deterministic SHA-256 cryptographic hash (`bytes32`)** and batch identifier are recorded onto the immutable Ethereum blockchain smart contract.
- **Record Integrity:** Any single character modification (e.g., changing quantity from `185 kg` to `190 kg`) alters the SHA-256 hash completely (the avalanche effect), resulting in an immediate **⚠ MISMATCH** when cross-checked against the blockchain.

### What Blockchain Does & Does NOT Do
- **WHY BLOCKCHAIN?**
  > *“Blockchain provides tamper-evident anchoring for registered batch records.”*
- **WHAT BLOCKCHAIN DOES NOT DO:**
  > *“It does not independently prove honey purity or guarantee that user-entered data is truthful. Laboratory testing remains the basis for quality findings.”*

---

## 🚀 System Architecture & Primary Demo Flow

```
BATCH UPLOAD (honey_batch.json)
      ↓
CREATE BATCH RECORD
      ↓
GENERATE CANONICAL DATA (Deterministic Sorted Keys)
      ↓
GENERATE SHA-256 HASH (bytes32)
      ↓
CONNECT WEB3 WALLET (MetaMask)
      ↓
REGISTER HASH ON BLOCKCHAIN (HoneyChain.sol)
      ↓
SHOW TRANSACTION HASH & BLOCK NUMBER
      ↓
VERIFY BATCH
      ↓
HASH MATCH → ✓ VERIFIED
      ↓
TAMPER SIMULATION (185 kg → 190 kg)
      ↓
NEW SHA-256 ≠ BLOCKCHAIN HASH → ⚠ MISMATCH
```

---

## 📁 Repository Structure

```
HoneyChain/
│
├── blockchain/                      # Solidity Smart Contracts & Hardhat
│   ├── contracts/
│   │   └── HoneyChain.sol           # Core Anchor Smart Contract
│   ├── scripts/
│   │   └── deploy.js                # Deployment & Pre-seeding Script
│   ├── test/
│   │   └── HoneyChain.test.js       # Comprehensive Unit Tests (5/5 Passing)
│   ├── hardhat.config.cjs           # Hardhat Configuration
│   └── package.json
│
├── frontend/                        # React + Vite Web3 Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx          # AgriTech + Web3 Navigation
│   │   │   ├── TopNavbar.jsx        # Wallet & Network Status
│   │   │   └── VideoDemoGuide.jsx   # Interactive 13-step Presentation Checklist
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Metrics, Blocks, and Activity Ledger
│   │   │   ├── BatchUpload.jsx      # File Upload, Canonical Normalization, SHA-256
│   │   │   ├── BlockchainRegistration.jsx # MetaMask Anchoring & Block Explorer
│   │   │   ├── BatchVerification.jsx # Hash Comparison & Live Tamper Demo
│   │   │   └── PublicQrVerification.jsx # Consumer Jar QR Code Verification
│   │   ├── contracts/
│   │   │   └── HoneyChain.json      # Deployed ABI and Address
│   │   ├── utils/
│   │   │   ├── crypto.js            # Deterministic JSON & SHA-256
│   │   │   ├── blockchainService.js # Ethers.js & MetaMask Provider
│   │   │   └── preloadedData.js     # Preloaded SIH Demo Batches
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                # Premium AgriTech + Navy Gold Theme
│   ├── public/
│   │   └── honey_batch.json         # Downloadable Sample Batch File
│   └── package.json
│
└── README.md
```

---

## 🛠 Step-by-Step Setup & Quickstart

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v22)
- **MetaMask Extension** (optional for browser testing; prototype also includes an instant zero-friction simulated mode)

---

### 2. Smart Contract Setup & Local Blockchain

1. Navigate to the `blockchain` directory:
   ```bash
   cd blockchain
   npm install
   ```

2. Run smart contract unit tests to verify contract logic:
   ```bash
   npx hardhat test --config hardhat.config.cjs
   ```
   *Expected output: 5 passing tests.*

3. Start a local Ethereum blockchain node (in a dedicated terminal):
   ```bash
   npx hardhat node --config hardhat.config.cjs
   ```
   *This starts an RPC endpoint at `http://127.0.0.1:8545` with 20 pre-funded test accounts.*

4. In a second terminal, deploy the smart contract and pre-seed initial batches:
   ```bash
   cd blockchain
   npx hardhat run scripts/deploy.js --network localhost --config hardhat.config.cjs
   ```
   *This automatically deploys `HoneyChain.sol` to `0x5FbDB2315678afecb367f032d93F642f64180aa3` and exports the contract ABI to `frontend/src/contracts/HoneyChain.json`.*

---

### 3. Frontend Setup

1. Open a new terminal in the `frontend` directory:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Access the application at `http://localhost:5173`.*

---

### 4. MetaMask Configuration (For Real On-Chain Mode)

1. Open the MetaMask extension in your browser.
2. Add a new network manually:
   - **Network Name**: Hardhat Localhost
   - **New RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
3. Import one of Hardhat's private keys (e.g. Account #0: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`).

> **Tip:** If demonstrating offline or without MetaMask, the dashboard includes a top-right **"Simulated Local Chain (#31337)"** switch that executes the exact same cryptographic flow with zero friction.

---

## 🎬 2–4 Minute Video Demo Guide (13 Steps)

Follow this sequence during your presentation or evaluation recording:

| Step | Action | Expected Visual & Result |
|---|---|---|
| **Step 1** | Open Dashboard | Display HoneyChain metrics (128 batches, 116 anchored), recent activity, and blockchain ledger. |
| **Step 2** | Click **Batch Upload** | Navigate to the "Create Honey Batch" registration page. |
| **Step 3** | Load JSON | Click **"Load Sample JSON (HNY-2026-001)"** or upload `honey_batch.json`. |
| **Step 4** | Show Parsed Information | View the parsed metadata and inspect the **Canonical Normalized JSON** display. |
| **Step 5** | Generate SHA-256 Hash | Click **"Generate SHA-256 Hash"** → Prominent cryptographic hash appears with status `READY FOR BLOCKCHAIN`. |
| **Step 6** | Connect Wallet | Click **"Connect MetaMask"** in top navbar → Status updates to connected address on Local Test Network. |
| **Step 7** | Anchor on Blockchain | In the **Blockchain** tab, select `HNY-2026-001` and click **"ANCHOR ON BLOCKCHAIN"**. |
| **Step 8** | Confirm MetaMask Tx | Confirm the signature in MetaMask (or view the simulated block submission). |
| **Step 9** | Confirmed Card & Confetti | Celebratory confetti triggers! Success card displays: **✓ BLOCKCHAIN ANCHORED** with Tx Hash, Block #, and Timestamp. |
| **Step 10** | Open Verification | Click **"Proceed to Verify Batch"** or navigate to the **Verification** tab. |
| **Step 11** | Verify `HNY-2026-001` | Click **"VERIFY BATCH"** → Green banner appears: **✓ VERIFIED: HASH MATCH** (Registered Hash = Current Hash). |
| **Step 12** | Demonstrate Tampering | In the Tamper Simulator, click **"Modify Quantity: 185 kg → 190 kg"** → Red alert triggers immediately: **⚠ MISMATCH: HASH MISMATCH** with visual diff and explanation. Click **"Restore"** to return to verified state. |
| **Step 13** | Public QR Verification | Navigate to **QR Verification** tab → Display consumer honey jar label with real dynamic QR code, origin details, and purity disclaimer. |

---

## 🔒 Smart Contract Specification (`HoneyChain.sol`)

- `registerBatch(string batchId, bytes32 recordHash)`:
  Anchors a new batch hash. Prevents accidental duplicate registration of the same batch ID. Emits `BatchRegistered` event.
- `verifyBatch(string batchId, bytes32 recordHash)`:
  Queries on-chain registry, compares stored hash against candidate hash, and returns `[isMatch, registeredHash, timestamp, registrant, blockNumber]`.
- `getBatch(string batchId)`:
  Returns full on-chain metadata struct (`BatchRecord`).
- `getTotalBatches()` & `getAllBatchIds()`:
  Enables enumerable blockchain tracking.

---

## 👥 Team Details
- **Team Name**: Binary Brains
- **Team ID**: PIEMR-SIH-26
- **Problem Statement**: PS 26021
- **Event**: Smart India Hackathon 2026
