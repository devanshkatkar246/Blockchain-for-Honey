import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import VideoDemoGuide from './components/VideoDemoGuide';

import Dashboard from './pages/Dashboard';
import BatchUpload from './pages/BatchUpload';
import BlockchainRegistration from './pages/BlockchainRegistration';
import BatchVerification from './pages/BatchVerification';
import PublicQrVerification from './pages/PublicQrVerification';

import { initialBatches } from './utils/preloadedData';
import { blockchainService } from './utils/blockchainService';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [batches, setBatches] = useState(() => {
    const saved = localStorage.getItem('honeychain_batches');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved batches:', e);
      }
    }
    return initialBatches;
  });

  const [walletState, setWalletState] = useState({
    account: null,
    chainId: null,
    networkName: 'Local Test Network (Hardhat)',
    isLocal: true
  });

  // Presentation simulation mode: if true, allows full blockchain flow even without active Hardhat RPC node running
  const [simulationMode, setSimulationMode] = useState(!blockchainService.hasMetaMask());

  const [selectedBatchForAnchor, setSelectedBatchForAnchor] = useState(null);
  const [selectedBatchIdForVerify, setSelectedBatchIdForVerify] = useState('HNY-2026-001');

  // Sync batches to localStorage for persistence
  useEffect(() => {
    localStorage.setItem('honeychain_batches', JSON.stringify(batches));
  }, [batches]);

  // Connect MetaMask wallet
  const handleConnectWallet = async () => {
    try {
      if (blockchainService.hasMetaMask()) {
        const info = await blockchainService.connectWallet();
        setWalletState(info);
        setSimulationMode(false);
      } else {
        // Fallback for demonstration when browser doesn't have MetaMask extension
        const mockAccount = '0x7A234BCa8f4B99c1584985b9856A9D71018891F2';
        setWalletState({
          account: mockAccount,
          chainId: 31337,
          networkName: 'Local Test Network (Hardhat #31337)',
          isLocal: true
        });
        setSimulationMode(true);
      }
    } catch (err) {
      alert(err.message || 'Could not connect MetaMask wallet.');
    }
  };

  // Add or update batch created in BatchUpload
  const handleBatchCreated = (newBatch) => {
    setBatches(prev => {
      const existsIndex = prev.findIndex(b => b.batchId === newBatch.batchId);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = { ...updated[existsIndex], ...newBatch };
        return updated;
      }
      return [newBatch, ...prev];
    });
    setSelectedBatchForAnchor(newBatch);
  };

  // Update batch state when anchored on blockchain
  const handleBatchAnchored = (batchId, anchorDetails) => {
    setBatches(prev => prev.map(b => {
      if (b.batchId === batchId) {
        return {
          ...b,
          ...anchorDetails
        };
      }
      return b;
    }));
    setSelectedBatchIdForVerify(batchId);
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Honey Chain Traceability Dashboard';
      case 'upload': return 'Create Honey Batch & SHA-256';
      case 'blockchain': return 'Blockchain Hash Anchoring & Explorer';
      case 'verification': return 'Batch Verification & Tamper Detection';
      case 'qr': return 'Public QR Authenticity Certificate';
      default: return 'HONEY CHAIN';
    }
  };

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <TopNavbar 
          walletState={walletState}
          onConnectWallet={handleConnectWallet}
          activeTabTitle={getPageTitle()}
          simulationMode={simulationMode}
          setSimulationMode={setSimulationMode}
        />

        <div style={{ padding: '16px 32px 0 32px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          <VideoDemoGuide activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {activeTab === 'dashboard' && (
          <Dashboard 
            batches={batches}
            walletState={walletState}
            onConnectWallet={handleConnectWallet}
            setActiveTab={setActiveTab}
            onSelectBatchForAnchor={(batch) => setSelectedBatchForAnchor(batch)}
            onSelectBatchForVerify={(batchId) => setSelectedBatchIdForVerify(batchId)}
          />
        )}

        {activeTab === 'upload' && (
          <BatchUpload 
            onBatchCreated={handleBatchCreated}
            setActiveTab={setActiveTab}
            onSelectBatchForAnchor={(batch) => setSelectedBatchForAnchor(batch)}
          />
        )}

        {activeTab === 'blockchain' && (
          <BlockchainRegistration 
            selectedBatch={selectedBatchForAnchor}
            batches={batches}
            onBatchAnchored={handleBatchAnchored}
            walletState={walletState}
            onConnectWallet={handleConnectWallet}
            simulationMode={simulationMode}
            setActiveTab={setActiveTab}
            onSelectBatchForVerify={(batchId) => setSelectedBatchIdForVerify(batchId)}
          />
        )}

        {activeTab === 'verification' && (
          <BatchVerification 
            batches={batches}
            initialBatchId={selectedBatchIdForVerify}
            setActiveTab={setActiveTab}
            simulationMode={simulationMode}
          />
        )}

        {activeTab === 'qr' && (
          <PublicQrVerification 
            batches={batches}
            initialBatchId={selectedBatchIdForVerify}
          />
        )}
      </div>
    </div>
  );
}
