import React, { useState, useEffect } from 'react';
import {
    Users, Home, ShieldCheck, LayoutDashboard,
    AlertCircle, Search, Bell, LogOut, ChevronDown,
    Menu, X, TrendingUp, Clock, CheckCircle, XCircle, Eye,
    ClipboardList, ThumbsUp, ThumbsDown, MapPin, Calendar, Tag
} from 'lucide-react';
import { supabase } from './supabase';
import { isAuthorizedAdmin } from './adminConfig';

const TABS = [
    { id: 'dashboard', label: 'Tableau de bord', short: 'Dashboard', icon: LayoutDashboard },
    { id: 'waiting', label: 'En Attente', short: 'Attente', icon: ClipboardList, badge: 'pending' },
    { id: 'listings', label: 'Modération', short: 'Listings', icon: Home },
    { id: 'users', label: 'Utilisateurs', short: 'Users', icon: Users },
    { id: 'kyc', label: 'KYC', short: 'KYC', icon: ShieldCheck, badge: 'kyc' },
    { id: 'reports', label: 'Signalements', short: 'Reports', icon: AlertCircle },
];

// ── Auth Guard ─────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true);
        setError('');
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) { setError(authError.message); setLoading(false); return; }
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        if (!profile || !isAuthorizedAdmin(profile)) {
            await supabase.auth.signOut();
            setError('Accès refusé. Vous n\'êtes pas administrateur.');
            setLoading(false);
            return;
        }
        onLogin(profile);
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-600 rounded-2xl shadow-xl shadow-rose-200 mb-4">
                        <span className="text-white text-2xl font-black">R</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900">Rently Admin</h1>
                    <p className="text-slate-500 text-sm mt-1">Portail d'administration</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 p-8">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-all"
                                placeholder="admin@rently.rw"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mot de passe</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        {error && (
                            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm px-4 py-3 rounded-xl font-medium">
                                ⚠️ {error}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-rose-200 hover:bg-rose-700 active:scale-95 transition-all disabled:opacity-60"
                        >
                            {loading ? 'Connexion...' : 'Se connecter →'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-slate-400 mt-6">
                    Accès réservé aux administrateurs Rently
                </p>
            </div>
        </div>
    );
}

// ── Main App ───────────────────────────────────────────────────────
export default function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({ total_users: 0, pending_listings: 0, kyc_pending: 0, revenue: 0 });
    const [adminProfile, setAdminProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        checkUser();
        fetchStats();
    }, []);

    // Close sidebar on tab change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [activeTab]);

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (data && isAuthorizedAdmin(data)) {
                setAdminProfile(data);
            } else {
                await supabase.auth.signOut();
            }
        }
        setLoading(false);
    }

    async function fetchStats() {
        try {
            const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { data: pStats } = await supabase.from('platform_stats').select('*');
            const statsMap = (pStats || []).reduce((acc, curr) => { acc[curr.key] = curr.value; return acc; }, {});
            const { data: activeListings } = await supabase.from('listings').select('monthly_rent').eq('status', 'active');
            const totalRevenue = (activeListings || []).reduce((sum, l) => sum + (l.monthly_rent || 0), 0);
            const { count: kycPending } = await supabase.from('kyc_verifications').select('*', { count: 'exact', head: true }).eq('status', 'pending');
            setStats({
                total_users: usersCount || 0,
                pending_listings: Number(statsMap['pending_listings'] || 0),
                kyc_pending: kycPending || 0,
                revenue: totalRevenue
            });
        } catch (err) {
            console.error(err);
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        setAdminProfile(null);
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 text-sm font-medium">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!adminProfile) {
        return <LoginScreen onLogin={setAdminProfile} />;
    }

    return (
        <div className="flex h-screen bg-[#F8F7FC] text-slate-800 overflow-hidden">

            {/* ── MOBILE OVERLAY ─────────────────────────────── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── SIDEBAR (desktop always visible / mobile slide-in) ── */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-40
                w-72 bg-white border-r border-slate-200 flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h1 className="text-xl font-black text-rose-600 flex items-center gap-2">
                        <span className="bg-rose-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-lg">R</span>
                        RENTLY ADMIN
                    </h1>
                    <button className="lg:hidden text-slate-400 hover:text-slate-600" onClick={() => setSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                {/* Admin profile chip */}
                <div className="px-4 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3">
                        <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-sm overflow-hidden border border-rose-50">
                            {adminProfile?.avatar_url
                                ? <img src={adminProfile.avatar_url} className="w-full h-full object-cover" alt="" />
                                : (adminProfile?.full_name?.charAt(0) || 'A')}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{adminProfile?.full_name || 'Admin'}</p>
                            <p className="text-[10px] text-rose-600 font-black uppercase tracking-wider">Administrateur</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        const badgeValue = tab.badge === 'pending' ? stats.pending_listings : tab.badge === 'kyc' ? stats.kyc_pending : 0;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left ${isActive
                                    ? 'bg-rose-50 text-rose-600 font-bold shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 font-medium'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-rose-600' : 'text-slate-400'}`} />
                                    <span className="text-sm">{tab.label}</span>
                                </div>
                                {badgeValue > 0 && (
                                    <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                                        {badgeValue}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-medium text-sm"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* ── MAIN CONTENT ──────────────────────────────────── */}
            <main className="flex-1 overflow-y-auto min-w-0 pb-20 lg:pb-0">

                {/* TOP BAR */}
                <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
                    {/* Mobile: hamburger + title */}
                    <div className="flex items-center gap-3">
                        <button
                            className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={22} />
                        </button>
                        <span className="lg:hidden font-black text-slate-800 text-sm">
                            {TABS.find(t => t.id === activeTab)?.label}
                        </span>
                    </div>

                    {/* Desktop: search bar */}
                    <div className="hidden lg:flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl w-80 border border-slate-100 group focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
                        <Search className="w-4 h-4 text-slate-400 group-focus-within:text-rose-600 flex-shrink-0" />
                        <input type="text" placeholder="Rechercher..." className="bg-transparent border-none outline-none text-sm w-full" />
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-2 lg:gap-4">
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-600 rounded-full border-2 border-white" />
                        </button>
                        {/* Profile — desktop */}
                        <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-slate-100">
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-800">{adminProfile?.full_name || 'Admin'}</p>
                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Admin</p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 font-bold border-2 border-rose-50 shadow-sm overflow-hidden">
                                {adminProfile?.avatar_url
                                    ? <img src={adminProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                                    : (adminProfile?.full_name?.charAt(0) || 'A')}
                            </div>
                        </div>
                        {/* Logout — mobile only */}
                        <button
                            className="lg:hidden p-2 text-slate-400 hover:text-rose-600 transition-colors"
                            onClick={handleLogout}
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <div className="p-4 lg:p-8 max-w-7xl mx-auto">
                    {activeTab === 'dashboard' && <DashboardModule stats={stats} />}
                    {activeTab === 'waiting' && <WaitingListModule onStatsChange={fetchStats} />}
                    {activeTab === 'listings' && <ListingsModule />}
                    {activeTab === 'users' && <UsersModule />}
                    {activeTab === 'kyc' && <KYCModule />}
                    {activeTab === 'reports' && <ReportsModule />}
                </div>
            </main>

            {/* ── MOBILE BOTTOM NAV ─────────────────────────────── */}
            <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 flex items-center">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const badgeValue = tab.badge === 'pending' ? stats.pending_listings : tab.badge === 'kyc' ? stats.kyc_pending : 0;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 relative transition-colors ${isActive ? 'text-rose-600' : 'text-slate-400'
                                }`}
                        >
                            <div className="relative">
                                <Icon size={22} />
                                {badgeValue > 0 && (
                                    <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black leading-none">
                                        {badgeValue > 99 ? '99+' : badgeValue}
                                    </span>
                                )}
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-wide">{tab.short}</span>
                            {isActive && (
                                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-rose-600 rounded-full" />
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}

// ── DASHBOARD ──────────────────────────────────────────────────────
function DashboardModule({ stats }) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                    <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Bonjour Admin 👋</h2>
                    <p className="text-slate-500 mt-1 text-sm">Voici ce qu'il se passe aujourd'hui à Kigali.</p>
                </div>
                <div className="flex gap-2 sm:gap-4">
                    <button className="flex-1 sm:flex-none bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50">
                        Cette semaine <ChevronDown size={14} />
                    </button>
                    <button className="flex-1 sm:flex-none bg-rose-600 text-white px-4 sm:px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all">
                        Exporter
                    </button>
                </div>
            </div>

            {/* Stats grid: 2 cols on mobile, 4 on desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatTile label="Utilisateurs" value={stats.total_users} trend="+12% ce mois" color="blue" icon="👥" />
                <StatTile label="En attente" value={stats.pending_listings} trend="Priorité Haute" color="rose" icon="🏠" />
                <StatTile label="KYC à valider" value={stats.kyc_pending} trend="À traiter" color="amber" icon="🪪" />
                <StatTile label="Volume (RWF)" value={stats.revenue.toLocaleString()} trend="+5% vs hier" color="green" icon="💰" />
            </div>

            {/* Bottom row: 1 col on mobile, 2 on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-base font-black tracking-tight">Dernières Activités</h3>
                        <button className="text-rose-600 text-xs font-bold">Tout voir</button>
                    </div>
                    <RecentActivity />
                </div>

                <div className="bg-gradient-to-br from-rose-600 to-rose-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
                    <div className="relative z-10">
                        <h3 className="text-lg font-black mb-1 opacity-90">Performance Plateforme</h3>
                        <p className="text-rose-200 text-xs font-medium mb-6">Taux de réponse moyen</p>
                        <p className="text-5xl font-black mb-1 tracking-tighter">98.4%</p>
                        <p className="text-rose-200 text-xs font-bold uppercase tracking-widest">Réponse &lt; 1h</p>
                        <div className="mt-8 flex items-end gap-1">
                            {[4, 6, 3, 8, 5, 9, 12, 8, 10, 14, 11, 15, 13].map((h, i) => (
                                <div key={i} className="flex-1 bg-white/20 rounded-full" style={{ height: h * 4 }} />
                            ))}
                        </div>
                    </div>
                    <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                </div>
            </div>
        </div>
    );
}

function StatTile({ label, value, trend, color, icon }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        rose: 'bg-rose-50 text-rose-600',
        amber: 'bg-amber-50 text-amber-600',
        green: 'bg-green-50 text-green-600',
    };
    return (
        <div className="bg-white rounded-2xl p-4 lg:p-6 border border-slate-100 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <p className="text-slate-400 font-bold uppercase text-[9px] lg:text-[10px] tracking-widest">{label}</p>
                <span className="text-lg">{icon}</span>
            </div>
            <p className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tighter">{value}</p>
            <span className={`${colors[color]} text-[10px] px-2 py-1 rounded-lg font-black self-start`}>{trend}</span>
        </div>
    );
}

function RecentActivity() {
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        supabase
            .from('listing_review_history')
            .select('*, listings(title), profiles:admin_id(full_name)')
            .order('created_at', { ascending: false })
            .limit(5)
            .then(({ data }) => setActivities(data || []));
    }, []);

    if (activities.length === 0) return <p className="text-slate-400 text-sm italic">Aucune activité récente.</p>;

    return (
        <div className="space-y-4">
            {activities.map((act) => (
                <div key={act.id} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-base flex-shrink-0">
                        {act.action === 'approved' ? '✅' : act.action === 'rejected' ? '❌' : '⏳'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">
                            {act.profiles?.full_name || 'Admin'}{' '}
                            <span className="font-medium text-slate-500">{act.action} "{act.listings?.title || 'Listing'}"</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{new Date(act.created_at).toLocaleString('fr-FR')}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── WAITING LIST MODULE ────────────────────────────────────────────
function WaitingListModule({ onStatsChange }) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [toast, setToast] = useState(null);

    function showToast(msg, type = 'success') {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }

    async function fetchPending() {
        setLoading(true);
        const { data } = await supabase
            .from('listings')
            .select('*, profiles!landlord_id(full_name, email, avatar_url), locations!location_id(district, sector)')
            .eq('status', 'pending_review')
            .order('submitted_at', { ascending: true });
        setListings(data || []);
        setLoading(false);
    }

    useEffect(() => { fetchPending(); }, []);

    async function handleApprove(id, title) {
        setProcessing(id);
        const { error } = await supabase
            .from('listings')
            .update({ status: 'active' })
            .eq('id', id);
        if (!error) {
            showToast(`✅ "${title}" approuvé et publié !`, 'success');
            fetchPending();
            onStatsChange?.();
        } else {
            showToast('❌ Erreur lors de l\'approbation', 'error');
        }
        setProcessing(null);
    }

    async function handleReject(id, title) {
        setProcessing(id);
        const { error } = await supabase
            .from('listings')
            .update({ status: 'rejected' })
            .eq('id', id);
        if (!error) {
            showToast(`🚫 "${title}" refusé.`, 'error');
            fetchPending();
            onStatsChange?.();
        } else {
            showToast('❌ Erreur lors du rejet', 'error');
        }
        setProcessing(null);
    }

    return (
        <div className="space-y-6 relative">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold text-white transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-rose-600'
                    }`}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                    <h2 className="text-xl lg:text-2xl font-black tracking-tight flex items-center gap-2">
                        <ClipboardList className="text-rose-600" size={22} />
                        Liste d'attente
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Maisons soumises par les landlords, en attente de votre validation.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-600 text-xs px-3 py-1.5 rounded-full font-black">
                        {listings.length} en attente
                    </span>
                    <button
                        onClick={fetchPending}
                        className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full font-bold text-slate-500 hover:bg-slate-50 transition-all"
                    >
                        ↻ Actualiser
                    </button>
                </div>
            </div>

            {loading ? <LoadingState /> : listings.length === 0 ? (
                <EmptyState icon="🎉" title="Aucune maison en attente" subtitle="Toutes les soumissions ont été traitées." />
            ) : (
                <div className="space-y-4">
                    {listings.map(listing => (
                        <WaitingCard
                            key={listing.id}
                            listing={listing}
                            processing={processing === listing.id}
                            onApprove={() => handleApprove(listing.id, listing.title)}
                            onReject={() => handleReject(listing.id, listing.title)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function WaitingCard({ listing, processing, onApprove, onReject }) {
    const landlord = listing.profiles;
    const location = listing.locations;
    const submittedDate = listing.submitted_at
        ? new Date(listing.submitted_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—';

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
            <div className="flex flex-col lg:flex-row">
                {/* Image */}
                <div className="w-full lg:w-48 h-40 lg:h-auto bg-slate-100 flex-shrink-0 overflow-hidden">
                    {listing.thumbnail_url || (listing.images && listing.images[0]) ? (
                        <img
                            src={listing.thumbnail_url || listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-50">
                            🏠
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col gap-3">
                    {/* Top row */}
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-black text-slate-800 text-base truncate">{listing.title}</h3>
                            <div className="flex flex-wrap gap-3 mt-1">
                                {location && (
                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                        <MapPin size={11} /> {location.sector ? `${location.sector}, ` : ''}{location.district}
                                    </span>
                                )}
                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                    <Calendar size={11} /> Soumis le {submittedDate}
                                </span>
                            </div>
                        </div>
                        <span className="bg-amber-100 text-amber-700 text-[10px] px-2.5 py-1 rounded-full font-black uppercase flex-shrink-0">
                            En attente
                        </span>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                            <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs overflow-hidden flex-shrink-0">
                                {landlord?.avatar_url
                                    ? <img src={landlord.avatar_url} alt="" className="w-full h-full object-cover" />
                                    : (landlord?.full_name?.charAt(0) || 'L')}
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Landlord</p>
                                <p className="text-xs font-bold text-slate-700">{landlord?.full_name || '—'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-3 py-2">
                            <Tag size={12} className="text-slate-400" />
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Prix / mois</p>
                                <p className="text-xs font-black text-slate-800">{listing.monthly_rent?.toLocaleString()} RWF</p>
                            </div>
                        </div>
                        {listing.property_type && (
                            <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-3 py-2">
                                <Home size={12} className="text-slate-400" />
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Type</p>
                                    <p className="text-xs font-bold text-slate-700 capitalize">{listing.property_type}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-auto pt-2 border-t border-slate-50">
                        <button
                            onClick={onReject}
                            disabled={processing}
                            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                        >
                            <ThumbsDown size={15} />
                            Refuser
                        </button>
                        <button
                            onClick={onApprove}
                            disabled={processing}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-green-200 transition-all disabled:opacity-50"
                        >
                            {processing ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <ThumbsUp size={15} />
                            )}
                            Approuver
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── LISTINGS MODULE ────────────────────────────────────────────────
function ListingsModule() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase
            .from('listings')
            .select('*, profiles!landlord_id(full_name, is_verified), locations!location_id(district)')
            .eq('status', 'pending_review')
            .order('submitted_at', { ascending: true })
            .then(({ data }) => { setListings(data || []); setLoading(false); });
    }, []);

    if (loading) return <LoadingState />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl lg:text-2xl font-black tracking-tight">Modération des Listings</h2>
                <span className="bg-rose-50 text-rose-600 text-xs px-3 py-1.5 rounded-full font-black">{listings.length} en attente</span>
            </div>

            {listings.length === 0 ? (
                <EmptyState icon="🏠" title="Aucun listing en attente" subtitle="Tous les listings ont été modérés." />
            ) : (
                <>
                    {/* Desktop table */}
                    <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    {['Listing', 'Landlord', 'Prix', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-slate-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {listings.map(listing => (
                                    <ListingRow key={listing.id} listing={listing} />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden space-y-4">
                        {listings.map(listing => (
                            <ListingCard key={listing.id} listing={listing} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function ListingRow({ listing }) {
    return (
        <tr className="hover:bg-slate-50 transition-colors">
            <td className="px-6 py-4">
                <p className="font-bold text-sm">{listing.title}</p>
                <p className="text-xs text-slate-400">{listing.locations?.district}, Kigali</p>
            </td>
            <td className="px-6 py-4">
                <p className="font-bold text-sm">{listing.profiles?.full_name}</p>
                {listing.profiles?.is_verified && <p className="text-xs text-green-600 font-bold">Vérifié ✓</p>}
            </td>
            <td className="px-6 py-4">
                <p className="font-bold text-sm">{listing.monthly_rent?.toLocaleString()} RWF</p>
                <p className="text-xs text-slate-400">/mois</p>
            </td>
            <td className="px-6 py-4">
                <span className="bg-amber-100 text-amber-600 text-[10px] px-2 py-1 rounded-full font-black uppercase">
                    En attente
                </span>
            </td>
            <td className="px-6 py-4">
                <button className="bg-slate-100 text-slate-600 text-xs px-4 py-2 rounded-lg font-bold hover:bg-slate-200 flex items-center gap-1">
                    <Eye size={12} /> Examiner
                </button>
            </td>
        </tr>
    );
}

function ListingCard({ listing }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-sm">{listing.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{listing.locations?.district}, Kigali</p>
                </div>
                <span className="bg-amber-100 text-amber-600 text-[9px] px-2 py-1 rounded-full font-black uppercase flex-shrink-0">
                    En attente
                </span>
            </div>
            <div className="flex justify-between text-sm">
                <div>
                    <p className="text-xs text-slate-400 font-medium">Landlord</p>
                    <p className="font-bold">{listing.profiles?.full_name}</p>
                    {listing.profiles?.is_verified && <p className="text-xs text-green-600 font-bold">Vérifié ✓</p>}
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-400 font-medium">Prix</p>
                    <p className="font-bold">{listing.monthly_rent?.toLocaleString()} RWF</p>
                    <p className="text-xs text-slate-400">/mois</p>
                </div>
            </div>
            <button className="w-full bg-rose-600 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-rose-700 transition-colors">
                <Eye size={14} /> Examiner ce listing
            </button>
        </div>
    );
}

// ── USERS MODULE ───────────────────────────────────────────────────
function UsersModule() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        supabase.from('profiles').select('*').order('created_at', { ascending: false })
            .then(({ data }) => { setUsers(data || []); setLoading(false); });
    }, []);

    const filtered = users.filter(u =>
        !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <LoadingState />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h2 className="text-xl lg:text-2xl font-black tracking-tight">Utilisateurs & Landlords</h2>
                <span className="text-xs text-slate-400 font-bold bg-white border border-slate-100 px-3 py-1.5 rounded-full self-start sm:self-auto">
                    {users.length} comptes
                </span>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
                <Search size={16} className="text-slate-400" />
                <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    className="flex-1 text-sm outline-none"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            {['Nom', 'Email', 'Rôle', 'Vérifié', 'Inscrit le'].map(h => (
                                <th key={h} className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-slate-400">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-bold text-sm">{user.full_name}</td>
                                <td className="px-6 py-4 text-slate-500 text-sm">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase ${user.role === 'landlord' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {user.is_verified
                                        ? <span className="text-green-600 font-bold text-sm">✅ Oui</span>
                                        : <span className="text-slate-400 text-sm">❌ Non</span>}
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-400">
                                    {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
                {filtered.map(user => (
                    <div key={user.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${user.role === 'landlord' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                            {user.full_name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-sm truncate">{user.full_name}</p>
                                {user.is_verified && <span className="text-xs">✅</span>}
                            </div>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                        <span className={`text-[9px] px-2 py-1 rounded-full font-black uppercase flex-shrink-0 ${user.role === 'landlord' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                            {user.role}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── KYC MODULE ─────────────────────────────────────────────────────
function KYCModule() {
    const [kyc, setKyc] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase
            .from('kyc_verifications')
            .select('*, profiles:user_id(full_name, email)')
            .eq('status', 'pending')
            .then(({ data }) => { setKyc(data || []); setLoading(false); });
    }, []);

    if (loading) return <LoadingState />;

    return (
        <div className="space-y-6">
            <h2 className="text-xl lg:text-2xl font-black tracking-tight">Vérification Documents (KYC)</h2>
            {kyc.length === 0 ? (
                <EmptyState icon="🛡️" title="Aucune demande KYC en attente" subtitle="Toutes les vérifications ont été traitées." />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {kyc.map(item => (
                        <div key={item.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-start mb-5">
                                <div>
                                    <p className="font-bold">{item.profiles?.full_name}</p>
                                    <p className="text-xs text-slate-500">{item.profiles?.email}</p>
                                </div>
                                <span className="bg-amber-100 text-amber-600 text-[10px] px-2 py-1 rounded-full font-black uppercase">En attente</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-100">
                                    <img src={item.doc_front_url} alt="ID" className="w-full h-full object-cover" />
                                </div>
                                <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-100">
                                    <img src={item.selfie_url} alt="Selfie" className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="bg-slate-100 text-slate-600 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 flex items-center justify-center gap-2">
                                    <XCircle size={16} /> Rejeter
                                </button>
                                <button className="bg-rose-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-rose-700 shadow-lg shadow-rose-200 flex items-center justify-center gap-2">
                                    <CheckCircle size={16} /> Approuver
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── REPORTS MODULE ─────────────────────────────────────────────────
function ReportsModule() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase
            .from('platform_reports')
            .select('*, reporter:profiles!reporter_id(full_name), listing:listings(title)')
            .order('created_at', { ascending: false })
            .then(({ data }) => { setReports(data || []); setLoading(false); });
    }, []);

    if (loading) return <LoadingState />;

    return (
        <div className="space-y-6">
            <h2 className="text-xl lg:text-2xl font-black tracking-tight">Signalements Plateforme</h2>
            {reports.length === 0 ? (
                <EmptyState icon="🚩" title="Aucun signalement" subtitle="La plateforme est propre !" />
            ) : (
                <>
                    {/* Desktop table */}
                    <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    {['Type', 'Cible', 'Reporter', 'Status', 'Date'].map(h => (
                                        <th key={h} className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-slate-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {reports.map(report => (
                                    <tr key={report.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <span className="bg-rose-50 text-rose-600 text-[10px] px-2 py-1 rounded-md font-bold uppercase">{report.category}</span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-sm">{report.listing?.title || 'Utilisateur'}</td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">{report.reporter?.full_name}</td>
                                        <td className="px-6 py-4 text-sm italic">{report.status}</td>
                                        <td className="px-6 py-4 text-xs text-slate-400">{new Date(report.created_at).toLocaleDateString('fr-FR')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden space-y-3">
                        {reports.map(report => (
                            <div key={report.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="bg-rose-50 text-rose-600 text-[10px] px-2 py-1 rounded-md font-bold uppercase">{report.category}</span>
                                    <span className="text-xs text-slate-400">{new Date(report.created_at).toLocaleDateString('fr-FR')}</span>
                                </div>
                                <p className="font-bold text-sm">{report.listing?.title || 'Utilisateur'}</p>
                                <div className="flex justify-between mt-2 text-xs text-slate-400">
                                    <span>Par : {report.reporter?.full_name}</span>
                                    <span className="italic">{report.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// ── Shared UI components ───────────────────────────────────────────
function LoadingState() {
    return (
        <div className="flex items-center justify-center py-20">
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-medium">Chargement...</p>
            </div>
        </div>
    );
}

function EmptyState({ icon, title, subtitle }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
            <div className="text-5xl mb-4">{icon}</div>
            <p className="text-lg font-bold text-slate-700 mb-2">{title}</p>
            <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
    );
}
