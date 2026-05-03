import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Database,
  Eye,
  FileCheck2,
  FileText,
  Home,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Package,
  RefreshCw,
  Search,
  Server,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
  Users,
  Wifi,
  WifiOff,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { supabase } from './supabase';
import { isAuthorizedAdmin } from './adminConfig';
import { useI18n } from './i18n.jsx';

const LISTING_STATUSES = ['pending_review', 'revision_needed', 'active', 'rejected', 'draft'];
const REPORT_STATUSES = ['pending', 'reviewed', 'resolved', 'dismissed'];
const KYC_STATUSES = ['pending', 'approved', 'rejected'];

function useTabs() {
  const { t } = useI18n();
  return [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'moderation', label: t('nav.moderation'), icon: FileCheck2, badge: 'pendingListings' },
    { id: 'users', label: t('nav.users'), icon: Users },
    { id: 'kyc', label: t('nav.kyc'), icon: ShieldCheck, badge: 'pendingKyc' },
    { id: 'reports', label: t('nav.reports'), icon: AlertTriangle, badge: 'pendingReports' },
    { id: 'visits', label: t('nav.visits'), icon: CalendarDays },
    { id: 'payments', label: t('nav.payments'), icon: CreditCard },
    { id: 'system', label: t('nav.system'), icon: Settings },
  ];
}

function useFormatDate() {
  const { dateLocale } = useI18n();
  return function formatDate(value) {
    if (!value) return 'N/A';
    try {
      return new Intl.DateTimeFormat(dateLocale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(value));
    } catch {
      return 'N/A';
    }
  };
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} RWF`;
}

function safeLower(value) {
  return String(value || '').toLowerCase();
}

function statusClass(status) {
  const map = {
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    approved: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    pending: 'bg-amber-50 text-amber-700 ring-amber-100',
    pending_review: 'bg-amber-50 text-amber-700 ring-amber-100',
    revision_needed: 'bg-blue-50 text-blue-700 ring-blue-100',
    reviewed: 'bg-blue-50 text-blue-700 ring-blue-100',
    draft: 'bg-slate-50 text-slate-600 ring-slate-100',
    rejected: 'bg-red-50 text-red-700 ring-red-100',
    dismissed: 'bg-slate-50 text-slate-600 ring-slate-100',
    cancelled: 'bg-red-50 text-red-700 ring-red-100',
    failed: 'bg-red-50 text-red-700 ring-red-100',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  };
  return map[status] || 'bg-slate-50 text-slate-600 ring-slate-100';
}

function StatusBadge({ value }) {
  const label = String(value || 'unknown').replaceAll('_', ' ');
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ring-inset ${statusClass(value)}`}>
      <span className="h-1 w-1 rounded-full bg-current" />
      {label}
    </span>
  );
}

function LangSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
      <button
        onClick={() => setLang('fr')}
        className={`rounded-lg px-2.5 py-1 text-xs font-black transition ${lang === 'fr' ? 'bg-[#6C3FC4] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
      >
        FR
      </button>
      <button
        onClick={() => setLang('en')}
        className={`rounded-lg px-2.5 py-1 text-xs font-black transition ${lang === 'en' ? 'bg-[#6C3FC4] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
      >
        EN
      </button>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile || !isAuthorizedAdmin(profile)) {
      await supabase.auth.signOut();
      setError(t('auth.error'));
      setLoading(false);
      return;
    }

    onLogin(profile);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#F5F0FF] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center p-4 sm:p-6">
        <div className="grid w-full items-stretch gap-0 overflow-hidden rounded-[32px] bg-white shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
          
          {/* Left section: Branding & Info (Hidden on small mobile if needed, but here we stack) */}
          <section className="relative flex flex-col justify-center bg-gradient-to-br from-[#4A2D9C] via-[#6C3FC4] to-[#8B5CF6] p-8 sm:p-12">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-white/10" />
            <div className="relative">
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/30 bg-white/20 backdrop-blur-md">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-base font-black text-[#6C3FC4]">R</div>
                  </div>
                  <div>
                    <p className="text-sm font-black tracking-tight">Rently</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Admin Portal</p>
                  </div>
                </div>
                <LangSwitcher />
              </div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/70">{t('auth.tagline')}</p>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                {t('auth.heading')}
              </h1>
              <p className="mt-6 hidden max-w-md text-sm leading-relaxed text-white/70 sm:block">
                {t('auth.desc')}
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {['Secure', 'Real-time', 'Kigali Hub'].map((item) => (
                  <span key={item} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Right section: Login Form */}
          <section className="flex flex-col justify-center bg-white p-8 sm:p-12 text-slate-900">
            <div className="mb-8">
              <h2 className="text-2xl font-black tracking-tight">{t('auth.title')}</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">{t('auth.subtitle')}</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-5">
              <Field label={t('auth.email')}>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="input"
                  placeholder="admin@rently.rw"
                  required
                />
              </Field>
              <Field label={t('auth.password')}>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="input"
                  placeholder="••••••••"
                  required
                />
              </Field>
              {error && (
                <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 ring-1 ring-red-100">
                  <AlertTriangle size={16} className="shrink-0" />
                  {error}
                </div>
              )}
              <button className="btn-primary w-full py-4 text-base" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {t('auth.loading')}
                  </div>
                ) : t('auth.submit')}
              </button>
            </form>
            <p className="mt-8 text-center text-[11px] font-bold uppercase tracking-widest text-slate-400">
              © {new Date().getFullYear()} Rently Kigali • Rwanda
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}

