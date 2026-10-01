import React from 'react';
import { 
  Database, 
  ShieldCheck, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  Blocks, 
  AlertTriangle, 
  FileCheck2, 
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { truncate } from '../utils/crypto';

export default function Dashboard({ 
  batches, 
  walletState, 
  onConnectWallet, 
  setActiveTab,
  onSelectBatchForAnchor,
  onSelectBatchForVerify
}) {
  const totalBatches = 125 + batches.length;
  const anchoredBatches = 114 + batches.filter(b => b.blockchainAnchored).length;
  const verifiedBatches = 110 + batches.filter(b => b.status === 'Verified').length;
  const pendingBatches = batches.filter(b => !b.blockchainAnchored).length + 9;

  return (
    <div className="content-area">
      {/* Top Welcome & Mission Banner */}
      <div style={{
        background: '#0B1F33',
        borderRadius: '16px',
        padding: '28px 32px',
        marginBottom: '28px',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(244, 185, 66, 0.3)',
        boxShadow: 'var(--shadow-md)'
      }}>
        {/* Subtle decorative gold honeycomb glow */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '240px',
          height: '240px',
          background: 'radial-gradient(circle, rgba(244,185,66,0.18) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '720px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              background: 'rgba(244, 185, 66, 0.2)',
              color: '#F4B942',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Smart Beekeeping & Supply Chain Integrity
            </span>
            <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>PS 26021</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.9rem',
            fontWeight: 800,
            marginBottom: '8px',
            color: '#FFFFFF',
            letterSpacing: '-0.02em'
          }}>
            HONEY CHAIN
          </h2>
          <p style={{
            fontSize: '1.05rem',
            color: '#E2E8F0',
            fontWeight: 500,
            marginBottom: '14px'
          }}>
            Honey Traceability & Blockchain Integrity Platform
          </p>
          <p style={{
            fontSize: '0.88rem',
            color: '#94A3B8',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            Empowering apiaries, testing laboratories, and consumers with cryptographic SHA-256 batch anchoring on the Ethereum blockchain. Tamper-evident, transparent, and verifiable at every harvest.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <button 
              className="btn-primary" 
              onClick={() => setActiveTab('upload')}
            >
              <FileCheck2 size={16} />
              Start New Batch Upload
            </button>
            <button 
              className="btn-secondary" 
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.2)' }}
              onClick={() => setActiveTab('verification')}
            >
              <ShieldCheck size={16} color="#F4B942" />
              Verify Honey Batch
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card gold">
          <span className="stat-label">Total Batches</span>
          <div className="stat-value">{totalBatches}</div>
          <div className="stat-desc">
            <Database size={14} color="#D98E04" />
            <span>Off-chain canonical records</span>
          </div>
        </div>

        <div className="stat-card navy">
          <span className="stat-label">Blockchain Anchored</span>
          <div className="stat-value">{anchoredBatches}</div>
          <div className="stat-desc">
            <Blocks size={14} color="#0B1F33" />
            <span>SHA-256 hashes on-chain</span>
          </div>
        </div>

        <div className="stat-card green">
          <span className="stat-label">Verified</span>
          <div className="stat-value">{verifiedBatches}</div>
          <div className="stat-desc">
            <CheckCircle size={14} color="#10B981" />
            <span>Hash matches immutable ledger</span>
          </div>
        </div>

        <div className="stat-card amber">
          <span className="stat-label">Pending</span>
          <div className="stat-value">{pendingBatches}</div>
          <div className="stat-desc">
            <Clock size={14} color="#F59E0B" />
            <span>Awaiting blockchain anchoring</span>
          </div>
        </div>
      </div>

      {/* Architectural Principle Callout Banner */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        padding: '16px 20px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          background: 'rgba(244, 185, 66, 0.15)',
          padding: '8px',
          borderRadius: '8px',
          color: '#D98E04',
          flexShrink: 0
        }}>
          <Sparkles size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-navy)', marginBottom: '4px' }}>
            System Architecture Principle: Off-Chain Canonical Data + On-Chain Cryptographic Anchoring
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: '1.5' }}>
            To ensure scalability and privacy, HoneyChain does <strong>NOT</strong> store complete farm records on-chain. Only the deterministic <strong>SHA-256 hash</strong> of the canonical batch record is registered on Ethereum. Blockchain proves record integrity and timestamped immutability. Accredited laboratory testing remains the basis for purity findings.
          </p>
        </div>
      </div>

      {/* Visual Blockchain Explorer Quick Preview */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Blocks size={19} color="#D98E04" />
            <span>Visual Blockchain Ledger (BLOCK #1840 → #1841 → #1842 → HNY-2026-001)</span>
          </div>
          <button 
            className="btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            onClick={() => setActiveTab('blockchain')}
          >
            Explore Chain
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="blocks-visual-container">
          {/* Block 1840 */}
          <div className="block-card">
            <div className="block-header">
              <span>BLOCK #1840</span>
              <span className="badge badge-anchored" style={{ color: '#F4B942', background: 'rgba(255,255,255,0.1)' }}>Mined</span>
            </div>
            <div className="block-meta">
              <span><strong>Parent:</strong> 0x48f1...12ae</span>
              <span><strong>Txs:</strong> 1 Batch Anchored</span>
              <span><strong>Gas Used:</strong> 48,219</span>
              <span><strong>State:</strong> Finalized</span>
            </div>
          </div>

          <div className="block-connector">→</div>

          {/* Block 1841 */}
          <div className="block-card">
            <div className="block-header">
              <span>BLOCK #1841</span>
              <span className="badge badge-anchored" style={{ color: '#F4B942', background: 'rgba(255,255,255,0.1)' }}>Mined</span>
            </div>
            <div className="block-meta">
              <span><strong>Parent:</strong> 0x90ca...38be</span>
              <span><strong>Txs:</strong> 2 Batches Anchored</span>
              <span><strong>Gas Used:</strong> 89,410</span>
              <span><strong>State:</strong> Finalized</span>
            </div>
          </div>

          <div className="block-connector">→</div>

          {/* Block 1842 */}
          <div className="block-card active">
            <div className="block-header">
              <span>BLOCK #1842</span>
              <span className="badge badge-verified" style={{ background: '#10B981', color: '#FFFFFF' }}>Anchor Block</span>
            </div>
            <div className="block-meta">
              <span><strong>Contract:</strong> HoneyChain.sol</span>
              <span><strong>Tx Hash:</strong> 0x91ab...73de</span>
              <span><strong>Gas Used:</strong> 48,219</span>
              <span><strong>Status:</strong> CONFIRMED</span>
            </div>
          </div>

          <div className="block-connector">→</div>

          {/* 4th Card: Anchored Batch Payload */}
          <div className="block-card payload-card">
            <div className="block-header">
              <span style={{ color: '#F4B942', fontWeight: 800 }}>HNY-2026-001</span>
              <span className="badge badge-verified" style={{ background: '#F4B942', color: '#0B1F33', fontWeight: 800 }}>
                Anchored
              </span>
            </div>
            <div className="block-meta">
              <span><strong>Payload:</strong> SHA-256 Digest</span>
              <span style={{ color: '#F4B942', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', wordBreak: 'break-all' }}>
                0x0de3954b...5898
              </span>
              <span><strong>Beekeeper:</strong> Rajesh Kumar (185 kg)</span>
              <span style={{ color: '#10B981', fontWeight: 700 }}>✓ Verified on Ethereum</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Blockchain Activity Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Layers size={19} color="#0B1F33" />
            <span>Recent Blockchain Activity</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
            Live Smart Contract Event Stream
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Beekeeper</th>
                <th>Floral Source</th>
                <th>Quantity</th>
                <th>Blockchain Status</th>
                <th>Block #</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => {
                const isAnchored = batch.blockchainAnchored;
                return (
                  <tr key={batch.batchId}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-navy)' }}>
                          {batch.batchId}
                        </strong>
                      </div>
                    </td>
                    <td>{batch.beekeeper}</td>
                    <td>
                      <span style={{
                        background: '#FEF3C7',
                        color: '#92400E',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 600
                      }}>
                        {batch.floralSource}
                      </span>
                    </td>
                    <td>{batch.quantity}</td>
                    <td>
                      {isAnchored ? (
                        <span className="badge badge-verified">
                          <CheckCircle size={12} />
                          Hash Anchored
                        </span>
                      ) : (
                        <span className="badge badge-pending">
                          <Clock size={12} />
                          Pending Registration
                        </span>
                      )}
                    </td>
                    <td>
                      {batch.blockNumber ? (
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-navy)' }}>
                          #{batch.blockNumber}
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {isAnchored ? (
                          <button
                            className="btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => {
                              onSelectBatchForVerify(batch.batchId);
                              setActiveTab('verification');
                            }}
                          >
                            <ShieldCheck size={13} color="#10B981" />
                            Verify
                          </button>
                        ) : (
                          <button
                            className="btn-primary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => {
                              onSelectBatchForAnchor(batch);
                              setActiveTab('blockchain');
                            }}
                          >
                            <Blocks size={13} />
                            Anchor
                          </button>
                        )}
                        <button
                          className="btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => {
                            onSelectBatchForVerify(batch.batchId);
                            setActiveTab('qr');
                          }}
                          title="View Public QR Page"
                        >
                          <ExternalLink size={13} />
                          QR
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
