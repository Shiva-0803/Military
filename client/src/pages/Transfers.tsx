
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, ArrowRight, Calendar, MapPin, Package } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface Base {
    id: number;
    name: string;
}

interface AssetType {
    id: number;
    name: string;
}

interface Transaction {
    id: number;
    type: string;
    asset_type_name: string;
    quantity: number;
    from_base_name: string;
    to_base_name: string;
    date: string;
    performed_by_name: string;
}

const Transfers: React.FC = () => {
    const [bases, setBases] = useState<Base[]>([]);
    const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
    const [recentTransfers, setRecentTransfers] = useState<Transaction[]>([]);

    const [formData, setFormData] = useState({
        asset_type: '',
        quantity: 1,
        from_base: '',
        to_base: ''
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [basesRes, assetsRes, transactionsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/bases/`),
                axios.get(`${API_BASE_URL}/assets/`),
                axios.get(`${API_BASE_URL}/transactions/`)
            ]);

            setBases(basesRes.data);
            setAssetTypes(assetsRes.data);

            const transfers = transactionsRes.data.filter((t: any) => t.type === 'TRANSFER');
            setRecentTransfers(transfers);
        } catch (error) {
            console.error("Error fetching data:", error);
            setMessage({ type: 'error', text: 'Failed to load initial data.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        if (formData.from_base === formData.to_base) {
            setMessage({ type: 'error', text: 'Source and Destination bases cannot be the same.' });
            setSubmitting(false);
            return;
        }

        try {
            const payload = {
                type: 'TRANSFER',
                asset_type: parseInt(formData.asset_type),
                quantity: parseInt(formData.quantity.toString()),
                from_base: parseInt(formData.from_base),
                to_base: parseInt(formData.to_base),
            };

            await axios.post(`${API_BASE_URL}/transactions/`, payload);

            setMessage({ type: 'success', text: 'Transfer initiated successfully!' });
            setFormData({ ...formData, quantity: 1 });
            fetchData();
        } catch (error: any) {
            console.error("Transfer error:", error);
            const errorMsg = error.response?.data?.detail || "Failed to initiate transfer.";
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-white p-8">Loading logistics data...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Logistics Transfer</h2>
                    <p className="text-slate-400 mt-1">Move assets between operating bases</p>
                </div>
                <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                    <Truck className="w-8 h-8 text-blue-500" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <ArrowRight className="w-5 h-5 mr-2 text-blue-500" />
                            New Transfer
                        </h3>

                        {message && (
                            <div className={`p-3 rounded-lg mb-4 text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Origin Base</label>
                                <select
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={formData.from_base}
                                    onChange={(e) => setFormData({ ...formData, from_base: e.target.value })}
                                    required
                                >
                                    <option value="">Select Origin</option>
                                    {bases.map(base => (
                                        <option key={base.id} value={base.id}>{base.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Destination Base</label>
                                <select
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={formData.to_base}
                                    onChange={(e) => setFormData({ ...formData, to_base: e.target.value })}
                                    required
                                >
                                    <option value="">Select Destination</option>
                                    {bases.map(base => (
                                        <option key={base.id} value={base.id}>{base.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Asset Type</label>
                                <select
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={formData.asset_type}
                                    onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
                                    required
                                >
                                    <option value="">Select Asset</option>
                                    {assetTypes.map(asset => (
                                        <option key={asset.id} value={asset.id}>{asset.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Processing...' : 'Initiate Transfer'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-slate-700">
                            <h3 className="text-xl font-bold text-white">Transfer History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Route</th>
                                        <th className="px-6 py-4">Asset</th>
                                        <th className="px-6 py-4 text-right">Qty</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {recentTransfers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                                No transfers recorded.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentTransfers.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-4 text-slate-300">
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                                                        {new Date(tx.date).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center text-sm">
                                                        <span className="text-slate-400">{tx.from_base_name}</span>
                                                        <ArrowRight className="w-4 h-4 mx-2 text-slate-600" />
                                                        <span className="text-emerald-400">{tx.to_base_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-white">
                                                    {tx.asset_type_name}
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono font-bold text-blue-400">
                                                    {tx.quantity}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded text-xs border border-emerald-500/20">
                                                        COMPLETED
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transfers;
