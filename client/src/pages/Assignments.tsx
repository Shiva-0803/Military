
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCheck, Calendar, MapPin, Package, User } from 'lucide-react';
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
    recipient: string;
    date: string;
    performed_by_name: string;
}

const Assignments: React.FC = () => {
    const [bases, setBases] = useState<Base[]>([]);
    const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
    const [recentAssignments, setRecentAssignments] = useState<Transaction[]>([]);

    const [formData, setFormData] = useState({
        asset_type: '',
        quantity: 1,
        from_base: '',
        recipient: ''
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

            const assignments = transactionsRes.data.filter((t: any) => t.type === 'ASSIGNMENT');
            setRecentAssignments(assignments);
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

        try {
            const payload = {
                type: 'ASSIGNMENT',
                asset_type: parseInt(formData.asset_type),
                quantity: parseInt(formData.quantity.toString()),
                from_base: parseInt(formData.from_base),
                recipient: formData.recipient,
            };

            await axios.post(`${API_BASE_URL}/transactions/`, payload);

            setMessage({ type: 'success', text: 'Asset assigned successfully!' });
            setFormData({ ...formData, quantity: 1, recipient: '' });
            fetchData();
        } catch (error: any) {
            console.error("Assignment error:", error);
            const errorMsg = error.response?.data?.detail || "Failed to assign asset.";
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-white p-8">Loading assignment data...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Personnel Assignment</h2>
                    <p className="text-slate-400 mt-1">Issue assets to personnel/units</p>
                </div>
                <div className="bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                    <UserCheck className="w-8 h-8 text-orange-500" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <User className="w-5 h-5 mr-2 text-orange-500" />
                            Issue Asset
                        </h3>

                        {message && (
                            <div className={`p-3 rounded-lg mb-4 text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Issuing Base</label>
                                <select
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                    value={formData.from_base}
                                    onChange={(e) => setFormData({ ...formData, from_base: e.target.value })}
                                    required
                                >
                                    <option value="">Select Base</option>
                                    {bases.map(base => (
                                        <option key={base.id} value={base.id}>{base.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Asset Type</label>
                                <select
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                                <label className="block text-sm font-medium text-slate-400 mb-2">Recipient (Name/Unit ID)</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                    value={formData.recipient}
                                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                                    placeholder="e.g. Sgt. Miller / Unit 101"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-orange-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Processing...' : 'Confirm Assignment'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-slate-700">
                            <h3 className="text-xl font-bold text-white">Assignment Records</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Recipient</th>
                                        <th className="px-6 py-4">Asset</th>
                                        <th className="px-6 py-4 text-right">Qty</th>
                                        <th className="px-6 py-4">Origin</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {recentAssignments.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                                No assignments recorded.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentAssignments.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-4 text-slate-300">
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                                                        {new Date(tx.date).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-white">
                                                    {tx.recipient}
                                                </td>
                                                <td className="px-6 py-4 text-slate-300">
                                                    <div className="flex items-center">
                                                        <Package className="w-4 h-4 mr-2 text-orange-500" />
                                                        {tx.asset_type_name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono font-bold text-orange-400">
                                                    -{tx.quantity}
                                                </td>
                                                <td className="px-6 py-4 text-slate-400 text-sm">
                                                    <div className="flex items-center">
                                                        <MapPin className="w-4 h-4 mr-2 text-slate-500" />
                                                        {tx.from_base_name}
                                                    </div>
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

export default Assignments;
