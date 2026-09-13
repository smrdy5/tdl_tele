import React, { useState } from 'react';
import { Zap, Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, User } from 'lucide-react';
import axios from 'axios';

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('Tax Consultant');
  const [regTelegramId, setRegTelegramId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      setLoading(false);
      if (res.data.success && res.data.user) {
        onLogin(res.data.user);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Invalid email or password.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', {
        name: regName.trim(),
        email: regEmail.trim(),
        role: regRole,
        password: regPassword,
        telegramChatId: regTelegramId.trim()
      });

      setLoading(false);
      setSuccessMsg('Account created successfully! Logging you in...');
      setTimeout(() => {
        if (res.data.user) {
          onLogin(res.data.user);
        }
      }, 600);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background Decor Shapes */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl w-full bg-slate-800/90 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 relative z-10 backdrop-blur-md">
        {/* Left Side: Brand Banner */}
        <div className="p-8 md:p-12 bg-gradient-to-br from-[#1b255a] via-[#243177] to-indigo-900 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl"></div>

          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <Zap className="w-6 h-6 fill-current" />
              </div>
              <span className="font-bold text-lg tracking-wide text-white">Capstone Project Portal</span>
            </div>

            <h1 className="text-2xl font-extrabold text-white leading-tight mb-4">
              AI Invoice Generation for M.Y.H Business & Tax Consultant
            </h1>
            <p className="text-sm text-indigo-200/80 leading-relaxed mb-6">
              Assign tasks, track work hours, and receive real-time push notifications on Telegram.
            </p>

            <div className="space-y-3 pt-6 border-t border-indigo-500/30">
              <div className="flex items-center gap-3 text-xs text-indigo-200">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                <span>AI-Powered Automated Invoice Processing</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-indigo-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Team Task Assignment & Time Tracking</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-indigo-200">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span>Instant Telegram Push Notifications</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form (Login vs Register) */}
        <div className="p-8 md:p-10 bg-slate-900/50 flex flex-col justify-center">
          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-800 p-1 rounded-xl mb-6 border border-slate-700">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              {successMsg}
            </div>
          )}

          {/* LOGIN MODE */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="enter your email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-mono"
                  />
                  {/* SHOW / HIDE PASSWORD BUTTON */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
                  />
                  Remember me
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => { e.preventDefault(); alert('Password reset link sent to email!'); }}
                  className="text-blue-400 hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* REGISTER MODE */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Work Email <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="user@company.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Role / Position
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="Tax Consultant">Tax Consultant</option>
                    <option value="AI Engineer">AI Engineer</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Telegram Chat ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 12345678"
                    value={regTelegramId}
                    onChange={(e) => setRegTelegramId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Password <span className="text-rose-400">*</span> (min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                  {/* SHOW / HIDE PASSWORD BUTTON */}
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Confirm Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Registering...</span>
                ) : (
                  <>
                    <span>Create Account & Join Team</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secured with Password Hashing & Telegram Alerts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
