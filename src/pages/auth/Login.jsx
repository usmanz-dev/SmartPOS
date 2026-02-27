import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = [
  { label: 'Super Admin', email: 'admin@smartpos.com', color: 'purple' },
  { label: 'Store Admin', email: 'manager@smartpos.com', color: 'blue' },
  { label: 'Cashier', email: 'cashier@smartpos.com', color: 'green' },
  { label: 'Inventory', email: 'inventory@smartpos.com', color: 'amber' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please enter email and password');
    const result = await login({ email, password });
    if (result.payload && !result.error) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      toast.error(result.payload || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative"
      style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(34,197,94,0.06) 0%, transparent 55%), radial-gradient(ellipse at 70% 20%, rgba(59,130,246,0.04) 0%, transparent 50%), #090e1a' }}>

      {/* Animated grid */}
      <div className="absolute inset-0 bg-grid bg-grid opacity-60 pointer-events-none"/>

      {/* Glow orbs */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 rounded-full blur-[100px] opacity-[0.06]" style={{ background: '#22c55e' }}/>
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full blur-[100px] opacity-[0.04]" style={{ background: '#3b82f6' }}/>

      <div className="relative z-10 w-full max-w-[440px] px-4 sm:px-6 mx-auto my-8 sm:my-0 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-6  ">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mb-4 sm:mb-5 animate-pulse-glow"
            style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))', border: '1px solid rgba(34,197,94,0.35)' }}>
            <span className="font-display font-black text-accent-green text-3xl sm:text-4xl leading-none">S</span>
          </div>
          <h1 className="font-display font-black text-white text-2xl sm:text-3xl tracking-wider uppercase sm:mb-2">SmartPOS Pro</h1>
          <p className="text-slate-500 text-xs sm:text-sm font-body">Multi-Store Point of Sale System</p>
        </div>

        {/* Form card */}
        <div className="card-glow p-5 sm:p-7">
          <h2 className="font-display font-bold text-white text-base sm:text-lg tracking-wide mb-5 sm:mb-6">Sign In to Continue</h2>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-3">
            <div>
              <label className="label text-xs sm:text-sm">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input text-sm" placeholder="admin@smartpos.com" autoComplete="email"/>
            </div>
            <div>
              <label className="label text-xs sm:text-sm">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="input text-sm" placeholder="••••••••" autoComplete="current-password"/>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full h-10 sm:h-11 text-center mt-3 sm:mt-4 text-sm sm:text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                  Signing In...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-white/[0.06]">
            <p className="text-[9px] sm:text-[10px] text-slate-600 font-body uppercase tracking-widest text-center mb-3 sm:mb-4">Quick Demo Login</p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {DEMO_ACCOUNTS.map(acc => (
                <button key={acc.email}
                  onClick={() => { setEmail(acc.email); setPassword('password123'); }}
                  className="text-left p-2 sm:p-2.5 rounded-lg bg-bg-primary border border-white/[0.06] hover:border-white/[0.15] transition-all group active:scale-95">
                  <span className={`badge badge-${acc.color} text-[8px] sm:text-[9px] mb-1 inline-block`}>{acc.label}</span>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 group-hover:text-slate-300 font-body truncate transition-colors">{acc.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
