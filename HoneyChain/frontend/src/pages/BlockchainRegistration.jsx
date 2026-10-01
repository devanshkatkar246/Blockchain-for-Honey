import React, { useState } from 'react';
import { 
  Blocks, 
  CheckCircle2, 
  Wallet, 
  ArrowRight, 
  ExternalLink, 
  Copy, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { blockchainService } from '../utils/blockchainService';
import { truncate } from '../utils/crypto';
import contractConfig from '../contracts/HoneyChain.json';

export default function BlockchainRegistration({ 
  selectedBatch, 
  batches, 
  onBatchAnchored, 
  walletState, 
  onConnectWallet,
  simulationMode,
  setActiveTab,
  onSelectBatchForVerify
}) {
  const [currentBatch, setCurrentBatch] = useState(
    selectedBatch || batches.find(b => !b.blockchainAnchored) || batches[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [receiptData, setReceiptData] = useState(
    currentBatch?.blockchainAnchored ? {
      batchId: currentBatch.batchId,
      hash: currentBatch.registeredHash || currentBatch.canonicalHash,
      txHash: currentBatch.txHash || '0x91ab73de5891e4fbc872a4d3209bf19412a87c10b784e93051a87e51f89312ab',
      blockNumber: currentBatch.blockNumber || 1842,
      timestamp: currentBatch.timestamp || '23 Sep 2026, 11:42 AM',
      registrant: currentBatch.registrant || '0x7A234BCa8f4B99c1584985b9856A9D71018891F2',
      network: 'Local Test Network (Hardhat)',
      status: 'CONFIRMED'
    } : null
  );

  const handleSelectBatch = (batchId) => {
    const b = batches.find(item => item.batchId === batchId);
    if (b) {
      setCurrentBatch(b);
      setErrorMsg(null);
      if (b.blockchainAnchored) {
        setReceiptData({
          batchId: b.batchId,
          hash: b.registeredHash || b.canonicalHash,
          txHash: b.txHash,
          blockNumber: b.blockNumber,
          timestamp: b.timestamp,
          registrant: b.registrant,
          network: 'Local Test Network (Hardhat)',
          status: 'CONFIRMED'
        });
      } else {
        setReceiptData(null);
      }
    }
  };

  const handleAnchorOnChain = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      // 1. Check wallet connection if not in pure simulation
      if (!simulationMode && !walletState.account) {
        try {
          await onConnectWallet();
        } catch (e) {
          throw new Error('Please connect your MetaMask wallet to broadcast transaction.');
        }
      }

      // Configure service simulation mode
      blockchainService.useSimulationMode = simulationMode;

      // 2. Call Solidity smart contract
      const result = await blockchainService.registerBatchOnChain(
        currentBatch.batchId,
        currentBatch.canonicalHash,
        { latestBlock: 1848 }
      );

      // 3. Update receipt data state
      const confirmedReceipt = {
        batchId: currentBatch.batchId,
        hash: currentBatch.canonicalHash,
        txHash: result.txHash,
        blockNumber: result.blockNumber,
        timestamp: result.timestamp,
        registrant: result.registrant,
        network: walletState.networkName || 'Local Test Network (Hardhat)',
        gasUsed: result.gasUsed,
        status: 'CONFIRMED'
      };

      setReceiptData(confirmedReceipt);

      // 4. Update global batch record
      onBatchAnchored(currentBatch.batchId, {
        blockchainAnchored: true,
        status: 'Verified',
        registeredHash: currentBatch.canonicalHash,
        txHash: result.txHash,
        blockNumber: result.blockNumber,
        registrant: result.registrant,
        timestamp: result.timestamp
      });

      // 5. Confetti celebration!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F4B942', '#D98E04', '#10B981', '#0B1F33']
      });

    } catch (err) {
      console.error('Anchoring error:', err);
      setErrorMsg(err.message || 'Failed to anchor batch on blockchain.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="content-area">
      {/* Page Title */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy)' }}>
          Blockchain Registration
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Anchor cryptographic SHA-256 batch hashes onto the Ethereum smart contract ledger.
        </p>
      </div>

      {/* Batch Selector Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-navy)' }}>
              Select Batch to Anchor:
            </span>
            <select 
              className="form-select"
              value={currentBatch?.batchId || ''}
              onChange={(e) => handleSelectBatch(e.target.value)}
              style={{ minWidth: '220px', fontWeight: 600 }}
            >
              {batches.map(b => (
                <option key={b.batchId} value={b.batchId}>
                  {b.batchId} - {b.beekeeper} ({b.blockchainAnchored ? 'Anchored' : 'Ready to Anchor'})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Smart Contract Address:</span>
            <span className="hash-pill" style={{ fontSize: '0.75rem' }}>
              {contractConfig.address}
            </span>
          </div>
        </div>
      </div>

      {/* Batch Ready to Anchor Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Blocks size={19} color="#D98E04" />
            <span>Target Batch: {currentBatch?.batchId}</span>
          </div>
          <div>
            {currentBatch?.blockchainAnchored ? (
              <span className="badge badge-verified">
                <CheckCircle2 size={13} />
                BLOCKCHAIN ANCHORED
              </span>
            ) : (
              <span className="badge badge-pending">
                <Clock size={13} />
                READY TO ANCHOR
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>BEEKEEPER</div>
            <div style={{ fontWeight: 700, color: 'var(--color-navy)', fontSize: '0.95rem' }}>{currentBatch?.beekeeper}</div>
          </div>
          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>FLORAL SOURCE & QUANTITY</div>
            <div style={{ fontWeight: 700, color: 'var(--color-navy)', fontSize: '0.95rem' }}>{currentBatch?.floralSource} ({currentBatch?.quantity})</div>
          </div>
          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>QUALITY LAB REF</div>
            <div style={{ fontWeight: 700, color: 'var(--color-navy)', fontSize: '0.95rem' }}>{currentBatch?.qualityReference}</div>
          </div>
        </div>

        {/* Prominent SHA-256 Hash Display */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-navy)', textTransform: 'uppercase' }}>
              Canonical SHA-256 Digest to Anchor (bytes32):
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Immutable Payload
            </span>
          </div>

          <div className="hash-box-prominent">
            <span>{currentBatch?.canonicalHash}</span>
          </div>
        </div>

        {/* Error notification if any */}
        {errorMsg && (
          <div style={{
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            color: '#B91C1C',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
            {walletState.account ? (
              <span>Broadcasting from: <strong>{truncate(walletState.account, 6, 4)}</strong> ({walletState.networkName || 'Local Hardhat'})</span>
            ) : (
              <span>Wallet not connected. Clicking anchor will prompt MetaMask connection.</span>
            )}
          </div>

          <button 
            className="btn-primary"
            onClick={handleAnchorOnChain}
            disabled={isSubmitting}
            style={{ padding: '12px 24px', fontSize: '0.95rem' }}
          >
            <Blocks size={18} />
            {isSubmitting ? 'Confirming Transaction...' : 'ANCHOR ON BLOCKCHAIN'}
          </button>
        </div>
      </div>

      {/* Confirmed Success Card */}
      {receiptData && (
        <div className="card" style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)',
          borderColor: '#86EFAC',
          boxShadow: '0 8px 25px rgba(16, 185, 129, 0.12)'
        }}>
          <div className="card-header" style={{ borderBottomColor: '#BBF7D0' }}>
            <div className="card-title" style={{ color: '#065F46' }}>
              <CheckCircle2 size={22} color="#10B981" />
              <span>✓ BLOCKCHAIN ANCHORED</span>
            </div>
            <span className="badge badge-verified" style={{ background: '#10B981', color: '#FFFFFF' }}>
              {receiptData.status}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>BATCH ID</div>
              <div style={{ fontWeight: 800, color: 'var(--color-navy)', fontSize: '1.1rem', fontFamily: 'var(--font-mono)' }}>
                {receiptData.batchId}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>BLOCK NUMBER</div>
              <div style={{ fontWeight: 800, color: 'var(--color-navy)', fontSize: '1.1rem', fontFamily: 'var(--font-mono)' }}>
                #{receiptData.blockNumber}
              </div>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>RECORD SHA-256 HASH</div>
              <div className="hash-pill" style={{ background: '#FFFFFF', color: '#0B1F33', fontWeight: 600, fontSize: '0.85rem' }}>
                {receiptData.hash}
              </div>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>TRANSACTION HASH</div>
              <div className="hash-pill" style={{ background: '#FFFFFF', color: '#0B1F33', fontWeight: 600, fontSize: '0.85rem' }}>
                {receiptData.txHash}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>TIMESTAMP</div>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: '0.9rem' }}>
                {receiptData.timestamp}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>REGISTERED BY (SIGNER)</div>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>
                {receiptData.registrant}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>NETWORK</div>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: '0.9rem' }}>
                {receiptData.network}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>STATUS</div>
              <div style={{ fontWeight: 800, color: '#059669', fontSize: '0.95rem' }}>
                CONFIRMED ON ETHEREUM
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              className="btn-primary"
              onClick={() => {
                onSelectBatchForVerify(receiptData.batchId);
                setActiveTab('verification');
              }}
            >
              <ShieldCheck size={16} />
              Proceed to Verify Batch
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Visual Blockchain Explorer View */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Layers size={19} color="#0B1F33" />
            <span>Visual Blockchain Explorer</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
            Consensus Ledger View
          </span>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '16px' }}>
          Visualizing sequential cryptographic block linkage on the local Ethereum network:
        </p>

        <div className="blocks-visual-container">
          <div className="block-card">
            <div className="block-header">
              <span>BLOCK 1840</span>
              <span className="badge badge-anchored" style={{ color: '#F4B942', background: 'rgba(255,255,255,0.1)' }}>Parent</span>
            </div>
            <div className="block-meta">
              <span>Hash: 0x9812...73fe</span>
              <span>Validator: 0x000...001</span>
              <span>State: Finalized</span>
            </div>
          </div>

          <div className="block-connector">↓</div>

          <div className="block-card">
            <div className="block-header">
              <span>BLOCK 1841</span>
              <span className="badge badge-anchored" style={{ color: '#F4B942', background: 'rgba(255,255,255,0.1)' }}>Parent</span>
            </div>
            <div className="block-meta">
              <span>Hash: 0x48bb...19fa</span>
              <span>Txs: 2 Batch Records</span>
              <span>State: Finalized</span>
            </div>
          </div>

          <div className="block-connector">↓</div>

          <div className="block-card active">
            <div className="block-header">
              <span>BLOCK #{receiptData?.blockNumber || 1842}</span>
              <span className="badge badge-verified" style={{ background: '#10B981', color: '#FFFFFF' }}>Anchor Block</span>
            </div>
            <div className="block-meta">
              <span style={{ color: '#F4B942', fontWeight: 700 }}>BATCH: {currentBatch?.batchId}</span>
              <span>Tx: {truncate(receiptData?.txHash || '0x91ab73de...', 6, 4)}</span>
              <span>Gas: 48,219</span>
            </div>
          </div>

          <div className="block-connector">→</div>

          <div className="block-card payload-card">
            <div className="block-header">
              <span style={{ color: '#F4B942', fontWeight: 800 }}>{currentBatch?.batchId}</span>
              <span className="badge badge-verified" style={{ background: '#F4B942', color: '#0B1F33', fontWeight: 800 }}>
                Anchored
              </span>
            </div>
            <div className="block-meta">
              <span><strong>Payload:</strong> SHA-256 Digest</span>
              <span style={{ color: '#F4B942', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', wordBreak: 'break-all' }}>
                {truncate(currentBatch?.canonicalHash || '0x0de3954b...', 8, 6)}
              </span>
              <span><strong>Ledger:</strong> Verified On-Chain</span>
              <span style={{ color: '#10B981', fontWeight: 700 }}>✓ State: Confirmed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
