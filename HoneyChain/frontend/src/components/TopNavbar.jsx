import React from 'react';
import { Wallet, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { truncate } from '../utils/crypto';

export default function TopNavbar({ 
  walletState, 
  onConnectWallet, 
  activeTabTitle,
  simulationMode,
  setSimulationMode
}) {
  const isConnected = Boolean(walletState?.account);

  return (
    <header className="top-navbar">
      <div className="top-nav-left">
        <h2 className="page-heading">{activeTabTitle}</h2>
        <span className="tagline-pill">PS 26021 • AgriTech Web3</span>
      </div>

      <div className="top-nav-right">
        {/* Blockchain Node Mode Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: simulationMode ? '#FEF3C7' : '#F1F5F9',
          padding: '4px 12px',
          borderRadius: '999px',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: simulationMode ? '#92400E' : '#334155',
          border: '1px solid #CBD5E1'
        }}>
          <span>Node:</span>
          <span>{simulationMode ? 'Simulated Local Chain (#31337)' : 'Local Hardhat RPC (#31337)'}</span>
          <button 
            onClick={() => setSimulationMode(!simulationMode)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748B',
              fontSize: '0.72rem',
              textDecoration: 'underline',
              marginLeft: '4px'
            }}
            title="Toggle between MetaMask / Real Hardhat RPC and zero-friction presentation simulation"
          >
            Switch
          </button>
        </div>

        {/* Wallet status & button */}
        <div className="wallet-box">
          <div className={`wallet-status-dot ${isConnected ? 'connected' : ''}`} />
          {isConnected ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} color="var(--color-success)" />
                <span>{truncate(walletState.account, 6, 4)}</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                {walletState.networkName || 'Local Test Network'}
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#64748B' }}>Wallet: Not Connected</span>
              <button 
                onClick={onConnectWallet} 
                className="btn-primary" 
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <Wallet size={14} />
                Connect MetaMask
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