export default function App() {
  const { t } = useI18n();
  const [adminProfile, setAdminProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState(defaultStats());

  const TABS = useTabs();

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (adminProfile) fetchStats();
  }, [adminProfile, refreshKey]);

  async function checkSession() {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      if (profile && isAuthorizedAdmin(profile)) setAdminProfile(profile);
      else await supabase.auth.signOut();
    }
    setLoading(false);
  }

  async function fetchStats() {
    const next = defaultStats();

    const [
      users,
      tenants,
      landlords,
      listings,
      pendingListings,
      activeListings,
      pendingKyc,
      pendingReports,
      visits,
      pendingPayments,
      revenue,
    ] = await Promise.all([
      countRows('profiles'),
      countRows('profiles', (q) => q.eq('role', 'tenant')),
      countRows('profiles', (q) => q.eq('role', 'landlord')),
      countRows('listings'),
      countRows('listings', (q) => q.eq('status', 'pending_review')),
      countRows('listings', (q) => q.eq('status', 'active')),
      countRows('kyc_verifications', (q) => q.eq('status', 'pending')),
      countRows('platform_reports', (q) => q.eq('status', 'pending')),
      countRows('visits'),
      countRows('payment_sessions', (q) => q.eq('status', 'pending')),
      fetchRevenue(),
    ]);

    next.totalUsers = users;
    next.tenants = tenants;
    next.landlords = landlords;
    next.totalListings = listings;
    next.pendingListings = pendingListings;
    next.activeListings = activeListings;
    next.pendingKyc = pendingKyc;
    next.pendingReports = pendingReports;
    next.totalVisits = visits;
    next.pendingPayments = pendingPayments;
    next.revenue = revenue;
    setStats(next);
  }

  async function countRows(table, apply) {
    let query = supabase.from(table).select('*', { count: 'exact', head: true });
    if (apply) query = apply(query);
    const { count, error } = await query;
    if (error) return 0;
    return count || 0;
  }

  async function fetchRevenue() {
    const { data, error } = await supabase.from('platform_revenue').select('amount_rwf');
    if (error) return 0;
    return (data || []).reduce((sum, row) => sum + Number(row.amount_rwf || 0), 0);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setAdminProfile(null);
  }

  const badges = {
    pendingListings: stats.pendingListings,
    pendingKyc: stats.pendingKyc,
    pendingReports: stats.pendingReports,
  };

  if (loading) return <FullPageLoader />;
  if (!adminProfile) return <LoginScreen onLogin={setAdminProfile} />;

  const ActiveModule = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard stats={stats} />;
      case 'moderation': return <Moderation admin={adminProfile} onChange={() => setRefreshKey((key) => key + 1)} />;
      case 'users': return <UsersModule onChange={() => setRefreshKey((key) => key + 1)} />;
      case 'kyc': return <KycModule admin={adminProfile} onChange={() => setRefreshKey((key) => key + 1)} />;
      case 'reports': return <ReportsModule onChange={() => setRefreshKey((key) => key + 1)} />;
      case 'visits': return <VisitsModule />;
      case 'payments': return <PaymentsModule />;
      case 'system': return <SystemModule stats={stats} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden text-slate-900">
      {sidebarOpen && <button aria-label={t('common.closeMenu')} className="fixed inset-0 z-30 bg-slate-950/20 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/40 bg-white/60 backdrop-blur-2xl transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between border-b border-slate-100/50 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#6C3FC4] to-[#4A2D9C] font-black text-white shadow-lg shadow-violet-200">
              R
            </div>
            <div>
              <p className="text-base font-black leading-tight tracking-tight text-slate-900">Rently Admin</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-500/60">Workspace</p>
            </div>
          </div>
          <button className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-slate-100/50 p-4">
          <div className="group relative overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-50 to-white p-4 ring-1 ring-slate-100 transition-all hover:ring-violet-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6C3FC4] text-white shadow-md">
                <UserCheck size={18} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-800">{adminProfile.full_name || 'Admin'}</p>
                <p className="truncate text-[10px] font-bold text-slate-400">{adminProfile.email}</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3 sidebar-scroll">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            const badge = tab.badge ? badges[tab.badge] : 0;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-bold transition-all duration-200 ${active ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 translate-x-1' : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'}`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  {tab.label}
                </span>
                {badge > 0 && <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${active ? 'bg-white text-violet-600' : 'bg-violet-600 text-white'}`}>{badge}</span>}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-100/50 p-4">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600">
            <LogOut size={18} />
            {t('common.logout')}
          </button>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10">
          <div className="mx-auto max-w-[1600px] space-y-8">
            <header className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <button className="rounded-2xl bg-white p-3 text-slate-500 shadow-sm ring-1 ring-slate-100 lg:hidden" onClick={() => setSidebarOpen(true)}>
                  <Menu size={22} />
                </button>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                    {TABS.find((t) => t.id === activeTab)?.label}
                  </h1>
                  <p className="mt-1 font-medium text-slate-500/80">{t('common.subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <LangSwitcher />
                <button onClick={() => setRefreshKey((k) => k + 1)} className="btn-muted">
                  <RefreshCw size={16} />
                  {t('common.refresh')}
                </button>
              </div>
            </header>

            <ActiveModule />
          </div>
        </main>
      </section>
    </div>
  );
}

function defaultStats() {
  return {
    totalUsers: 0,
    tenants: 0,
    landlords: 0,
    totalListings: 0,
    pendingListings: 0,
    activeListings: 0,
    pendingKyc: 0,
    pendingReports: 0,
    totalVisits: 0,
    pendingPayments: 0,
    revenue: 0,
  };
}

function Dashboard({ stats }) {
  const { t } = useI18n();
  const cards = [
    { label: t('dashboard.users'), value: stats.totalUsers, helper: `${stats.tenants} tenants, ${stats.landlords} landlords`, icon: Users },
    { label: t('dashboard.activeListings'), value: stats.activeListings, helper: `${stats.pendingListings} ${t('dashboard.pending')}`, icon: Home },
    { label: t('dashboard.kycTodo'), value: stats.pendingKyc, helper: t('dashboard.landlordVerif'), icon: ShieldCheck },
    { label: t('dashboard.reports'), value: stats.pendingReports, helper: t('dashboard.openTickets'), icon: AlertTriangle },
    { label: t('dashboard.visits'), value: stats.totalVisits, helper: t('dashboard.totalRequests'), icon: CalendarDays },
    { label: t('dashboard.revenue'), value: formatMoney(stats.revenue), helper: `${stats.pendingPayments} ${t('dashboard.pendingPayments')}`, icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="panel">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="section-title">{t('dashboard.prioritiesTitle')}</h2>
              <p className="section-subtitle">{t('dashboard.prioritiesDesc')}</p>
            </div>
            <SlidersHorizontal size={18} className="text-slate-400" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <PriorityCard label={t('dashboard.toModerate')} value={stats.pendingListings} tone="violet" />
            <PriorityCard label={t('dashboard.kycPending')} value={stats.pendingKyc} tone="amber" />
            <PriorityCard label={t('dashboard.openReports')} value={stats.pendingReports} tone="blue" />
          </div>
        </div>

        <div className="panel">
          <h2 className="section-title">{t('dashboard.healthTitle')}</h2>
          <div className="mt-5 space-y-4">
            <HealthRow label={t('dashboard.activeListingsHealth')} value={stats.activeListings} total={Math.max(stats.totalListings, 1)} />
            <HealthRow label={t('dashboard.landlordUsers')} value={stats.landlords} total={Math.max(stats.totalUsers, 1)} />
            <HealthRow label={t('dashboard.kycRequests')} value={stats.pendingKyc} total={Math.max(stats.landlords, 1)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, helper, icon: Icon }) {
  return (
    <div className="panel group relative overflow-hidden">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-violet-50/50 transition-all duration-500 group-hover:scale-150" />
      <div className="relative flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{value}</p>
          <p className="mt-2 truncate text-xs font-bold text-slate-500/70">{helper}</p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-200 transition-transform duration-300 group-hover:rotate-12">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function PriorityCard({ label, value, tone }) {
  const colors = {
    violet: 'from-violet-500 to-indigo-600 shadow-violet-100',
    amber: 'from-amber-400 to-orange-500 shadow-amber-100',
    blue: 'from-blue-500 to-cyan-600 shadow-blue-100',
  };
  return (
    <div className={`group relative overflow-hidden rounded-[24px] bg-gradient-to-br ${colors[tone]} p-5 text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}>
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-150" />
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">{label}</p>
      <p className="mt-3 text-3xl font-black">{value}</p>
      <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-white/80">
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
        {value > 0 ? 'Requires attention' : 'All caught up'}
      </div>
    </div>
  );
}

