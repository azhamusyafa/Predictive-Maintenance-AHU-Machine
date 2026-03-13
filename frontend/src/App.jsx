import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { getStatus, getHistorical, getThresholds, getPrediction } from './services/api';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [status, setStatus] = useState(null);
    const [historical, setHistorical] = useState(null);
    const [thresholds, setThresholds] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [predictionLoading, setPredictionLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async (withLoading = false) => {
        try {
            if (withLoading) setLoading(true);
            const [statusRes, historicalRes, thresholdRes] = await Promise.all([
                getStatus(),
                getHistorical(null, null, 500),
                getThresholds()
            ]);
            setStatus(statusRes);
            setHistorical(historicalRes);
            setThresholds(thresholdRes);
            setError(null);
        } catch (err) {
            setError('Gagal mengambil data');
        } finally {
            if (withLoading) setLoading(false);
        }
    }

    const fetchPrediction = async () => {
        try {
            setPredictionLoading(true);
            const predictionData = await getPrediction(14);
            setPrediction(predictionData);
        } catch (err) {
            console.error('Gagal mengambil prediksi:', err);
        } finally {
            setPredictionLoading(false);
        }
    }

    useEffect(() => {
        if (!isLoggedIn) return;
        fetchData(true);
        const interval = setInterval(() => fetchData(false), 5000);
        return () => clearInterval(interval);
    }, [isLoggedIn]);

    if (!isLoggedIn) {
        return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
    }

    if (loading) {
        return (
            <div className="loading">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                    <div className="loader">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className={`cell ${i >= 1 && i <= 4 ? `d-${i}` : ''}`} />
                        ))}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Memuat data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="loading">{error}</div>;
    }

    return (
        <div className="app-layout dashboard-bg">
            <Dashboard
                status={status}
                historical={historical}
                thresholds={thresholds}
                prediction={prediction}
                predictionLoading={predictionLoading}
                fetchPrediction={fetchPrediction}
            />
        </div>
    );
}

export default App;