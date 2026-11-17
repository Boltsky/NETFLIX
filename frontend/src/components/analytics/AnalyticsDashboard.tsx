import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Eye,
  EyeOff,
  Activity,
  Globe2,
  Smartphone,
  Monitor,
  Tv,
  Tablet,
  RotateCw,
  ArrowLeft,
  MapPin,
  TrendingUp,
  Clock,
  ShieldCheck,
  Timer,
  Cpu,
  Lock,
  Unlock,
  KeyRound
} from 'lucide-react';
import { api } from '../../services/api';
import { AnalyticsStats } from '../../types';

interface AnalyticsDashboardProps {
  onBack: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onBack }) => {
  // Password Protection State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('cinewave_analytics_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Stats State
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');

  const fetchStats = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await api.getAnalyticsStats();
      if (data) {
        setStats(data);
        setLastRefreshed(new Date().toLocaleTimeString());
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      // Auto refresh every 30 seconds for live monitoring
      const interval = setInterval(() => {
        fetchStats();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchStats]);

  // Handle password unlock
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setAuthError('Please enter the administrator password.');
      return;
    }

    setIsVerifying(true);
    setAuthError(null);

    try {
      const res = await api.verifyAnalyticsPassword(passwordInput.trim());
      if (res.success) {
        sessionStorage.setItem('cinewave_analytics_auth', 'true');
        sessionStorage.setItem('cinewave_analytics_token', passwordInput.trim());
        setIsAuthenticated(true);
      } else {
        setAuthError(res.error || 'Incorrect administrator password.');
      }
    } catch {
      // Local fallback for bolt2026 / admin123
      if (passwordInput.trim() === 'bolt2026' || passwordInput.trim() === 'admin123') {
        sessionStorage.setItem('cinewave_analytics_auth', 'true');
        sessionStorage.setItem('cinewave_analytics_token', passwordInput.trim());
        setIsAuthenticated(true);
      } else {
        setAuthError('Incorrect administrator password.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Lock dashboard back
  const handleLock = () => {
    sessionStorage.removeItem('cinewave_analytics_auth');
    sessionStorage.removeItem('cinewave_analytics_token');
    setIsAuthenticated(false);
    setPasswordInput('');
    setAuthError(null);
  };

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString();
  };

  const getTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      if (diffSecs < 60) return 'Just now';
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  // Helper for OS emoji icon
  const getOsIcon = (osName: string) => {
    const lower = osName.toLowerCase();
    if (lower.includes('ios')) return '🍏';
    if (lower.includes('android tv')) return '📺';
    if (lower.includes('android')) return '🤖';
    if (lower.includes('windows')) return '🪟';
    if (lower.includes('mac')) return '💻';
    if (lower.includes('linux')) return '🐧';
    return '🖥️';
  };

  // Calculate device percentages
  const totalDeviceVisits = stats
    ? stats.devices.mobile + stats.devices.desktop + stats.devices.tablet + stats.devices.tv || 1
    : 1;

  const getDevicePct = (count: number) => {
    return Math.round((count / totalDeviceVisits) * 100);
  };

  // =========================================================================
  // RENDER 1: PASSWORD LOCK GATE (IF NOT AUTHENTICATED)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex flex-col items-center justify-center p-4 select-none relative z-50">
        <div className="w-full max-w-md bg-zinc-900/95 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
          {/* Netflix Red Logo Ribbon */}
          <div className="flex items-center justify-center space-x-2 mb-1">
            <svg viewBox="0 0 100 160" width="24" height="36" className="filter drop-shadow">
              <path d="M0 0h34v160H0z" fill="#B81D24" />
              <path d="M66 0h34v160H66z" fill="#B81D24" />
              <path d="M0 0h34l66 160H66z" fill="#E50914" />
            </svg>
            <span className="text-xl font-black tracking-tight text-[#E50914] font-sans">NETFLIX</span>
          </div>

          {/* Red Lock Icon */}
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-[#E50914] flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">Protected Admin Access</h2>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Visitor Analytics is confidential and restricted. Please enter the administrator password to view metrics.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5 flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                <span>Admin Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError(null);
                  }}
                  placeholder="Enter administrator password..."
                  className="w-full px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] text-sm pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {authError && (
                <div className="mt-2 text-xs font-medium text-red-400 bg-red-950/40 border border-red-800/40 p-2.5 rounded-md flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 rounded-lg bg-[#E50914] hover:bg-red-700 active:scale-98 font-bold text-sm text-white transition-all flex items-center justify-center space-x-2 shadow-lg shadow-red-950/60 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Password...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Dashboard</span>
                </>
              )}
            </button>
          </form>

          <button
            onClick={onBack}
            className="w-full py-2.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition-all flex items-center justify-center space-x-1.5 border border-zinc-800 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Netflix</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER 2: UNLOCKED LIVE ANALYTICS DASHBOARD (CLEAN & CRISP)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#141414] text-white pt-8 pb-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto relative z-20">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 transition-all text-zinc-300 hover:text-white cursor-pointer"
            title="Back to Netflix"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Visitor Analytics
              </h1>
              <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Active</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Real-time audience monitoring, OS breakdown (iOS, Android, Windows), time visited, and dwell time spent
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-end md:self-auto">
          <div className="text-right text-[11px] text-zinc-500 hidden sm:block">
            <span>Updated: {lastRefreshed}</span>
          </div>
          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-xs font-semibold text-zinc-200 transition-all border border-zinc-700/60 cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#E50914]' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button
            onClick={handleLock}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-xs font-semibold text-red-300 transition-all cursor-pointer"
            title="Lock Dashboard"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#E50914] border-t-transparent animate-spin" />
          <p className="text-zinc-400 text-sm">Aggregating real-time audience metrics...</p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {/* Top 5 Hero KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {/* Card 1: Unique Visitors */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:border-zinc-700 transition-all">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-medium uppercase tracking-wider">Unique Visitors</span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {formatNumber(stats?.summary.uniqueVisitors)}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Distinct users (no sign-up)</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400" />
            </div>

            {/* Card 2: Total Visits */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:border-zinc-700 transition-all">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-medium uppercase tracking-wider">Total Visits</span>
                <div className="w-8 h-8 rounded-lg bg-[#E50914]/10 flex items-center justify-center text-[#E50914]">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {formatNumber(stats?.summary.totalVisits)}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1 flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-[#E50914]" />
                  <span>Total sessions</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E50914] to-orange-500" />
            </div>

            {/* Card 3: Active Right Now */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:border-zinc-700 transition-all">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-medium uppercase tracking-wider">Active Now</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Activity className="w-4 h-4 animate-pulse" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight flex items-center space-x-2">
                  <span>{formatNumber(stats?.summary.activeNow)}</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  <span>In last 5 minutes</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
            </div>

            {/* Card 4: Avg. Time Spent on Site */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:border-zinc-700 transition-all">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-medium uppercase tracking-wider">Avg. Time Spent</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Timer className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-purple-400 tracking-tight">
                  {stats?.summary.avgTimeSpentFormatted || '< 1m'}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  <span>Average dwell time</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
            </div>

            {/* Card 5: Visits Today */}
            <div className="col-span-2 sm:col-span-1 bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:border-zinc-700 transition-all">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-medium uppercase tracking-wider">Visits Today</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {formatNumber(stats?.summary.visitsToday)}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  <span>{formatNumber(stats?.summary.visitsLast7Days)} in 7 days</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400" />
            </div>
          </div>

          {/* Operating System Breakdown (iOS, Android, Windows, macOS, etc.) */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Operating Systems (iOS, Android, Windows & more)</h2>
                  <p className="text-xs text-zinc-400">Breakdown of operating systems used by your visitors</p>
                </div>
              </div>
              <span className="text-xs font-mono text-zinc-500">
                {stats?.osBreakdown.length || 0} OS types
              </span>
            </div>

            {stats?.osBreakdown && stats.osBreakdown.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {stats.osBreakdown.map((item) => (
                  <div
                    key={item.os}
                    className="p-3.5 rounded-xl bg-zinc-800/40 border border-zinc-800/80 hover:bg-zinc-800/70 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{getOsIcon(item.os)}</span>
                      <span className="text-xs font-bold font-mono text-white px-2 py-0.5 rounded bg-zinc-700/60">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="font-bold text-sm text-white truncate">{item.os}</div>
                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{item.count} visitors</div>
                    <div className="w-full bg-zinc-700/40 rounded-full h-1.5 mt-2.5 overflow-hidden">
                      <div
                        className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(item.percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-zinc-500 text-xs">
                Operating system telemetry is populating as users visit...
              </div>
            )}
          </div>

          {/* Location & Geographic Audience Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Top Countries (8 cols) */}
            <div className="lg:col-span-8 bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-red-500/10 text-[#E50914]">
                    <Globe2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Top Visitor Countries & Regions</h2>
                    <p className="text-xs text-zinc-400">Where most of your audience visits from</p>
                  </div>
                </div>
                <span className="text-xs text-zinc-500">
                  {stats?.topCountries.length || 0} locations recorded
                </span>
              </div>

              {stats?.topCountries && stats.topCountries.length > 0 ? (
                <div className="space-y-3.5">
                  {stats.topCountries.map((c, idx) => (
                    <div key={c.country} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-lg leading-none">{c.flag}</span>
                          <span className="font-semibold text-zinc-200">{c.country}</span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            {c.countryCode}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 font-mono text-xs">
                          <span className="text-zinc-400">{c.count} visits</span>
                          <span className="font-bold text-white w-12 text-right">{c.percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            idx === 0
                              ? 'bg-[#E50914]'
                              : idx === 1
                              ? 'bg-orange-500'
                              : idx === 2
                              ? 'bg-amber-500'
                              : 'bg-zinc-500'
                          }`}
                          style={{ width: `${Math.max(c.percentage, 4)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-500 text-sm">
                  <Globe2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No geographic visits logged yet. Incoming visits will appear here automatically.
                </div>
              )}
            </div>

            {/* Top Cities (4 cols) */}
            <div className="lg:col-span-4 bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 sm:p-6 flex flex-col">
              <div className="flex items-center space-x-3 mb-5">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Top Cities</h2>
                  <p className="text-xs text-zinc-400">Highest volume metro areas</p>
                </div>
              </div>

              {stats?.topCities && stats.topCities.length > 0 ? (
                <div className="space-y-3 overflow-y-auto max-h-[320px] pr-1">
                  {stats.topCities.map((city) => (
                    <div
                      key={`${city.city}-${city.country}`}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-800/40 hover:bg-zinc-800/70 border border-zinc-800 transition-all text-xs"
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <span className="text-sm">{city.flag || '📍'}</span>
                        <div className="truncate">
                          <p className="font-semibold text-zinc-200 truncate">{city.city}</p>
                          <p className="text-[10px] text-zinc-400 truncate">{city.country}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="px-2 py-0.5 rounded font-mono font-bold bg-zinc-700/60 text-zinc-200 text-[11px]">
                          {city.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-500 text-sm my-auto">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  City-level details will populate as users browse.
                </div>
              )}
            </div>
          </div>

          {/* Device Breakdown & Top Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Device Distribution */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 sm:p-6">
              <h2 className="text-lg font-bold text-white mb-1">Hardware Form Factors</h2>
              <p className="text-xs text-zinc-400 mb-5">Phones, computers, tablets & TVs</p>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Mobile */}
                <div className="p-3.5 rounded-xl bg-zinc-800/40 border border-zinc-800 flex items-center space-x-3.5">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 font-medium">Mobile Phones</span>
                    <div className="text-xl font-black text-white">
                      {getDevicePct(stats?.devices.mobile || 0)}%
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {stats?.devices.mobile || 0} visits
                    </span>
                  </div>
                </div>

                {/* Desktop */}
                <div className="p-3.5 rounded-xl bg-zinc-800/40 border border-zinc-800 flex items-center space-x-3.5">
                  <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 font-medium">Desktops / Laptops</span>
                    <div className="text-xl font-black text-white">
                      {getDevicePct(stats?.devices.desktop || 0)}%
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {stats?.devices.desktop || 0} visits
                    </span>
                  </div>
                </div>

                {/* Tablets */}
                <div className="p-3.5 rounded-xl bg-zinc-800/40 border border-zinc-800 flex items-center space-x-3.5">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Tablet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 font-medium">Tablets</span>
                    <div className="text-xl font-black text-white">
                      {getDevicePct(stats?.devices.tablet || 0)}%
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {stats?.devices.tablet || 0} visits
                    </span>
                  </div>
                </div>

                {/* Android TV */}
                <div className="p-3.5 rounded-xl bg-zinc-800/40 border border-zinc-800 flex items-center space-x-3.5">
                  <div className="p-2.5 rounded-lg bg-[#E50914]/10 text-[#E50914]">
                    <Tv className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 font-medium">Android TV</span>
                    <div className="text-xl font-black text-white">
                      {getDevicePct(stats?.devices.tv || 0)}%
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {stats?.devices.tv || 0} visits
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Screens / Pages */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 sm:p-6">
              <h2 className="text-lg font-bold text-white mb-1">Most Visited App Screens</h2>
              <p className="text-xs text-zinc-400 mb-5">Where users spend their time</p>

              <div className="space-y-2.5">
                {stats?.topScreens && stats.topScreens.length > 0 ? (
                  stats.topScreens.map((s) => (
                    <div
                      key={s.screen}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-800/40 border border-zinc-800/60 text-xs"
                    >
                      <div className="flex items-center space-x-2 font-medium capitalize text-zinc-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]" />
                        <span>{s.screen} Screen</span>
                      </div>
                      <span className="font-mono text-zinc-400 font-bold">{s.count} views</span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-zinc-500 text-xs">
                    Screen metrics accumulating...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Real-Time Live Activity Feed with Time Visited & Time Spent */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Recent Visitors Stream</h2>
                  <p className="text-xs text-zinc-400">Live stream with time visited, time spent, OS & location</p>
                </div>
              </div>
              <span className="text-xs font-mono text-zinc-500">
                Latest {stats?.recentVisits.length || 0} visits
              </span>
            </div>

            {stats?.recentVisits && stats.recentVisits.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="text-[11px] uppercase bg-zinc-800/50 text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="py-2.5 px-3">Time Visited</th>
                      <th className="py-2.5 px-3">Time Spent</th>
                      <th className="py-2.5 px-3">Operating System</th>
                      <th className="py-2.5 px-3">Location & Area</th>
                      <th className="py-2.5 px-3">Screen / Title</th>
                      <th className="py-2.5 px-3">Visitor ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {stats.recentVisits.map((v) => (
                      <tr key={v.id} className="hover:bg-zinc-800/30 transition-colors">
                        {/* Time Visited */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-mono text-zinc-200 font-semibold">{v.timeVisited || 'Recent'}</div>
                          <div className="text-[10px] text-zinc-500">{getTimeAgo(v.timestamp)}</div>
                        </td>

                        {/* Time Spent */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-purple-950/40 border border-purple-800/40 text-purple-300 font-mono text-[11px] font-bold">
                            <Timer className="w-3 h-3 text-purple-400" />
                            <span>{v.timeSpentFormatted || '< 1m'}</span>
                          </span>
                        </td>

                        {/* Operating System */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-zinc-800 text-zinc-200 font-medium text-[11px]">
                            <span>{getOsIcon(v.os)}</span>
                            <span className="font-bold">{v.os}</span>
                            <span className="text-zinc-500 text-[10px]">({v.browser})</span>
                          </span>
                        </td>

                        {/* Location & Area */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="text-base">{v.location.flag || '🌐'}</span>
                            <span className="font-semibold text-white">
                              {v.location.city && v.location.city !== 'Unknown City' ? `${v.location.city}, ` : ''}
                              {v.location.country}
                            </span>
                          </div>
                        </td>

                        {/* Screen / Title */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="capitalize font-medium text-zinc-300">
                            {v.titleName ? `Playing: ${v.titleName}` : `${v.screen} screen`}
                          </span>
                        </td>

                        {/* Visitor ID */}
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-zinc-500">
                          {v.visitorId.slice(0, 14)}...
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-zinc-500 text-sm">
                No recent sessions recorded yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
