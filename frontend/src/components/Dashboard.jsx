import { useState } from 'react';
import StatusCard from './StatusCard';
import HistoricalChart from './HistoricalChart';
import PredictionChart from './PredictionChart';
import ThresholdInfo from './ThresholdInfo';

function Dashboard({ status, historical, thresholds, prediction, predictionLoading, fetchPrediction }) {
  const [activeTab, setActiveTab] = useState('historical');
  const [predictionLoaded, setPredictionLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'prediction' && !predictionLoaded) {
      fetchPrediction();
      setPredictionLoaded(true);
    }
  };

  const parameters = [
    { key: 'Vibrasi X', unit: 'mm/s' },
    { key: 'Vibrasi Z', unit: 'mm/s' },
    { key: 'Temperature', unit: '°C' },
    { key: 'Current', unit: 'A' }
  ];

  const navItems = [
    {
      id: 'historical', label: 'Data Historis',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      )
    },
    {
      id: 'prediction', label: 'Prediksi',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    },
    {
      id: 'threshold', label: 'Threshold',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      )
    },
  ];

  return (
    <>
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-burger">
          <input
            id="burger-checkbox"
            type="checkbox"
            checked={sidebarOpen}
            onChange={(e) => setSidebarOpen(e.target.checked)}
          />
          <label className="toggle" htmlFor="burger-checkbox">
            <div className="bar bar--top"></div>
            <div className="bar bar--middle"></div>
            <div className="bar bar--bottom"></div>
          </label>
        </div>

        <div className="sidebar-logo">
          <h2>HVAC Monitor</h2>
          <p>AHU FT1.01</p>
        </div>

        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => handleTabChange(item.id)}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            <span className="sidebar-item-label">{item.label}</span>
            <span className="sidebar-tooltip">{item.label}</span>
          </button>
        ))}
      </div>

      <div className={`main-content ${sidebarOpen ? 'sidebar-expanded' : ''}`}>
        <div className="topbar">
          <div>
            <h1>Predictive Maintenance</h1>
            <p>Sistem Monitoring dan Prediksi Kondisi Motor Blower</p>
          </div>
          <div className={`status-badge ${status.status}`}>
            {status.status}
          </div>
        </div>

        <div className="grid">
          {parameters.map((param) => (
            <StatusCard
              key={param.key}
              label={param.key}
              value={status.current_values[param.key]}
              unit={param.unit}
              status={status.status_levels[param.key]}
              sparkline={status.sparkline[param.key]}
            />
          ))}
        </div>

        {activeTab === 'historical' && (
          <div key="historical" className="tab-content">
            <HistoricalChart data={historical} thresholds={thresholds} />
          </div>
        )}

        {activeTab === 'prediction' && (
          <div key="prediction" className="tab-content">
            <PredictionChart data={prediction} thresholds={thresholds} loading={predictionLoading} />
          </div>
        )}

        {activeTab === 'threshold' && (
          <div key="threshold" className="tab-content">
            <ThresholdInfo data={thresholds} />
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;