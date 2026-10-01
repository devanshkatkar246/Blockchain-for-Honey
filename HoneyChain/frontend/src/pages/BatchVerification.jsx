import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Edit3, 
  RotateCcw, 
  ExternalLink,
  Search,
  Lock,
  FileText
} from 'lucide-react';
import { createCanonicalBatch, computeSha256, truncate } from '../utils/crypto';
import { blockchainService } from '../utils/blockchainService';

export default function BatchVerification({ 
  batches, 
  initialBatchId, 
  setActiveTab,
  simulationMode
}) {
  const [selectedBatchId, setSelectedBatchId] = useState(initialBatchId || 'HNY-2026-001');
  const [activeBatch, setActiveBatch] = useState(null);
  
  // Working copy for live editing / tamper demonstration
  const [editableRecord, setEditableRecord] = useState(null);
  
  // Verification states
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isTampered, setIsTampered] = useState(false);
  const [tamperedField, setTamperedField] = useState(null);

  // Initialize active batch whenever selectedBatchId or batches changes
  useEffect(() => {
    const found = batches.find(b => b.batchId === selectedBatchId) || batches[0];
    if (found) {
      setActiveBatch(found);
      setEditableRecord({ ...found });
      setIsTampered(false);
      setTamperedField(null);
      setVerificationResult(null);
    }
  }, [selectedBatchId, batches]);

  // Run verification
  const handleVerify = async (recordToVerify = editableRecord) => {
    if (!recordToVerify) return;
    setIsVerifying(true);

    try {
      // 1. Recreate canonical record
      const { compactCanonicalString } = createCanonicalBatch(recordToVerify);

      // 2. Generate current SHA-256 hash
      const currentHash = computeSha256(compactCanonicalString);

      // 3. Read registered hash from blockchain
      const onChainRecord = await blockchainService.verifyBatchOnChain(
        recordToVerify.batchId,
        currentHash,
        activeBatch
      );

      // 4. Compare hashes
      const registeredHash = onChainRecord.registeredHash || activeBatch.registeredHash || activeBatch.canonicalHash;
      const isMatch = registeredHash && (registeredHash.toLowerCase() === currentHash.toLowerCase());

      setVerificationResult({
        isMatch,
        registeredHash,
        currentHash,
        batchId: recordToVerify.batchId,
        timestamp: activeBatch.timestamp || '23 Sep 2026',
        blockNumber: activeBatch.blockNumber || 1842,
        registrant: activeBatch.registrant || '0x7A234BCa8f4B99c1584985b9856A9D71018891F2',
        status: isMatch ? 'CONFIRMED' : 'MISMATCH'
      });
    } catch (err) {
      console.error('Verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  // Simulate tampering (e.g. Quantity: 185 kg -> 190 kg)
  const handleSimulateTamper = (targetField = 'quantity', newValue = '190 kg') => {
    if (!editableRecord) return;
    const modified = { ...editableRecord, [targetField]: newValue };
    setEditableRecord(modified);
    setIsTampered(true);
    setTamperedField(targetField);
    handleVerify(modified);
  };

  // Reset to original untampered batch
  const handleResetRecord = () => {
    if (!activeBatch) return;
    setEditableRecord({ ...activeBatch });
    setIsTampered(false);
    setTamperedField(null);
    handleVerify(activeBatch);
  };

  return (
    <div className="content-area">
      {/* Title & Subtitle */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy)' }}>
          Verify Honey Batch
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Recompute canonical SHA-256 hash and independently verify against the immutable blockchain registry.
        </p>
      </div>

      {/* Batch Selector / Input Header */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-navy)' }}>
              Batch ID:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="text"
                className="form-input"
                style={{ width: '180px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
              />
              <button 
                className="btn-primary"
                onClick={() => handleVerify(editableRecord)}
                disabled={isVerifying}
              >
                <Search size={15} />
                {isVerifying ? 'Verifying on Chain...' : 'VERIFY BATCH'}
              </button>
            </div>
          </div>

          {/* Quick pick chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Quick Pick:</span>
            {batches.map(b => (
              <button
                key={b.batchId}
                onClick={() => setSelectedBatchId(b.batchId)}
                style={{
                  background: selectedBatchId === b.batchId ? 'var(--color-gold)' : '#F1F5F9',
                  color: selectedBatchId === b.batchId ? 'var(--color-navy)' : '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {b.batchId}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Verification & Tampering Demonstration Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Verification Results */}
        <div>
          {verificationResult ? (
            verificationResult.isMatch ? (
              /* Verified / Match Card */
              <div className="card" style={{
                border: '2px solid #10B981',
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.15)'
              }}>
                <div className="card-header" style={{ borderBottomColor: '#BBF7D0' }}>
                  <div className="card-title" style={{ color: '#065F46', fontSize: '1.25rem' }}>
                    <CheckCircle2 size={26} color="#10B981" />
                    <span>✓ VERIFIED — HASH MATCH</span>
                  </div>
                  <span className="badge badge-verified" style={{ background: '#10B981', color: '#FFFFFF', fontSize: '0.85rem' }}>
                    BLOCKCHAIN: CONFIRMED
                  </span>
                </div>

                <div style={{
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '18px',
                  color: '#065F46',
                  fontSize: '0.88rem',
                  fontWeight: 600
                }}>
                  “The current record matches the hash registered on blockchain.”
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>
                      REGISTERED ON-CHAIN HASH (SMART CONTRACT)
                    </div>
                    <div className="hash-pill" style={{ background: '#FFFFFF', color: '#065F46', border: '1px solid #A7F3D0', fontWeight: 600 }}>
                      {verificationResult.registeredHash}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>
                      CURRENT RECOMPUTED CANONICAL HASH (OFF-CHAIN)
                    </div>
                    <div className="hash-pill" style={{ background: '#FFFFFF', color: '#065F46', border: '1px solid #A7F3D0', fontWeight: 600 }}>
                      {verificationResult.currentHash}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', background: '#FFFFFF', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '18px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase' }}>Anchor Block</span>
                    <div style={{ fontWeight: 700, color: 'var(--color-navy)' }}>#{verificationResult.blockNumber}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase' }}>Timestamp</span>
                    <div style={{ fontWeight: 700, color: 'var(--color-navy)' }}>{verificationResult.timestamp}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button 
                    className="btn-secondary"
                    onClick={() => setActiveTab('qr')}
                  >
                    <ExternalLink size={14} />
                    View Consumer QR Certificate
                  </button>
                </div>
              </div>
            ) : (
              /* Mismatch / Tamper Detected Card */
              <div className="card" style={{
                border: '2px solid #EF4444',
                background: 'linear-gradient(180deg, #FFFFFF 0%, #FEF2F2 100%)',
                boxShadow: '0 8px 25px rgba(239, 68, 68, 0.15)'
              }}>
                <div className="card-header" style={{ borderBottomColor: '#FECACA' }}>
                  <div className="card-title" style={{ color: '#991B1B', fontSize: '1.25rem' }}>
                    <AlertTriangle size={26} color="#EF4444" />
                    <span>⚠ MISMATCH — HASH MISMATCH</span>
                  </div>
                  <span className="badge badge-mismatch" style={{ background: '#EF4444', color: '#FFFFFF', fontSize: '0.85rem' }}>
                    INTEGRITY COMPROMISED
                  </span>
                </div>

                <div style={{
                  background: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '18px',
                  color: '#991B1B',
                  fontSize: '0.88rem',
                  fontWeight: 600
                }}>
                  “The current record differs from the blockchain-registered record.”
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>
                      IMMUTABLE ON-CHAIN REGISTERED HASH
                    </div>
                    <div className="hash-pill" style={{ background: '#FFFFFF', color: '#0B1F33', border: '1px solid #CBD5E1', fontWeight: 600 }}>
                      {verificationResult.registeredHash}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#991B1B', fontWeight: 700, marginBottom: '4px' }}>
                      TAMPERED CURRENT HASH (DIVERGENT)
                    </div>
                    <div className="hash-pill" style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5', fontWeight: 700 }}>
                      {verificationResult.currentHash}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '8px', border: '1px solid #FECACA', marginBottom: '18px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#991B1B', fontWeight: 700, marginBottom: '6px' }}>
                    CRYPTOGRAPHIC PROOF OF TAMPERING:
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: '1.5' }}>
                    Because SHA-256 is an avalanche-effect cryptographic one-way function, changing even a single byte or digit (e.g. quantity from 185 kg to 190 kg) creates a totally distinct hash that does not match the immutable smart contract record.
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button 
                    className="btn-secondary"
                    onClick={handleResetRecord}
                    style={{ borderColor: '#10B981', color: '#065F46' }}
                  >
                    <RotateCcw size={14} color="#10B981" />
                    Restore Original Verified Record
                  </button>
                </div>
              </div>
            )
          ) : (
            /* Prompt to click verify */
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
              <div style={{
                background: 'rgba(244, 185, 66, 0.15)',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D98E04',
                margin: '0 auto 16px auto'
              }}>
                <ShieldCheck size={32} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)', fontWeight: 700, marginBottom: '8px' }}>
                Batch {selectedBatchId} Ready for Cryptographic Verification
              </h3>
              <p style={{ fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 20px auto' }}>
                Click <strong>“VERIFY BATCH”</strong> to query the smart contract and cross-check the off-chain canonical record against the blockchain anchor.
              </p>
              <button 
                className="btn-primary"
                onClick={() => handleVerify(editableRecord)}
              >
                <Search size={16} />
                VERIFY BATCH NOW
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Tamper Demonstration Panel */}
        <div>
          <div className="card" style={{ borderColor: isTampered ? '#FCA5A5' : 'var(--color-border-light)' }}>
            <div className="card-header">
              <div className="card-title">
                <Edit3 size={18} color="#D98E04" />
                <span>Demo Feature: Tamper Simulator</span>
              </div>
              {isTampered ? (
                <span className="badge badge-mismatch">MODIFIED</span>
              ) : (
                <span className="badge badge-verified">ORIGINAL</span>
              )}
            </div>

            <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '16px' }}>
              For your SIH 2026 presentation video (Step 12), test modifying one batch field to demonstrate how the blockchain detects unauthorized modifications.
            </p>

            {/* Quick Demo Tamper Button */}
            <div style={{ marginBottom: '18px' }}>
              <button 
                className="btn-danger"
                style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                onClick={() => handleSimulateTamper('quantity', editableRecord?.quantity === '190 kg' ? '185 kg' : '190 kg')}
              >
                <AlertTriangle size={15} />
                Modify Quantity: 185 kg → 190 kg
              </button>
            </div>

            {/* Editable Fields list */}
            {editableRecord && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                    Honey Quantity:
                  </label>
                  <input 
                    type="text" 
                    className="form-input"
                    style={{
                      width: '100%',
                      background: tamperedField === 'quantity' ? '#FEF2F2' : '#FFFFFF',
                      borderColor: tamperedField === 'quantity' ? '#EF4444' : '#CBD5E1',
                      fontWeight: 600
                    }}
                    value={editableRecord.quantity || ''}
                    onChange={(e) => {
                      const updated = { ...editableRecord, quantity: e.target.value };
                      setEditableRecord(updated);
                      setIsTampered(true);
                      setTamperedField('quantity');
                      handleVerify(updated);
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                    Floral Source:
                  </label>
                  <input 
                    type="text" 
                    className="form-input"
                    style={{
                      width: '100%',
                      background: tamperedField === 'floralSource' ? '#FEF2F2' : '#FFFFFF',
                      borderColor: tamperedField === 'floralSource' ? '#EF4444' : '#CBD5E1',
                      fontWeight: 600
                    }}
                    value={editableRecord.floralSource || ''}
                    onChange={(e) => {
                      const updated = { ...editableRecord, floralSource: e.target.value };
                      setEditableRecord(updated);
                      setIsTampered(true);
                      setTamperedField('floralSource');
                      handleVerify(updated);
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                    Quality Record Reference:
                  </label>
                  <input 
                    type="text" 
                    className="form-input"
                    style={{
                      width: '100%',
                      background: tamperedField === 'qualityReference' ? '#FEF2F2' : '#FFFFFF',
                      borderColor: tamperedField === 'qualityReference' ? '#EF4444' : '#CBD5E1',
                      fontWeight: 600
                    }}
                    value={editableRecord.qualityReference || ''}
                    onChange={(e) => {
                      const updated = { ...editableRecord, qualityReference: e.target.value };
                      setEditableRecord(updated);
                      setIsTampered(true);
                      setTamperedField('qualityReference');
                      handleVerify(updated);
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button 
                    className="btn-secondary" 
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={handleResetRecord}
                  >
                    <RotateCcw size={14} />
                    Reset Data
                  </button>
                  <button 
                    className="btn-primary" 
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => handleVerify(editableRecord)}
                  >
                    <RefreshCw size={14} />
                    Recheck Hash
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
