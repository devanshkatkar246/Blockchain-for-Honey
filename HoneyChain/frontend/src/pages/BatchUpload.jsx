import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  Binary, 
  ArrowRight, 
  Copy, 
  Download, 
  Sparkles,
  ShieldCheck,
  Info
} from 'lucide-react';
import { createCanonicalBatch, computeSha256 } from '../utils/crypto';

export default function BatchUpload({ 
  onBatchCreated, 
  setActiveTab, 
  onSelectBatchForAnchor 
}) {
  const [formData, setFormData] = useState({
    batchId: 'HNY-2026-001',
    beekeeper: 'Rajesh Kumar',
    apiary: 'Ahmedabad Apiary 01',
    hive: 'Hive A-12',
    harvestDate: '2026-09-23',
    floralSource: 'Mustard',
    quantity: '185 kg',
    processingUnit: 'Honey Processing Unit 01',
    qualityReference: 'LAB-HNY-001',
    batchDescription: 'Premium mustard-floral honey harvested from registered apiary.'
  });

  const [isRecordLoaded, setIsRecordLoaded] = useState(false);
  const [canonicalData, setCanonicalData] = useState(null);
  const [generatedHash, setGeneratedHash] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Reset downstream hash when inputs change
    if (generatedHash) {
      setGeneratedHash(null);
    }
  };

  // Pre-load demo batch
  const handleLoadDemo = () => {
    const demo = {
      batchId: 'HNY-2026-001',
      beekeeper: 'Rajesh Kumar',
      apiary: 'Ahmedabad Apiary 01',
      hive: 'Hive A-12',
      harvestDate: '2026-09-23',
      floralSource: 'Mustard',
      quantity: '185 kg',
      processingUnit: 'Honey Processing Unit 01',
      qualityReference: 'LAB-HNY-001',
      batchDescription: 'Premium mustard-floral honey harvested from registered apiary.'
    };
    setFormData(demo);
    const canonical = createCanonicalBatch(demo);
    setCanonicalData(canonical);
    setIsRecordLoaded(true);
    setGeneratedHash(null);
  };

  // Handle JSON file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        setFormData({
          batchId: parsed.batchId || 'HNY-2026-001',
          beekeeper: parsed.beekeeper || '',
          apiary: parsed.apiary || '',
          hive: parsed.hive || '',
          harvestDate: parsed.harvestDate || '',
          floralSource: parsed.floralSource || '',
          quantity: parsed.quantity || '',
          processingUnit: parsed.processingUnit || '',
          qualityReference: parsed.qualityReference || '',
          batchDescription: parsed.batchDescription || ''
        });

        const canonical = createCanonicalBatch(parsed);
        setCanonicalData(canonical);
        setIsRecordLoaded(true);
        setGeneratedHash(null);
      } catch (err) {
        alert('Invalid JSON file. Please upload a valid honey_batch.json document.');
      }
    };
    reader.readAsText(file);
  };

  // Generate Canonical Representation from current form
  const handleNormalize = (e) => {
    e?.preventDefault();
    const canonical = createCanonicalBatch(formData);
    setCanonicalData(canonical);
    setIsRecordLoaded(true);
    setGeneratedHash(null);
  };

  // Generate SHA-256 Hash
  const handleGenerateHash = () => {
    const canonical = canonicalData || createCanonicalBatch(formData);
    setCanonicalData(canonical);
    setIsRecordLoaded(true);

    const hash = computeSha256(canonical.compactCanonicalString);
    setGeneratedHash(hash);

    // Save/update batch in global store
    const fullBatchRecord = {
      ...formData,
      canonicalHash: hash,
      status: 'Pending',
      blockchainAnchored: false,
      timestamp: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    onBatchCreated(fullBatchRecord);
  };

  const handleCopyHash = () => {
    if (!generatedHash) return;
    navigator.clipboard.writeText(generatedHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(formData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `honey_batch_${formData.batchId || 'HNY-2026-001'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="content-area">
      {/* Title & Subtitle */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy)' }}>
          Create Honey Batch
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Register a new honey batch and prepare it for blockchain anchoring.
        </p>
      </div>

      {/* JSON File Upload Zone */}
      <div className="card" style={{ border: '2px dashed #CBD5E1', background: '#FAFCFA' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '16px' }}>
          <div style={{
            background: 'rgba(244, 185, 66, 0.15)',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D98E04',
            marginBottom: '14px'
          }}>
            <UploadCloud size={28} />
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '6px' }}>
            Upload Batch Record (honey_batch.json)
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748B', maxWidth: '480px', marginBottom: '16px' }}>
            Upload raw apiary harvest JSON metadata or auto-populate standard SIH 2026 demonstration fields below.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <label className="btn-primary" style={{ cursor: 'pointer' }}>
              <UploadCloud size={16} />
              Choose honey_batch.json
              <input 
                type="file" 
                accept=".json" 
                onChange={handleFileUpload} 
                style={{ display: 'none' }} 
              />
            </label>

            <button 
              type="button" 
              className="btn-secondary" 
              onClick={handleLoadDemo}
            >
              <FileText size={16} color="#D98E04" />
              Load Sample JSON (HNY-2026-001)
            </button>

            <button 
              type="button" 
              className="btn-secondary" 
              onClick={handleDownloadJson}
              title="Download current form as honey_batch.json"
            >
              <Download size={16} />
              Download JSON
            </button>
          </div>
        </div>
      </div>

      {/* Upload Confirmation Banner */}
      {isRecordLoaded && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '12px',
          padding: '14px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#065F46'
        }}>
          <CheckCircle size={20} color="#10B981" />
          <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
            BATCH RECORD LOADED — Successfully parsed batch data for {formData.batchId}
          </div>
        </div>
      )}

      {/* Batch Form */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <FileText size={18} color="#0B1F33" />
            <span>Honey Batch Harvest Metadata</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
            Editable Apiary Parameters
          </span>
        </div>

        <form onSubmit={handleNormalize} className="form-grid">
          <div className="form-group">
            <label className="form-label">Batch ID</label>
            <input 
              type="text" 
              name="batchId" 
              className="form-input" 
              value={formData.batchId} 
              onChange={handleChange}
              placeholder="e.g. HNY-2026-001"
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Beekeeper Name</label>
            <input 
              type="text" 
              name="beekeeper" 
              className="form-input" 
              value={formData.beekeeper} 
              onChange={handleChange}
              placeholder="e.g. Rajesh Kumar"
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Apiary Location</label>
            <input 
              type="text" 
              name="apiary" 
              className="form-input" 
              value={formData.apiary} 
              onChange={handleChange}
              placeholder="e.g. Ahmedabad Apiary 01"
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hive Number</label>
            <input 
              type="text" 
              name="hive" 
              className="form-input" 
              value={formData.hive} 
              onChange={handleChange}
              placeholder="e.g. Hive A-12"
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Harvest Date</label>
            <input 
              type="date" 
              name="harvestDate" 
              className="form-input" 
              value={formData.harvestDate} 
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Floral Source</label>
            <input 
              type="text" 
              name="floralSource" 
              className="form-input" 
              value={formData.floralSource} 
              onChange={handleChange}
              placeholder="e.g. Mustard, Acacia, Eucalyptus"
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Honey Quantity</label>
            <input 
              type="text" 
              name="quantity" 
              className="form-input" 
              value={formData.quantity} 
              onChange={handleChange}
              placeholder="e.g. 185 kg"
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Processing Unit</label>
            <input 
              type="text" 
              name="processingUnit" 
              className="form-input" 
              value={formData.processingUnit} 
              onChange={handleChange}
              placeholder="e.g. Honey Processing Unit 01"
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Quality Record Reference (Lab)</label>
            <input 
              type="text" 
              name="qualityReference" 
              className="form-input" 
              value={formData.qualityReference} 
              onChange={handleChange}
              placeholder="e.g. LAB-HNY-001"
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Batch Description</label>
            <input 
              type="text" 
              name="batchDescription" 
              className="form-input" 
              value={formData.batchDescription} 
              onChange={handleChange}
              placeholder="Description of harvest quality"
            />
          </div>

          <div className="form-group full-width" style={{ marginTop: '8px', display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn-secondary">
              <CheckCircle size={15} />
              Confirm & Generate Canonical Structure
            </button>
          </div>
        </form>
      </div>

      {/* Canonical Record Section */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Binary size={18} color="#D98E04" />
            <span>Canonical Batch Record (Normalized JSON)</span>
          </div>
          <span className="badge badge-anchored">
            Deterministic Key Sort
          </span>
        </div>

        <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '14px' }}>
          To prevent hash divergence due to whitespace or object key ordering, all attributes are normalized into an alphabetically sorted canonical string. The same data always produces the exact same canonical representation.
        </p>

        <div style={{
          background: '#071524',
          color: '#38BDF8',
          padding: '16px',
          borderRadius: '10px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.84rem',
          lineHeight: '1.6',
          overflowX: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <pre>{canonicalData ? canonicalData.canonicalString : JSON.stringify(formData, null, 2)}</pre>
        </div>
      </div>

      {/* SHA-256 Hash Generation Section */}
      <div className="card" style={{ borderColor: 'rgba(244, 185, 66, 0.4)', background: '#FFFFFF' }}>
        <div className="card-header">
          <div className="card-title">
            <ShieldCheck size={20} color="#D98E04" />
            <span>Record Integrity (Cryptographic Fingerprint)</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn-primary" 
              onClick={handleGenerateHash}
            >
              <Sparkles size={16} />
              Generate SHA-256 Hash
            </button>
          </div>
        </div>

        {generatedHash ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-navy)', textTransform: 'uppercase' }}>
                SHA-256 HASH (bytes32)
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="badge badge-verified">
                  READY FOR BLOCKCHAIN
                </span>
                <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Algorithm: SHA-256
                </span>
              </div>
            </div>

            <div className="hash-box-prominent">
              <span>{generatedHash}</span>
              <button 
                onClick={handleCopyHash}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem'
                }}
              >
                <Copy size={13} />
                {copiedHash ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748B' }}>
                <Info size={15} color="#D98E04" />
                <span>“Any change to the registered record produces a completely different hash.”</span>
              </div>

              <button 
                className="btn-primary"
                onClick={() => {
                  onSelectBatchForAnchor({
                    ...formData,
                    canonicalHash: generatedHash,
                    status: 'Pending',
                    blockchainAnchored: false
                  });
                  setActiveTab('blockchain');
                }}
              >
                Proceed to Blockchain Anchoring
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 10px', color: '#64748B' }}>
            <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
              Click <strong>“Generate SHA-256 Hash”</strong> to compute the immutable cryptographic digest for batch <strong>{formData.batchId}</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
