import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  Blocks, 
  ShieldCheck, 
  QrCode, 
  Hexagon,
  Sparkles,
  Award
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Batch Upload', icon: UploadCloud },
    { id: 'blockchain', label: 'Blockchain', icon: Blocks },
    { id: 'verification', label: 'Verification', icon: ShieldCheck },
    { id: 'qr', label: 'QR Verification', icon: QrCode },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-icon-wrap">
          <Hexagon size={26} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="brand-title">HONEY CHAIN</h1>
          <div className="brand-subtitle">Smart Traceability</div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="nav-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Tagline Box */}
      <div style={{ padding: '0 20px 16px 20px' }}>
        <div style={{
          background: 'rgba(244, 185, 66, 0.08)',
          border: '1px solid rgba(244, 185, 66, 0.2)',
          borderRadius: '10px',
          padding: '12px',
          fontSize: '0.75rem',
          color: '#E2E8F0',
          lineHeight: '1.4'
        }}>
          <div style={{ color: '#F4B942', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={13} />
            <span>SIH 2026 Core Tagline</span>
          </div>
          “Every Drop Has a Story. Make That Story Verifiable.”
        </div>
      </div>

      {/* Team Footer */}
      <div className="sidebar-footer">
        <div className="team-badge">
          <div className="team-name">
            <Award size={14} color="#F4B942" />
            <span>Binary Brains</span>
          </div>
          <div className="team-id">PIEMR-SIH-26</div>
          <div className="ps-id">Problem Statement: PS 26021</div>
        </div>
      </div>
    </aside>
  );
}
