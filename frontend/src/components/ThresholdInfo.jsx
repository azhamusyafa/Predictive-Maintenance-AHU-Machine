import React from 'react';

function ThresholdInfo({ data }) {
    const parameters = [
        { key: 'Vibrasi X', unit: 'mm/s' },
        { key: 'Vibrasi Z', unit: 'mm/s' },
        { key: 'Temperature', unit: '°C' },
        { key: 'Current', unit: 'A' }
    ];

    return (
        <div className="chart-container">
            <div className="chart-title">Threshold Berdasarkan {data.standard}</div>

            <table className="threshold-table">
                <thead>
                    <tr>
                        <th>Parameter</th>
                        <th>Warning</th>
                        <th>Critical</th>
                        <th>Unit</th>
                    </tr>
                </thead>
                <tbody>
                    {parameters.map(param => {
                        const threshold = data?.thresholds?.[param.key];

                        return (
                            <tr key={param.key}>
                                <td>{param.key}</td>
                                <td style={{ color: '#f59e0b', fontWeight: 500 }}>
                                    {threshold ? threshold.warning : '-'}
                                </td>
                                <td style={{ color: '#ef4444', fontWeight: 500 }}>
                                    {threshold ? threshold.critical : '-'}
                                </td>
                                <td style={{ color: '#94a3b8' }}>{param.unit}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default ThresholdInfo;