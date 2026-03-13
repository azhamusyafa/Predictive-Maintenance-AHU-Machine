import React, { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { getHistoricalByRange } from '../services/api';

const tooltipStyle = {
    backgroundColor: '#1e293b',
    border: '1px solid rgba(6,182,212,0.2)',
    borderRadius: 8,
    fontSize: 12,
    color: '#f1f5f9'
};

const paramConfig = [
    { key: 'vibrasi_x', label: 'Vibrasi X', color: '#06b6d4', thresholdKey: 'Vibrasi X', unit: 'mm/s' },
    { key: 'vibrasi_z', label: 'Vibrasi Z', color: '#8b5cf6', thresholdKey: 'Vibrasi Z', unit: 'mm/s' },
    { key: 'temperature', label: 'Temperature', color: '#f59e0b', thresholdKey: 'Temperature', unit: '°C' },
    { key: 'current', label: 'Current', color: '#22c55e', thresholdKey: 'Current', unit: 'A' }
];

function SingleChart({ param, data, thresholds }) {
    const threshold = thresholds?.thresholds?.[param.thresholdKey];

    const chartData = data?.data?.timestamps?.map((time, index) => ({
        time: time.substring(5, 16),
        value: data.data[param.key][index]
    })) || [];

    return (
        <div
            className="chart-card"
            style={{ border: `1px solid ${param.color}22` }}
        >
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12
            }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: param.color }}>
                    {param.label}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {param.unit}
                </span>
            </div>

            <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                    <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
                        tickLine={false}
                        interval={Math.floor(chartData.length / 6)}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
                        tickLine={false}
                        width={40}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    {threshold && (
                        <>
                            <ReferenceLine
                                y={threshold.warning}
                                stroke="#f59e0b"
                                strokeDasharray="5 5"
                                label={{ value: 'W', fill: '#f59e0b', fontSize: 10 }}
                            />
                            <ReferenceLine
                                y={threshold.critical}
                                stroke="#ef4444"
                                strokeDasharray="5 5"
                                label={{ value: 'C', fill: '#ef4444', fontSize: 10 }}
                            />
                        </>
                    )}
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={param.color}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 3, fill: param.color }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

function HistoricalChart({ data, thresholds }) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredData, setFilteredData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const displayData = filteredData || data;

    const handleFilter = async () => {
        if (!startDate || !endDate) {
            setError('Pilih rentang waktu terlebih dahulu');
            return;
        }
        if (new Date(startDate) >= new Date(endDate)) {
            setError('Waktu mulai harus lebih awal dari waktu akhir');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const res = await getHistoricalByRange(startDate, endDate);
            setFilteredData(res);
        } catch (err) {
            setError('Gagal mengambil data');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        setFilteredData(null);
        setError('');
    };

    const inputStyle = {
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        color: 'var(--text-primary)',
        fontSize: 13,
        padding: '8px 12px',
        outline: 'none',
        colorScheme: 'dark'
    };

    return (
        <div className="chart-container">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
                flexWrap: 'wrap',
                gap: 12
            }}>
                <div className="chart-title" style={{ margin: 0 }}>Data Historis</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={inputStyle}
                    />
                    <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>—</span>
                    <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={inputStyle}
                    />

                    <button
                        className="apply-button"
                        onClick={handleFilter}
                        disabled={loading}
                    >
                        {loading ? 'Memuat...' : 'Terapkan'}
                    </button>

                    {filteredData && (
                        <button className="reset-button" onClick={handleReset}>
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 12 }}>{error}</p>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 16
            }}>
                {paramConfig.map((param) => (
                    <SingleChart
                        key={param.key}
                        param={param}
                        data={displayData}
                        thresholds={thresholds}
                    />
                ))}
            </div>

            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                {displayData?.total_points} data points
                {filteredData ? ` (filtered)` : ' (500 data terakhir)'}
            </div>
        </div>
    );
}

export default HistoricalChart;