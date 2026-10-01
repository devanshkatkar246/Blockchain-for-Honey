import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  Download, 
  Hexagon, 
  Sparkles, 
  Award, 
  ExternalLink,
  Info
} from 'lucide-react';
import { truncate } from '../utils/crypto';

export default function PublicQrVerification({ batches, initialBatchId }) {
  const [selectedBatchId, setSelectedBatchId] = useState(initialBatchId || 'HNY-2026-001');
  const [activeBatch, setActiveBatch] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    const found = batches.find(b => b.batchId === selectedBatchId) || batches[0];
    if (found) {
      setActiveBatch(found);
      generateQrCode(found.batchId);
    }
  }, [selectedBatchId, batches]);

  const generateQrCode = async (batchId) => {
    try {
      const publicUrl = `${window.location.origin}/verify/${batchId}`;
      const url = await QRCode.toDataURL(publicUrl, {
        width: 220,
        margin: 2,
        color: {
          dark: '#0B1F33',
          light: '#FFFFFF'
        }
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error('QR code generation failed:', err);
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `HONEY_CHAIN_QR_${selectedBatchId}.png`;
    a.click();
  };

  return (
    <div className="content-area">
      {/* Page Title */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy)' }}>
          Public QR Verification & Consumer Portal
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Simulating the consumer experience when scanning the on-jar QR code in retail stores.
        </p>
      </div>

      {/* Batch Selector */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-navy)' }}>
              Select Batch to Inspect:
            </span>
            <select 
              className="form-select"
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              style={{ minWidth: '220px', fontWeight: 600 }}
            >
              {batches.map(b => (
                <option key={b.batchId} value={b.batchId}>
                  {b.batchId} - {b.beekeeper} ({b.floralSource})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" onClick={handleDownloadQr}>
              <Download size={15} />
              Save QR Label Image
            </button>
          </div>
        </div>
      </div>

      {/* Main Consumer Certificate Card */}
      {activeBatch && (
        <div style={{
          maxWidth: '820px',
          margin: '0 auto',
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #CBD5E1',
          boxShadow: '0 12px 35px rgba(11, 31, 51, 0.08)',
          overflow: 'hidden'
        }}>
          {/* Header Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #0B1F33 0%, #132D4A 100%)',
            padding: '28px 32px',
            color: '#FFFFFF',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #F4B942, #D98E04)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0B1F33'
                }}>
                  <Hexagon size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                    HONEY CHAIN
                  </h3>
                  <div style={{ color: '#F4B942', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em' }}>
                    AUTHENTICATED SUPPLY CHAIN CERTIFICATE
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-verified" style={{ background: '#10B981', color: '#FFFFFF', padding: '6px 14px', fontSize: '0.85rem' }}>
                  <CheckCircle2 size={15} />
                  ✓ VERIFIED
                </span>
                <div style={{ color: '#94A3B8', fontSize: '0.72rem', marginTop: '4px' }}>
                  Hash Status: MATCH
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Body */}
          <div style={{ padding: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px', alignItems: 'center', marginBottom: '28px' }}>
              {/* QR Code Container */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: '#F8FAFC',
                padding: '16px',
                borderRadius: '16px',
                border: '1px solid #E2E8F0'
              }}>
                {qrDataUrl && (
                  <img 
                    src={qrDataUrl} 
                    alt={`QR Code for ${activeBatch.batchId}`} 
                    style={{ width: '180px', height: '180px', borderRadius: '8px' }}
                  />
                )}
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-navy)', marginTop: '10px' }}>
                  Scan to Inspect Batch
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                  {activeBatch.batchId}
                </div>
              </div>

              {/* Origin & Harvest Specs */}
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Batch ID</span>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-navy)', fontFamily: 'var(--font-mono)' }}>
                      {activeBatch.batchId}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Origin / Apiary</span>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-navy)' }}>
                      {activeBatch.apiary}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Registered Beekeeper</span>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-navy)' }}>
                      {activeBatch.beekeeper}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Harvest Date</span>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-navy)' }}>
                      {activeBatch.harvestDate}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Floral Source</span>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#D98E04' }}>
                      {activeBatch.floralSource}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Quantity</span>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-navy)' }}>
                      {activeBatch.quantity}
                    </div>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Quality Record Reference</span>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-navy)' }}>
                      {activeBatch.qualityReference} (Accredited Testing Laboratory)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptographic Digest Accordion */}
            <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-navy)', textTransform: 'uppercase' }}>
                  Immutable Blockchain Hash Anchor
                </span>
                <span className="badge badge-verified" style={{ fontSize: '0.72rem' }}>
                  Anchor Block #{activeBatch.blockNumber || 1842}
                </span>
              </div>
              <div className="hash-pill" style={{ background: '#FFFFFF', color: '#0B1F33', fontWeight: 600, fontSize: '0.8rem' }}>
                {activeBatch.registeredHash || activeBatch.canonicalHash}
              </div>
            </div>

            {/* Crucial Required Project Disclaimer */}
            <div className="disclaimer-card">
              <Info size={22} color="#D98E04" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700, marginBottom: '2px' }}>
                  Food Traceability & Blockchain Authenticity Disclaimer
                </div>
                <p style={{ lineHeight: '1.5' }}>
                  “Blockchain verifies the integrity and immutability of registered batch records.
                  Laboratory testing remains the basis for quality and purity findings.”
                </p>
              </div>
            </div>
          </div>

          {/* Certificate Footer */}
          <div style={{
            background: '#F1F5F9',
            padding: '14px 32px',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#64748B'
          }}>
            <div>Team: <strong>Binary Brains</strong> (PIEMR-SIH-26)</div>
            <div>Smart India Hackathon 2026 • PS 26021</div>
          </div>
        </div>
      )}
    </div>
  );
}
