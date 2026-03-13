import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const customTooltipStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid rgba(6,182,212,0.2)',
  borderRadius: 8,
  fontSize: 12,
  color: '#f1f5f9'
};

function PredictionChart({ data, thresholds, loading }) {
  const [selectedParam, setSelectedParam] = useState('vibrasi_x');

  const paramConfig = {
    vibrasi_x: { label: 'Vibrasi X', color: '#06b6d4', threshold: thresholds.thresholds['Vibrasi X'] },
    vibrasi_z: { label: 'Vibrasi Z', color: '#8b5cf6', threshold: thresholds.thresholds['Vibrasi Z'] },
    temperature: { label: 'Temperature', color: '#f59e0b', threshold: thresholds.thresholds['Temperature'] },
    current: { label: 'Current', color: '#22c55e', threshold: thresholds.thresholds['Current'] }
  };

  const config = paramConfig[selectedParam];

  if (loading) {
    return (
      <div className="chart-container">
        <div className="chart-title">Prediksi 14 Hari</div>
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <div className="loader" style={{ margin: '0 auto 20px' }}>
            {[...Array(9)].map((_, i) => (
              <div key={i} className={`cell ${i >= 1 && i <= 4 ? `d-${i}` : ''}`} />
            ))}
          </div>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--accent)' }}>Menjalankan prediksi...</p>
          <p style={{ fontSize: 12, marginTop: 6 }}>Model sedang memproses data, mohon tunggu</p>
        </div>
      </div>
    );
  }

  if (!data || data.model_status === 'not_trained') {
    return (
      <div className="chart-container">
        <div className="chart-title">Prediksi {data?.prediction_days || 14} Hari</div>
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>Model belum di-training</p>
          <p style={{ fontSize: 13 }}>{data?.message}</p>
        </div>
      </div>
    );
  }

  const historicalData = data.historical?.timestamps?.map((time, index) => ({
    time: time.substring(5, 16),
    historical: data.historical[selectedParam]?.[index],
    type: 'historical'
  })) || [];

  const predData = data.prediction_data || data.data;
  const predictionData = predData?.timestamps?.map((time, index) => ({
    time: time.substring(5, 16),
    prediction: predData[selectedParam]?.values?.[index],
    low: predData[selectedParam]?.low?.[index],
    high: predData[selectedParam]?.high?.[index],
    type: 'prediction'
  })) || [];

  const chartData = [...historicalData, ...predictionData];
  const historyLength = historicalData.length;

  return (
    <div className="chart-container">
      <div className="chart-title">
        Prediksi {data.prediction_days || data.predictions} Hari - {config.label}
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {Object.keys(paramConfig).map((key) => (
          <button
            key={key}
            onClick={() => setSelectedParam(key)}
            style={{
              padding: '6px 14px',
              border: `1px solid ${selectedParam === key ? paramConfig[key].color : 'rgba(6,182,212,0.15)'}`,
              borderRadius: 6,
              cursor: 'pointer',
              backgroundColor: selectedParam === key ? `${paramConfig[key].color}22` : 'transparent',
              color: selectedParam === key ? paramConfig[key].color : '#94a3b8',
              fontSize: 12,
              transition: 'all 0.2s'
            }}
          >
            {paramConfig[key].label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
            tickLine={false}
            interval={Math.floor(chartData.length / 10)}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
            tickLine={false}
          />
          <Tooltip contentStyle={customTooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
          <ReferenceLine
            y={config.threshold.warning}
            stroke="#f59e0b"
            strokeDasharray="5 5"
            label={{ value: 'Warning', fill: '#f59e0b', fontSize: 11 }}
          />
          <ReferenceLine
            y={config.threshold.critical}
            stroke="#ef4444"
            strokeDasharray="5 5"
            label={{ value: 'Critical', fill: '#ef4444', fontSize: 11 }}
          />
          <ReferenceLine
            x={historicalData[historyLength - 1]?.time}
            stroke="rgba(148,163,184,0.5)"
            strokeDasharray="3 3"
            label={{ value: 'Sekarang', fill: '#94a3b8', fontSize: 11 }}
          />
          <Line
            type="monotone"
            dataKey="historical"
            name="Historis"
            stroke={config.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: config.color }}
          />
          <Line
            type="monotone"
            dataKey="prediction"
            name="Prediksi"
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {data.warnings && data.warnings.length > 0 && (
        <div style={{
          marginTop: 16,
          padding: 16,
          backgroundColor: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 8
        }}>
          <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 13, color: '#f59e0b' }}>Peringatan Prediksi</p>
          {data.warnings.map((w, i) => (
            <p key={i} style={{
              margin: '4px 0',
              fontSize: 13,
              color: w.level === 'critical' ? '#ef4444' : '#f59e0b'
            }}>
              {w.parameter}: Diprediksi mencapai {w.level} ({w.value.toFixed(2)}) pada {w.timestamp}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default PredictionChart;