import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Lock, User } from 'lucide-react';
import { API_BASE_URL } from '../config';

import bg1 from '../assets/bg1.png';
import bg2 from '../assets/bg2.png';
import bg3 from '../assets/bg3.png';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    // Slider Logic
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = [bg1, bg2, bg3];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 5000); // Change every 5 seconds
        return () => clearInterval(interval);
    }, [images.length]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Assuming backend on localhost:8000
            const res = await axios.post(`${API_BASE_URL}/auth/login/`, { username, password });
            console.log("Login response:", res.data);
            login(res.data.access, res.data.user);
            navigate('/');
        } catch (err: any) {
            console.error('Login Error:', err);
            if (err.response) {
                // Server responded with a status code outside 2xx range
                setError(`Login Failed: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
            } else if (err.request) {
                // Request was made but no response received
                setError('Network Error: No response from server. Check if backend is running.');
            } else {
                // Something else happened
                setError(`Error: ${err.message}`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Slider */}
            {images.map((img, index) => (
                <div
                    key={index}
                    className="absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none"
                    style={{
                        backgroundImage: `url(${img})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: index === currentImageIndex ? 0.4 : 0
                    }}
                />
            ))}

            {/* Overlays */}
            <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950/80 pointer-events-none" />

            {/* Main Card */}
            <div className="max-w-md w-full glass-panel rounded-2xl p-8 relative z-10 animate-slide-up backdrop-blur-xl">

                {/* Header Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full" />
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-4 rounded-xl shadow-lg relative transform transition-transform group-hover:scale-105 duration-300">
                            <Shield className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mt-6 tracking-tight">
                        Military Asset Manager
                    </h2>
                    <p className="text-slate-400 text-sm mt-2 font-medium tracking-wide uppercase">Secure Logistics Portal</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 text-sm flex items-center animate-fade-in shadow-inner">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2 animate-pulse" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider ml-1">Personnel ID</label>
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input-field w-full"
                                placeholder="Enter ID"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider ml-1">Access Code</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field w-full"
                                placeholder="Enter Password"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3.5 px-4 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-emerald-900/40"
                    >
                        LOGIN
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-700/50">
                    <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest text-center">Authorized Modules (Click to Auto-fill)</h3>
                    <div className="grid grid-col-1 gap-2 text-xs">

                        {/* ADMIN */}
                        <div
                            onClick={() => { setUsername('admin'); setPassword('admin123'); }}
                            className="flex justify-between items-center text-slate-300 bg-slate-950/40 p-2.5 rounded border border-slate-800/50 hover:border-emerald-500/50 hover:bg-emerald-900/10 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center">
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                                <span className="font-semibold text-slate-400 group-hover:text-white transition-colors">ADMIN HQ</span>
                            </div>
                            <code className="text-emerald-400/90 font-mono tracking-wider group-hover:text-emerald-300">admin / admin123</code>
                        </div>

                        {/* COMMANDER */}
                        <div
                            onClick={() => { setUsername('commander_north'); setPassword('password123'); }}
                            className="flex justify-between items-center text-slate-300 bg-slate-950/40 p-2.5 rounded border border-slate-800/50 hover:border-blue-500/50 hover:bg-blue-900/10 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                                <span className="font-semibold text-slate-400 group-hover:text-white transition-colors">NORTHERN CMD</span>
                            </div>
                            <code className="text-blue-400/90 font-mono tracking-wider group-hover:text-blue-300">commander_north / password123</code>
                        </div>

                        {/* LOGISTICS */}
                        <div
                            onClick={() => { setUsername('logistics_north'); setPassword('password123'); }}
                            className="flex justify-between items-center text-slate-300 bg-slate-950/40 p-2.5 rounded border border-slate-800/50 hover:border-orange-500/50 hover:bg-orange-900/10 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center">
                                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                                <span className="font-semibold text-slate-400 group-hover:text-white transition-colors">LOGISTICS UNIT</span>
                            </div>
                            <code className="text-orange-400/90 font-mono tracking-wider group-hover:text-orange-300">logistics_north / password123</code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