function HealthRow({ label, value, total }) {
  const pct = Math.min(100, Math.round((Number(value || 0) / Number(total || 1)) * 100));
  return (
    <div className="group">
      <div className="mb-2.5 flex items-center justify-between text-sm">
        <span className="font-bold text-slate-600 transition-colors group-hover:text-violet-700">{label}</span>
        <span className="font-black text-slate-400">{pct}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 p-0.5 ring-1 ring-slate-200/50">
        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 transition-all duration-1000 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Moderation({ admin, onChange }) {
  const { t } = useI18n();
  const formatDate = useFormatDate();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('pending_review');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchRows();
  }, [status]);

  async function fetchRows() {
    setLoading(true);
    let query = supabase
      .from('listings')
      .select('*, profiles:landlord_id(id, full_name, email, is_verified), locations:location_id(district, sector)')
      .order('submitted_at', { ascending: true, nullsFirst: false })
      .limit(80);
    if (status !== 'all') query = query.eq('status', status);
    const { data } = await query;
    setRows(data || []);
    setLoading(false);
  }

  async function reviewListing(listing, nextStatus, note = '') {
    const update = {
      status: nextStatus,
      reviewed_at: new Date().toISOString(),
      reviewed_by: admin.id,
      review_note: note || null,
    };
    if (nextStatus === 'active') {
      update.rejection_reason = null;
      update.rejection_category = null;
    }
    if (nextStatus === 'revision_needed') update.revision_count = Number(listing.revision_count || 0) + 1;

    const { error } = await supabase.from('listings').update(update).eq('id', listing.id);
    if (error) {
      alert(error.message);
      return;
    }

    await supabase.from('listing_review_history').insert({
      listing_id: listing.id,
      admin_id: admin.id,
      action: nextStatus === 'active' ? 'approved' : nextStatus === 'rejected' ? 'rejected' : 'revision_requested',
      note: note || null,
      previous_status: listing.status,
      new_status: nextStatus,
    });

    await supabase.from('notifications').insert({
      user_id: listing.landlord_id,
      title: nextStatus === 'active' ? 'Listing approved' : nextStatus === 'rejected' ? 'Listing rejected' : 'Revision needed',
      body: note || `Your listing "${listing.title}" has been reviewed.`,
      type: 'listing_review',
      data: { listing_id: listing.id, status: nextStatus },
    }).then(() => null);

    setSelected(null);
    await fetchRows();
    onChange?.();
  }

  const filtered = rows.filter((row) => {
    const haystack = `${row.title} ${row.description} ${row.profiles?.full_name} ${row.profiles?.email} ${row.locations?.district}`;
    return safeLower(haystack).includes(safeLower(search));
  });

  return (
    <div className="space-y-5">
      <Toolbar
        search={search}
        setSearch={setSearch}
        placeholder={t('moderation.searchPlaceholder')}
        right={
          <select className="select" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">{t('common.allStatuses')}</option>
            {LISTING_STATUSES.map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}
          </select>
        }
      />

      <div className="min-h-[400px]">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-[32px] bg-white/40 ring-1 ring-white/60" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title={t('moderation.empty')} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filtered.map((listing) => (
              <div key={listing.id} className="group flex flex-col overflow-hidden rounded-[32px] border border-white/60 bg-white/50 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/5">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div className="absolute inset-0 bg-slate-200 animate-pulse" />
                  <ListingImage listingId={listing.id} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute left-4 top-4">
                    <StatusBadge value={listing.status} />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <p className="text-sm font-black">{formatMoney(listing.monthly_rent)}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">{listing.listing_category || 'house'}</p>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-1 text-base font-black text-slate-900 group-hover:text-violet-700 transition-colors">{listing.title}</h3>
                  <div className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-500">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100">
                      <UserCheck size={10} />
                    </div>
                    <p className="truncate">{listing.profiles?.full_name || 'Landlord'}</p>
                  </div>
                  <div className="mt-5 flex items-center gap-2">
                    <button className="btn-primary w-full py-2.5 text-xs" onClick={() => setSelected(listing)}>
                      <Eye size={14} />
                      {t('moderation.review')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <ListingReviewModal
          listing={selected}
          onClose={() => setSelected(null)}
          onApprove={(note) => reviewListing(selected, 'active', note)}
          onRevision={(note) => reviewListing(selected, 'revision_needed', note)}
          onReject={(note) => reviewListing(selected, 'rejected', note)}
        />
      )}
    </div>
  );
}

