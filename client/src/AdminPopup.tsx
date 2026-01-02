import React from "react";

interface Props {
  onClose: () => void;
  onShowManufacturer: () => void;
  onShowScale: () => void;
  onShowSource: () => void;
  onShowStorageLocation: () => void;
  onShowCategory: () => void;
  onShowBackground: () => void;
}

const burgundy = '#7c2128';
const backgroundImage = "url('/prr-logo.png')";
const AdminPopup: React.FC<Props> = ({ onClose, onShowManufacturer, onShowScale, onShowSource, onShowStorageLocation, onShowCategory, onShowBackground }) => {
  return (
    <div
      style={{
        minWidth: 320,
        padding: 32,
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
        position: 'relative',
        color: burgundy,
        backgroundImage: `${backgroundImage}`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center 60px',
        backgroundSize: '120px',
        overflow: 'hidden',
      }}
    >
      <button style={{ position: 'absolute', top: 8, right: 8, fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', color: burgundy }} onClick={onClose} title="Close">✖️</button>
      <h2 style={{ color: burgundy, textAlign: 'center', marginTop: 0, marginBottom: 32, fontWeight: 900, letterSpacing: 1 }}>Administration</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 24 }}>
        <button onClick={onShowCategory} style={{ fontSize: 18, padding: '0.7em 1.5em', borderRadius: 6, border: '1px solid #bbb', background: '#f3f4f6', cursor: 'pointer', color: burgundy, fontWeight: 700 }}>
          🏷️ Manage Categories
        </button>
        <button onClick={onShowManufacturer} style={{ fontSize: 18, padding: '0.7em 1.5em', borderRadius: 6, border: '1px solid #bbb', background: '#f3f4f6', cursor: 'pointer', color: burgundy, fontWeight: 700 }}>
          🏭 Manage Manufacturers
        </button>
        <button onClick={onShowScale} style={{ fontSize: 18, padding: '0.7em 1.5em', borderRadius: 6, border: '1px solid #bbb', background: '#f3f4f6', cursor: 'pointer', color: burgundy, fontWeight: 700 }}>
          📏 Manage Scales
        </button>
        <button onClick={onShowSource} style={{ fontSize: 18, padding: '0.7em 1.5em', borderRadius: 6, border: '1px solid #bbb', background: '#f3f4f6', cursor: 'pointer', color: burgundy, fontWeight: 700 }}>
          � Manage Sources
        </button>
        <button onClick={onShowStorageLocation} style={{ fontSize: 18, padding: '0.7em 1.5em', borderRadius: 6, border: '1px solid #bbb', background: '#f3f4f6', cursor: 'pointer', color: burgundy, fontWeight: 700 }}>
          📍 Manage Storage Locations
        </button>
        <button onClick={onShowBackground} style={{ fontSize: 18, padding: '0.7em 1.5em', borderRadius: 6, border: '1px solid #bbb', background: '#f3f4f6', cursor: 'pointer', color: burgundy, fontWeight: 700 }}>
          🖼️ Manage Background Image
        </button>
      </div>
    </div>
  );
};

export default AdminPopup;
