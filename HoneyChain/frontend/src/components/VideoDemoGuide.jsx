import React, { useState } from 'react';
import { Video, ChevronDown, ChevronUp, Check, ArrowRight, Play } from 'lucide-react';

export default function VideoDemoGuide({ activeTab, setActiveTab }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const steps = [
    { num: 1, title: 'Open Dashboard', tab: 'dashboard', desc: 'View statistics, recent activity, and architecture principles' },
    { num: 2, title: 'Open Batch Upload', tab: 'upload', desc: 'Navigate to Create Honey Batch registration page' },
    { num: 3, title: 'Upload honey_batch.json', tab: 'upload', desc: 'Click "Load Sample JSON" or upload honey_batch.json' },
    { num: 4, title: 'View Parsed Batch', tab: 'upload', desc: 'Inspect parsed metadata and canonical deterministic structure' },
    { num: 5, title: 'Generate SHA-256', tab: 'upload', desc: 'Click "Generate SHA-256 Hash" to produce the cryptographic fingerprint' },
    { num: 6, title: 'Connect Wallet', tab: 'upload', desc: 'Connect MetaMask to Local Hardhat Test Network' },
    { num: 7, title: 'Click Anchor on Chain', tab: 'blockchain', desc: 'Navigate to Blockchain tab and click "ANCHOR ON BLOCKCHAIN"' },
    { num: 8, title: 'Confirm MetaMask Tx', tab: 'blockchain', desc: 'MetaMask prompts signature to call registerBatch() contract function' },
    { num: 9, title: 'View Anchored Card', tab: 'blockchain', desc: 'Inspect confirmed block number, transaction hash, and timestamp' },
    { num: 10, title: 'Open Verification', tab: 'verification', desc: 'Navigate to the dedicated batch verification page' },
    { num: 11, title: 'Verify HNY-2026-001', tab: 'verification', desc: 'Check current hash vs on-chain hash: Shows ✓ VERIFIED HASH MATCH' },
    { num: 12, title: 'Demonstrate Tampering', tab: 'verification', desc: 'Edit Quantity: 185 kg → 190 kg. Hash recomputes: Shows ⚠ MISMATCH' },
    { num: 13, title: 'Public QR Verification', tab: 'qr', desc: 'Show consumer honey jar QR code and public authenticity record' },
  ];

  return (
    <div style={{
      margin: '0 0 24px 0',
      background: 'linear-gradient(135deg, #0B1F33 0%, #132D4A 100%)',
      borderRadius: '14px',
      border: '1px solid rgba(244, 185, 66, 0.3)',
      boxShadow: '0 4px 15px rgba(11, 31, 51, 0.1)',
      overflow: 'hidden'
    }}>
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'rgba(244, 185, 66, 0.2)',
            padding: '6px',
            borderRadius: '8px',
            color: '#F4B942',
            display: 'flex'
          }}>
            <Video size={18} />
          </div>
          <div>
            <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>SIH 2026 2–4 Min Video Demo Guide</span>
              <span style={{
                background: '#F4B942',
                color: '#0B1F33',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '4px'
              }}>13 Steps</span>
            </div>
            <div style={{ color: '#94A3B8', fontSize: '0.78rem' }}>
              Follow this sequence during your pitch / video recording to demonstrate all evaluation criteria
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F4B942', fontSize: '0.82rem', fontWeight: 600 }}>
          <span>{isExpanded ? 'Hide Steps' : 'View Demo Checklist'}</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {isExpanded && (
        <div style={{
          padding: '0 20px 20px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '10px',
            marginTop: '16px'
          }}>
            {steps.map((s) => {
              const isCurrentTab = activeTab === s.tab;
              return (
                <div 
                  key={s.num}
                  onClick={() => setActiveTab(s.tab)}
                  style={{
                    background: isCurrentTab ? 'rgba(244, 185, 66, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: isCurrentTab ? '1px solid #F4B942' : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      background: isCurrentTab ? '#F4B942' : 'rgba(255, 255, 255, 0.1)',
                      color: isCurrentTab ? '#0B1F33' : '#FFFFFF',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {s.num}
                    </span>
                    <span style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.82rem' }}>
                      {s.title}
                    </span>
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: '0.74rem', paddingLeft: '28px' }}>
                    {s.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