function ListingReviewModal({ listing, onClose, onApprove, onRevision, onReject }) {
  const { t } = useI18n();
  const [note, setNote] = useState('');
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);

  useEffect(() => {
    fetchImages();
  }, [listing.id]);

  async function fetchImages() {
    setLoadingImages(true);
    const { data } = await supabase
      .from('listing_images')
      .select('*')
      .eq('listing_id', listing.id)
      .order('display_order', { ascending: true });
    
    // Pour chaque image, générer une URL publique ou signée
    const imagesWithUrls = await Promise.all((data || []).map(async (img) => {
      if (img.url.startsWith('http')) return img;
      const { data: signed } = await supabase.storage.from('listings').createSignedUrl(img.url, 3600);
      return { ...img, url: signed?.signedUrl || img.url };
    }));

    setImages(imagesWithUrls);
    setLoadingImages(false);
  }

  return (
    <Modal title={t('moderation.reviewTitle')} onClose={onClose}>
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <section>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t('moderation.listing')}</p>
            <h3 className="mt-1 text-2xl font-black">{listing.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{listing.description || t('moderation.noDesc')}</p>
          </section>

          <section>
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">{t('moderation.photos')}</p>
            {loadingImages ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="aspect-video animate-pulse rounded-2xl bg-slate-100" />
                <div className="aspect-video animate-pulse rounded-2xl bg-slate-100" />
              </div>
            ) : images.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-400">
                {t('moderation.noPhotos')}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((img) => (
                  <div key={img.id} className="group relative aspect-video overflow-hidden rounded-2xl ring-1 ring-slate-200">
                    <img src={img.url} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
                    {img.is_primary && (
                      <span className="absolute left-2 top-2 rounded-lg bg-[#6C3FC4] px-2 py-1 text-[10px] font-black text-white shadow-lg">
                        {t('moderation.primary')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="grid gap-3 sm:grid-cols-3">
            <Info label={t('common.price')} value={formatMoney(listing.monthly_rent)} />
            <Info label={t('common.type')} value={listing.listing_category || listing.type || 'residential'} />
            <Info label={t('common.district')} value={listing.locations?.district || 'N/A'} />
          </div>
        </div>

        <div className="space-y-5 rounded-[32px] bg-slate-50 p-6">
          <div>
            <h4 className="font-black text-slate-800">{t('moderation.decision')}</h4>
            <p className="text-xs text-slate-500">{t('moderation.decisionDesc')}</p>
          </div>
          
          <Field label={t('moderation.adminNote')}>
            <textarea 
              className="input min-h-[120px] resize-none" 
              value={note} 
              onChange={(event) => setNote(event.target.value)} 
              placeholder={t('moderation.notePlaceholder')} 
            />
          </Field>

          <div className="space-y-2">
            <button className="btn-success w-full justify-center py-4" onClick={() => onApprove(note)}>
              <CheckCircle2 size={18} />
              {t('moderation.approve')}
            </button>
            <button className="btn-muted w-full justify-center py-4" onClick={() => onRevision(note)}>
              <RefreshCw size={18} />
              {t('moderation.requestRevision')}
            </button>
            <button className="btn-danger w-full justify-center py-4" onClick={() => onReject(note)}>
              <XCircle size={18} />
              {t('moderation.reject')}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function UsersModule({ onChange }) {
  const { t } = useI18n();
  const formatDate = useFormatDate();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRows();
  }, []);

  async function fetchRows() {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(300);
    setRows(data || []);
    setLoading(false);
  }

  async function updateUser(user, patch) {
    const { error } = await supabase.from('profiles').update(patch).eq('id', user.id);
    if (error) {
      alert(error.message);
      return;
    }
    await fetchRows();
    onChange?.();
  }

  const filtered = rows.filter((user) => {
    const roleOk = role === 'all' || user.role === role;
    const haystack = `${user.full_name} ${user.email} ${user.phone} ${user.role}`;
    return roleOk && safeLower(haystack).includes(safeLower(search));
  });

  return (
    <div className="space-y-5">
      <Toolbar
        search={search}
        setSearch={setSearch}
        placeholder={t('users.searchPlaceholder')}
        right={
          <select className="select" value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="all">{t('users.allRoles')}</option>
            <option value="tenant">Tenants</option>
            <option value="landlord">Landlords</option>
            <option value="admin">Admins</option>
          </select>
        }
      />
      <div className="panel overflow-hidden p-0">
        <Table
          loading={loading}
          empty={t('users.empty')}
          columns={[t('common.user'), t('users.role'), t('users.verification'), t('users.lang'), t('users.registered'), t('common.actions')]}
          rows={filtered.map((user) => (
            <tr key={user.id} className="table-row">
              <td className="table-cell">
                <p className="font-black">{user.full_name || t('users.noName')}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </td>
              <td className="table-cell"><StatusBadge value={user.role} /></td>
              <td className="table-cell">{user.is_verified ? <StatusBadge value="approved" /> : <StatusBadge value="pending" />}</td>
              <td className="table-cell text-sm uppercase text-slate-500">{user.preferred_language || 'en'}</td>
              <td className="table-cell text-xs text-slate-500">{formatDate(user.created_at)}</td>
              <td className="table-cell">
                <div className="flex flex-wrap gap-2">
                  <button className="btn-muted" onClick={() => updateUser(user, { is_verified: !user.is_verified })}>
                    {user.is_verified ? t('users.removeVerif') : t('users.verify')}
                  </button>
                  {user.role !== 'admin' && (
                    <button className="btn-muted" onClick={() => updateUser(user, { role: user.role === 'tenant' ? 'landlord' : 'tenant' })}>
                      {t('users.switchRole')}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        />
      </div>
    </div>
  );
}

function KycModule({ admin, onChange }) {
  const { t } = useI18n();
  const formatDate = useFormatDate();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchRows();
  }, [status]);

  async function fetchRows() {
    setLoading(true);
    let query = supabase
      .from('kyc_verifications')
      .select('*, profiles:user_id(id, full_name, email, phone)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (status !== 'all') query = query.eq('status', status);
    const { data } = await query;
    setRows(data || []);
    setLoading(false);
  }

  async function reviewKyc(item, nextStatus, note = '') {
    const { error } = await supabase
      .from('kyc_verifications')
      .update({
        status: nextStatus,
        rejection_note: nextStatus === 'rejected' ? note : null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', item.id);
    if (error) {
      alert(error.message);
      return;
    }

    if (nextStatus === 'approved') {
      await supabase.from('profiles').update({ is_verified: true }).eq('id', item.user_id);
    }

    await supabase.from('notifications').insert({
      user_id: item.user_id,
      title: nextStatus === 'approved' ? 'KYC approved' : 'KYC rejected',
      body: note || 'Your verification request has been reviewed.',
      type: 'kyc_review',
      data: { status: nextStatus, admin_id: admin.id },
    }).then(() => null);

    setSelected(null);
    await fetchRows();
    onChange?.();
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <select className="select" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">{t('common.allStatuses')}</option>
          {KYC_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {loading ? <LoadingState /> : rows.length === 0 ? <EmptyState title={t('kyc.empty')} /> : rows.map((item) => (
          <button key={item.id} className="panel text-left hover:border-violet-200" onClick={() => setSelected(item)}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black">{item.profiles?.full_name || 'Utilisateur'}</p>
                <p className="mt-1 text-sm text-slate-500">{item.profiles?.email}</p>
              </div>
              <StatusBadge value={item.status} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Info label={t('kyc.document')} value={item.document_type} />
              <Info label={t('kyc.submitted')} value={formatDate(item.created_at)} />
            </div>
          </button>
        ))}
      </div>
      {selected && <KycModal item={selected} onClose={() => setSelected(null)} onApprove={(note) => reviewKyc(selected, 'approved', note)} onReject={(note) => reviewKyc(selected, 'rejected', note)} />}
    </div>
  );
}

function KycModal({ item, onClose, onApprove, onReject }) {
  const { t } = useI18n();
  const [note, setNote] = useState('');
  const [urls, setUrls] = useState({});

  useEffect(() => {
    async function loadUrls() {
      const entries = await Promise.all(
        ['doc_front_url', 'doc_back_url', 'selfie_url'].map(async (key) => {
          const path = item[key];
          if (!path) return [key, null];
          if (String(path).startsWith('http')) return [key, path];
          const { data } = await supabase.storage.from('kyc-documents').createSignedUrl(path, 3600);
          return [key, data?.signedUrl || null];
        })
      );
      setUrls(Object.fromEntries(entries));
    }
    loadUrls();
  }, [item]);

  return (
    <Modal title={t('kyc.reviewTitle')} onClose={onClose}>
      <div className="space-y-5">
        <div>
          <h3 className="text-xl font-black">{item.profiles?.full_name}</h3>
          <p className="text-sm text-slate-500">{item.profiles?.email}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <KycImage label={t('kyc.docFront')} src={urls.doc_front_url} unavailableText={t('kyc.unavailable')} />
          <KycImage label={t('kyc.docBack')} src={urls.doc_back_url} unavailableText={t('kyc.unavailable')} />
          <KycImage label={t('kyc.selfie')} src={urls.selfie_url} unavailableText={t('kyc.unavailable')} />
        </div>
        <Field label={t('kyc.decisionNote')}>
          <textarea className="input min-h-24" value={note} onChange={(event) => setNote(event.target.value)} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <button className="btn-success" onClick={() => onApprove(note)}>{t('kyc.approve')}</button>
          <button className="btn-danger" onClick={() => onReject(note)}>{t('kyc.reject')}</button>
        </div>
      </div>
    </Modal>
  );
}

function KycImage({ label, src, unavailableText }) {
  return (
    <div>
      <p className="mb-2 text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
      <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
        {src ? <img src={src} alt={label} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm font-bold text-slate-400">{unavailableText}</div>}
      </div>
    </div>
  );
}

function ReportsModule({ onChange }) {
  const { t } = useI18n();
  const formatDate = useFormatDate();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRows();
  }, [status]);

  async function fetchRows() {
    setLoading(true);
    let query = supabase
      .from('platform_reports')
      .select('*, reporter:profiles!reporter_id(full_name, email), target:profiles!target_user_id(full_name, email), listing:listings(title)')
      .order('created_at', { ascending: false })
      .limit(150);
    if (status !== 'all') query = query.eq('status', status);
    const { data } = await query;
    setRows(data || []);
    setLoading(false);
  }

  async function updateReport(report, nextStatus) {
    const { error } = await supabase.from('platform_reports').update({ status: nextStatus, reviewed_at: new Date().toISOString() }).eq('id', report.id);
    if (error) {
      alert(error.message);
      return;
    }
    await fetchRows();
    onChange?.();
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <select className="select" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">{t('common.allStatuses')}</option>
          {REPORT_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <div className="panel overflow-hidden p-0">
        <Table
          loading={loading}
          empty={t('reports.empty')}
          columns={[t('reports.category'), t('reports.target'), t('reports.reporter'), t('common.status'), t('common.date'), t('common.actions')]}
          rows={rows.map((report) => (
            <tr key={report.id} className="table-row">
              <td className="table-cell font-bold">{report.category}</td>
              <td className="table-cell">
                <p className="font-bold">{report.listing?.title || report.target?.full_name || t('reports.userFallback')}</p>
                <p className="text-xs text-slate-400">{report.description || t('reports.noDesc')}</p>
              </td>
              <td className="table-cell text-sm">{report.reporter?.full_name || 'N/A'}</td>
              <td className="table-cell"><StatusBadge value={report.status} /></td>
              <td className="table-cell text-xs text-slate-500">{formatDate(report.created_at)}</td>
              <td className="table-cell">
                <div className="flex flex-wrap gap-2">
                  <button className="btn-muted" onClick={() => updateReport(report, 'reviewed')}>{t('reports.markReviewed')}</button>
                  <button className="btn-success" onClick={() => updateReport(report, 'resolved')}>{t('reports.resolve')}</button>
                  <button className="btn-muted" onClick={() => updateReport(report, 'dismissed')}>{t('reports.dismiss')}</button>
                </div>
              </td>
            </tr>
          ))}
        />
      </div>
    </div>
  );
}

function VisitsModule() {
  const { t } = useI18n();
  const formatDate = useFormatDate();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRows();
  }, [status]);

  async function fetchRows() {
    setLoading(true);
    let query = supabase
      .from('visits')
      .select('*, listing:listings(title), tenant:profiles!tenant_id(full_name, email), landlord:profiles!landlord_id(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(150);
    if (status !== 'all') query = query.eq('status', status);
    const { data } = await query;
    setRows(data || []);
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <select className="select" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">{t('visits.all')}</option>
          <option value="pending">{t('visits.pending')}</option>
          <option value="confirmed">{t('visits.confirmed')}</option>
          <option value="cancelled">{t('visits.cancelled')}</option>
        </select>
      </div>
      <div className="panel overflow-hidden p-0">
        <Table
          loading={loading}
          empty={t('visits.empty')}
          columns={['Listing', 'Tenant', t('common.landlord'), t('visits.slot'), t('common.status')]}
          rows={rows.map((visit) => (
            <tr key={visit.id} className="table-row">
              <td className="table-cell font-bold">{visit.listing?.title || 'N/A'}</td>
              <td className="table-cell text-sm">{visit.tenant?.full_name || 'N/A'}</td>
              <td className="table-cell text-sm">{visit.landlord?.full_name || 'N/A'}</td>
              <td className="table-cell text-sm">{visit.visit_date} {visit.time_slot}</td>
              <td className="table-cell"><StatusBadge value={visit.status} /></td>
            </tr>
          ))}
        />
      </div>
    </div>
  );
}

function PaymentsModule() {
  const { t } = useI18n();
  const formatDate = useFormatDate();
  const [sessions, setSessions] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRows() {
      setLoading(true);
      const [{ data: sessionRows }, { data: revenueRows }] = await Promise.all([
        supabase.from('payment_sessions').select('*, profiles:user_id(full_name, email)').order('created_at', { ascending: false }).limit(100),
        supabase.from('platform_revenue').select('*, profiles:user_id(full_name, email)').order('recorded_at', { ascending: false }).limit(100),
      ]);
      setSessions(sessionRows || []);
      setRevenue(revenueRows || []);
      setLoading(false);
    }
    fetchRows();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label={t('payments.collected')} value={formatMoney(revenue.reduce((sum, row) => sum + Number(row.amount_rwf || 0), 0))} helper={`${revenue.length} ${t('payments.transactions')}`} icon={BarChart3} />
        <KpiCard label={t('payments.sessions')} value={sessions.length} helper={t('payments.lastRequests')} icon={CreditCard} />
        <KpiCard label={t('payments.pending')} value={sessions.filter((row) => row.status === 'pending').length} helper={t('payments.toMonitor')} icon={Clock3} />
      </div>

      <div className="panel overflow-hidden p-0">
        <Table
          loading={loading}
          empty={t('payments.empty')}
          columns={[t('common.user'), t('common.district'), t('payments.amount'), t('payments.method'), t('common.status'), t('common.date')]}
          rows={sessions.map((row) => (
            <tr key={row.id} className="table-row">
              <td className="table-cell">{row.profiles?.full_name || 'N/A'}</td>
              <td className="table-cell font-bold">{row.district_name}</td>
              <td className="table-cell">{formatMoney(row.amount_rwf)}</td>
              <td className="table-cell">{row.payment_method}</td>
              <td className="table-cell"><StatusBadge value={row.status} /></td>
              <td className="table-cell text-xs text-slate-500">{formatDate(row.created_at)}</td>
            </tr>
          ))}
        />
      </div>
    </div>
  );
}

function SystemModule({ stats }) {
  const { t } = useI18n();
  const formatDate = useFormatDate();

  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [connStatus, setConnStatus] = useState('checking');
  const [adminCount, setAdminCount] = useState(null);
  const [dbProject, setDbProject] = useState('');

  useEffect(() => {
    checkConnection();
    fetchActivity();
    fetchAdminCount();
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    const match = url.match(/https:\/\/([^.]+)\./);
    setDbProject(match ? match[1] : url);
  }, []);

  async function checkConnection() {
    setConnStatus('checking');
    try {
      const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
      setConnStatus(error ? 'fail' : 'ok');
    } catch {
      setConnStatus('fail');
    }
  }

  async function fetchAdminCount() {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');
    setAdminCount(count ?? 0);
  }

  async function fetchActivity() {
    setActivityLoading(true);
    const [
      { data: listings },
      { data: kycs },
      { data: reports },
      { data: visits },
      { data: payments },
    ] = await Promise.all([
      supabase.from('listings').select('id, title, created_at, status').order('created_at', { ascending: false }).limit(4),
      supabase.from('kyc_verifications').select('id, created_at, status, profiles:user_id(full_name)').order('created_at', { ascending: false }).limit(3),
      supabase.from('platform_reports').select('id, created_at, category, status').order('created_at', { ascending: false }).limit(3),
      supabase.from('visits').select('id, created_at, status, listing:listings(title)').order('created_at', { ascending: false }).limit(3),
      supabase.from('payment_sessions').select('id, created_at, status, amount_rwf, payment_method').order('created_at', { ascending: false }).limit(3),
    ]);

    const events = [
      ...(listings || []).map((r) => ({ type: 'listing', label: r.title || 'Listing', status: r.status, ts: r.created_at, icon: FileText })),
      ...(kycs || []).map((r) => ({ type: 'kyc', label: r.profiles?.full_name || 'KYC', status: r.status, ts: r.created_at, icon: ShieldCheck })),
      ...(reports || []).map((r) => ({ type: 'report', label: r.category || 'Report', status: r.status, ts: r.created_at, icon: AlertTriangle })),
      ...(visits || []).map((r) => ({ type: 'visit', label: r.listing?.title || 'Visit', status: r.status, ts: r.created_at, icon: CalendarDays })),
      ...(payments || []).map((r) => ({ type: 'payment', label: r.payment_method || 'Payment', status: r.status, ts: r.created_at, icon: CreditCard, amount: r.amount_rwf })),
    ].sort((a, b) => new Date(b.ts) - new Date(a.ts)).slice(0, 12);

    setActivity(events);
    setActivityLoading(false);
  }

  const checks = [
    { done: stats.pendingListings === 0, label: t('system.noListingsPending'), count: stats.pendingListings },
    { done: stats.pendingKyc === 0, label: t('system.noKycPending'), count: stats.pendingKyc },
    { done: stats.pendingReports === 0, label: t('system.noReportsPending'), count: stats.pendingReports },
    { done: stats.pendingPayments === 0, label: t('system.noPaymentsPending'), count: stats.pendingPayments },
  ];
  const allOk = checks.every((c) => c.done);
  const issuesCount = checks.filter((c) => !c.done).length;

  const metricCards = [
    { label: t('dashboard.users'), value: stats.totalUsers, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: t('dashboard.activeListings'), value: stats.activeListings, icon: Home, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t('dashboard.visits'), value: stats.totalVisits, icon: CalendarDays, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('dashboard.revenue'), value: formatMoney(stats.revenue), icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const typeLabel = {
    listing: t('system.activityListing'),
    kyc: t('system.activityKyc'),
    report: t('system.activityReport'),
    visit: t('system.activityVisit'),
    payment: t('system.activityPayment'),
  };

  const typeColor = {
    listing: 'bg-violet-50 text-violet-600',
    kyc: 'bg-blue-50 text-blue-600',
    report: 'bg-red-50 text-red-600',
    visit: 'bg-emerald-50 text-emerald-600',
    payment: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="space-y-6">

      {/* Platform health banner */}
      <div className={`flex items-center gap-4 rounded-3xl p-5 ${allOk ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'} text-white shadow-lg`}>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${allOk ? 'bg-white/20' : 'bg-white/20'}`}>
          {allOk ? <Sparkles size={24} /> : <AlertTriangle size={24} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-black text-lg">{allOk ? t('system.checklistOk') : `${issuesCount} ${t('system.checklistIssues')}`}</p>
          <p className="text-sm text-white/80">Rently Admin · {new Date().toLocaleDateString()}</p>
        </div>
        <div className="hidden gap-2 sm:flex">
          {checks.map((c, i) => (
            <div key={i} title={c.label} className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.done ? 'bg-white/20' : 'bg-white/30'}`}>
              {c.done
                ? <CheckCircle2 size={18} className="text-white" />
                : <span className="text-xs font-black text-white">{c.count}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="panel flex items-center gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${m.bg}`}>
                <Icon size={20} className={m.color} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-400 truncate">{m.label}</p>
                <p className="text-xl font-black tracking-tight">{m.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">

        {/* Activity feed */}
        <div className="panel">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="section-title">{t('system.activityTitle')}</h2>
              <p className="section-subtitle">{t('system.activityDesc')}</p>
            </div>
            <Activity size={18} className="text-slate-400" />
          </div>
          {activityLoading ? (
            <LoadingState />
          ) : activity.length === 0 ? (
            <EmptyState title={t('system.activityEmpty')} />
          ) : (
            <div className="space-y-1">
              {activity.map((ev, i) => {
                const Icon = ev.icon;
                return (
                  <div key={i} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-slate-50 transition">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs ${typeColor[ev.type]}`}>
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800">{ev.label}</p>
                      <p className="text-xs text-slate-400">{typeLabel[ev.type]}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <StatusBadge value={ev.status} />
                      <p className="text-[10px] text-slate-400">{formatDate(ev.ts)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Checklist */}
          <div className="panel">
            <h2 className="section-title mb-4">{t('system.checklistTitle')}</h2>
            <div className="space-y-2.5">
              {checks.map((c, i) => (
                <div key={i} className={`flex items-center gap-3 rounded-2xl p-3 ${c.done ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  {c.done
                    ? <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                    : <XCircle size={18} className="shrink-0 text-red-500" />}
                  <span className={`flex-1 text-sm font-bold ${c.done ? 'text-emerald-800' : 'text-red-800'}`}>{c.label}</span>
                  {!c.done && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">{c.count}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure */}
          <div className="panel">
            <div className="mb-4 flex items-center gap-2">
              <Server size={16} className="text-slate-400" />
              <h2 className="section-title">{t('system.connTitle')}</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm font-bold text-slate-600">{t('system.connStatus')}</span>
                {connStatus === 'checking' && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                    {t('system.connChecking')}
                  </span>
                )}
                {connStatus === 'ok' && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <Wifi size={13} />
                    {t('system.connOk')}
                  </span>
                )}
                {connStatus === 'fail' && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                    <WifiOff size={13} />
                    {t('system.connFail')}
                  </span>
                )}
              </div>
              <InfraRow label={t('system.dbProject')} value={dbProject || '—'} />
              <InfraRow label={t('system.dbRegion')} value={t('system.dbRegionValue')} />
              <InfraRow label={t('system.authMode')} value={t('system.authModeValue')} />
              <InfraRow label={t('system.storage')} value={t('system.storageValue')} />
              <InfraRow label={t('system.adminCount')} value={adminCount !== null ? String(adminCount) : '…'} />
            </div>
          </div>

          {/* Build */}
          <div className="panel">
            <div className="mb-4 flex items-center gap-2">
              <Zap size={16} className="text-slate-400" />
              <h2 className="section-title">{t('system.buildTitle')}</h2>
            </div>
            <div className="space-y-3">
              <InfraRow label={t('system.buildEnv')} value={t('system.buildEnvValue')} highlight />
              <InfraRow label={t('system.buildFw')} value={t('system.buildFwValue')} />
              <InfraRow label={t('system.buildCss')} value={t('system.buildCssValue')} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function InfraRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-2.5">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <span className={`max-w-[55%] truncate text-right text-xs font-black ${highlight ? 'text-violet-700' : 'text-slate-800'}`}>{value}</span>
    </div>
  );
}

function ChecklistItem({ done, label }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
      {done ? <CheckCircle2 className="text-emerald-600" size={20} /> : <XCircle className="text-red-600" size={20} />}
      <span className="text-sm font-bold text-slate-700">{label}</span>
    </div>
  );
}

function Toolbar({ search, setSearch, placeholder, right }) {
  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-white/60 bg-white/50 p-3 shadow-sm backdrop-blur-xl md:flex-row md:items-center">
      <div className="flex flex-1 items-center gap-3 rounded-[20px] bg-slate-100/50 px-4 py-3 transition-all focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-50">
        <Search size={18} className="text-slate-400" />
        <input 
          value={search} 
          onChange={(event) => setSearch(event.target.value)} 
          className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-slate-400" 
          placeholder={placeholder} 
        />
      </div>
      <div className="flex items-center gap-2">
        {right}
      </div>
    </div>
  );
}

function Table({ columns, rows, loading, empty }) {
  if (loading) return <LoadingState />;
  if (!rows.length) return <EmptyState title={empty} />;
  return (
    <div className="table-container">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="table-header">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-6 py-4">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50 bg-white/30 backdrop-blur-md">{rows}</tbody>
        </table>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black">{title}</h2>
          <button className="rounded-xl p-2 text-slate-400 hover:bg-slate-100" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-800">{value || 'N/A'}</p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function EmptyState({ title }) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-3xl bg-white p-8 text-center">
      <Lock className="mb-3 text-slate-300" size={32} />
      <p className="font-black text-slate-700">{title || t('common.noData')}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-48 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#6C3FC4] border-t-transparent" />
    </div>
  );
}

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <LoadingState />
    </div>
  );
}
