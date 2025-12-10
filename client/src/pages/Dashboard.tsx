import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, CheckCircle, AlertCircle, X } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';

const Dashboard: React.FC = () => {
    const { } = useAuth();
    const [metrics, setMetrics] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNetDetail, setShowNetDetail] = useState(false);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/dashboard/metrics/`);
            setMetrics(res.data.metrics);
            setTransactions(res.data.transactions);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-white">Loading Dashboard...</div>;

    const MetricCard = ({ title, value, icon: Icon, color, onClick }: any) => (
        <div
            onClick={onClick}
            className={clsx(
                "bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg transition-all hover:bg-slate-750",
                onClick ? "cursor-pointer hover:border-emerald-500/50" : ""
            )}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider">{title}</h3>
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white">Mission Command</h2>
                    <p className="text-slate-400 mt-1">Real-time logistics overview</p>
                </div>
                <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                    <span className="text-slate-400 text-sm">Target Base: </span>
                    <span className="text-emerald-400 font-medium ml-2">All Bases</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard title="Opening Balance" value={metrics?.openingBalance || 0} icon={CheckCircle} color="bg-blue-600" />
                <MetricCard
                    title="Net Movement"
                    value={metrics?.netMovement || 0}
                    icon={TrendingUp}
                    color="bg-purple-600"
                    onClick={() => setShowNetDetail(true)}
                />
                <MetricCard title="Closing Balance" value={metrics?.closingBalance || 0} icon={CheckCircle} color="bg-emerald-600" />
                <MetricCard title="Expended" value={metrics?.expended || 0} icon={AlertCircle} color="bg-orange-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-white font-bold mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {/* Dummy activity feed for visual if transaction list is empty */}
                        {transactions.length === 0 ? (
                            <p className="text-slate-500 text-center py-4">No recent activity recorded.</p>
                        ) : (
                            transactions.slice(0, 5).map((tx: any) => (
                                <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                                    <span className="text-white font-medium">{tx.type}</span>
                                    <span className="text-slate-400">{tx.quantity} units</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Net Movement Modal */}
            <AnimatePresence>
                {showNetDetail && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800">
                                <h3 className="text-xl font-bold text-white">Net Movement Analysis</h3>
                                <button
                                    onClick={() => setShowNetDetail(false)}
                                    className="p-2 hover:bg-slate-700 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-3 gap-6 text-center">
                                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                                        <p className="text-emerald-400 mb-2 font-medium">Purchases</p>
                                        <p className="text-3xl font-bold text-white">+{metrics?.purchases || 0}</p>
                                    </div>
                                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                                        <p className="text-blue-400 mb-2 font-medium">Transfer In</p>
                                        <p className="text-3xl font-bold text-white">+{metrics?.transferIn || 0}</p>
                                    </div>
                                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                                        <p className="text-red-400 mb-2 font-medium">Transfer Out</p>
                                        <p className="text-3xl font-bold text-white">-{metrics?.transferOut || 0}</p>
                                    </div>
                                </div>

                                <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                    <p className="text-center text-slate-400 text-sm">
                                        Net Movement = Purchases ({metrics?.purchases || 0}) + Transfer In ({metrics?.transferIn || 0}) - Transfer Out ({metrics?.transferOut || 0})
                                    </p>
                                    <p className="text-center text-3xl font-bold text-white mt-2">
                                        {metrics?.netMovement > 0 ? '+' : ''}{metrics?.netMovement || 0}
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-800 border-t border-slate-800 text-right">
                                <button
                                    onClick={() => setShowNetDetail(false)}
                                    className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
