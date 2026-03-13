import React, { useState, useEffect } from 'react';
import { login } from '../services/api';

function TypingText({ text, speed = 80 }) {
    const [displayed, setDisplayed] = useState('');

    useEffect(() => {
        let i = 0;
        setDisplayed('');
        const interval = setInterval(() => {
            if (i < text.length) {
                setDisplayed(text.slice(0, i + 1));
                i++;
            } else {
                clearInterval(interval);
            }
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);

    return <span>{displayed}</span>;
}

function AnimatedGrid() {
    return (
        <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0 }}>
            <div style={{
                position: 'absolute',
                inset: '-100%',
                backgroundImage: `
                    linear-gradient(rgba(6,182,212,0.15) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(6,182,212,0.15) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
                animation: 'gridMove 4s linear infinite',
            }} />
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.08) 0%, transparent 70%)',
                animation: 'glowPulse 4s ease-in-out infinite'
            }} />
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, var(--bg-primary) 0%, transparent 30%, transparent 70%, var(--bg-primary) 100%)'
            }} />
        </div>
    );
}

function FullPageLoader() {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20
        }}>
            <div className="loader">
                {[...Array(9)].map((_, i) => (
                    <div key={i} className={`cell ${i >= 1 && i <= 4 ? `d-${i}` : ''}`} />
                ))}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Memeriksa koneksi...</p>
        </div>
    );
}

function DBNotification({ dbConnected, onDone }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onDone, 400);
        }, 2000);
        return () => clearTimeout(timer);
    }, [onDone]);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.4s ease'
        }}>
            <div style={{
                padding: '28px 36px',
                backgroundColor: 'rgba(30,41,59,0.95)',
                border: `1px solid ${dbConnected ? 'rgba(34,197,94,0.4)' : 'rgba(245,158,11,0.4)'}`,
                borderRadius: 16,
                backdropFilter: 'blur(16px)',
                textAlign: 'center',
                boxShadow: dbConnected
                    ? '0 0 30px rgba(34,197,94,0.15)'
                    : '0 0 30px rgba(245,158,11,0.15)',
                transform: visible ? 'scale(1)' : 'scale(0.95)',
                transition: 'transform 0.4s ease',
                minWidth: 280
            }}>
                <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: dbConnected ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: 22,
                    color: dbConnected ? '#22c55e' : '#f59e0b'
                }}>
                    {dbConnected ? '✓' : '!'}
                </div>

                <p style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: dbConnected ? '#22c55e' : '#f59e0b',
                    marginBottom: 8
                }}>
                    {dbConnected ? 'Database Terhubung' : 'Database Tidak Terhubung'}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {dbConnected ? 'Menggunakan data dari MySQL' : 'Beralih ke data CSV lokal'}
                </p>

                <div style={{
                    marginTop: 16,
                    height: 3,
                    backgroundColor: 'rgba(148,163,184,0.1)',
                    borderRadius: 2,
                    overflow: 'hidden'
                }}>
                    <div style={{
                        height: '100%',
                        backgroundColor: dbConnected ? '#22c55e' : '#f59e0b',
                        borderRadius: 2,
                        animation: 'progressBar 2s linear forwards'
                    }} />
                </div>
            </div>
        </div>
    );
}

function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [dbConnected, setDbConnected] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await login(username, password);
            setLoading(false);
            setDbConnected(res.db_connected);
        } catch (err) {
            setError('Username atau password salah');
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: 'var(--bg-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
        }}>
            <AnimatedGrid />

            <div style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                filter: loading || dbConnected !== null ? 'blur(4px)' : 'none',
                transition: 'filter 0.3s ease',
                pointerEvents: loading || dbConnected !== null ? 'none' : 'auto'
            }}>
                <div className="login-card" style={{ maxWidth: 400 }}>
                    <div style={{ marginBottom: 8, textAlign: 'center' }}>
                        <h1 style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: 'var(--accent)',
                            letterSpacing: 1,
                            marginBottom: 8,
                            minHeight: 32
                        }}>
                            <TypingText text="HVAC Monitor" speed={80} />
                        </h1>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', minHeight: 20 }}>
                            <TypingText text="Predictive Maintenance AHU FT1.01" speed={40} />
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="form-control">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            <label>
                                {'Username'.split('').map((char, i) => (
                                    <span key={i} style={{ transitionDelay: `${i * 50}ms` }}>{char}</span>
                                ))}
                            </label>
                        </div>

                        <div className="form-control">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <label>
                                {'Password'.split('').map((char, i) => (
                                    <span key={i} style={{ transitionDelay: `${i * 50}ms` }}>{char}</span>
                                ))}
                            </label>
                        </div>

                        {error && (
                            <p style={{ fontSize: 13, color: '#ef4444', textAlign: 'center', marginBottom: 12 }}>
                                {error}
                            </p>
                        )}

                        <button
                            className="login-button"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            <div className="login-button-inner">
                                Masuk
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {loading && <FullPageLoader />}

            {dbConnected !== null && (
                <DBNotification
                    dbConnected={dbConnected}
                    onDone={onLoginSuccess}
                />
            )}
        </div>
    );
}

export default Login;