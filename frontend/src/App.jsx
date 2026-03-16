import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { getStatus, getHistorical, getThresholds, getPrediction, getActiveModel, switchModel } from './services/api';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [status, setStatus] = useState(null);
    const [historical, setHistorical] = useState(null);
    const [thresholds, setThresholds] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [predictionLoading, setPredictionLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeModel, setActiveModel] = useState(null);
    const [modelSwitching, setModelSwitching] = useState(false);

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

    const fetchActiveModel = async () => {
        try {
            const modelData = await getActiveModel();
            setActiveModel(modelData);
        } catch (err) {
            console.error('Gagal mengambil info model:', err);
        }
    };

    const handleSwitchModel = async (modelType) => {
        try {
            setModelSwitching(true);
            await switchModel(modelType);
            await fetchActiveModel();
            // Reset prediction supaya di-fetch ulang dengan model baru
            setPrediction(null);
        } catch (err) {
            console.error('Gagal switch model:', err);
        } finally {
            setModelSwitching(false);
        }
    };

    useEffect(() => {
        if (!isLoggedIn) return;
        fetchData(true);
        fetchActiveModel();
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
                activeModel={activeModel}
                modelSwitching={modelSwitching}
                onSwitchModel={handleSwitchModel}
            />
        </div>
    );
}

export default App;