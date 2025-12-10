import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingCart, ArrowRightLeft, UserCheck, LogOut, Shield } from 'lucide-react';
import clsx from 'clsx';

const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/purchases', icon: ShoppingCart, label: 'Purchases' },
        { to: '/transfers', icon: ArrowRightLeft, label: 'Transfers' },
        { to: '/assignments', icon: UserCheck, label: 'Assignments' },
    ];

    if (!user) return null;

    return (
        <div className="flex h-screen bg-slate-950">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
                <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                    <div className="bg-emerald-600 p-2 rounded-lg">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-white tracking-wide">ASSET MGR</h1>
                        <p className="text-xs text-slate-500">Military Logistics</p>
                    </div>
                </div>

                <div className="p-6">
                    <div className="mb-6 px-4 py-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Rank / Role</p>
                        <p className="text-sm font-medium text-emerald-400">{user.role.replace('_', ' ')}</p>
                        <p className="text-xs text-slate-500 mt-1">{user.username}</p>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    clsx(
                                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                                        isActive
                                            ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                    )
                                }
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-400/20"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
