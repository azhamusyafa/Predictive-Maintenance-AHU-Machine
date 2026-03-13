import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

function StatusCard({ label, value, unit, status, sparkline }) {
  const [flash, setFlash] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      prevValue.current = value;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 400);
      return () => clearTimeout(t);
    }
  }, [value]);
  const sparkData = sparkline ? sparkline.map((v) => ({ value: v })) : [];

  const statusColor = {
    normal: '#22c55e',
    warning: '#f59e0b',
    critical: '#ef4444'
  };

  const statusLabel = {
    normal: 'Normal',
    warning: 'Peringatan',
    critical: 'Kritis'
  };

  return (
    <div className={`card bg-${status}`}>
      <div className="card-title">{label}</div>
      <div className={`card-value status-${status}${flash ? ' value-flash' : ''}`}>
        {value}
        <span style={{ fontSize: 13, fontWeight: 400, marginLeft: 4, color: 'var(--text-secondary)' }}>
          {unit}
        </span>
      </div>

      <div style={{ height: 44, marginTop: 12 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={statusColor[status]}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        marginTop: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: statusColor[status],
          display: 'inline-block'
        }} />
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {statusLabel[status]}
        </span>
      </div>
    </div>
  );
}

export default StatusCard;