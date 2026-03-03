import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useNavigate, useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/pos': 'POS Terminal',
  '/products': 'Products',
  '/categories': 'Categories',
  '/inventory/low-stock': 'Low Stock Alert',
  '/orders': 'Orders',
  '/today-sales': "Today's Sales",
  '/reports': 'Reports',
  '/users': 'User Management',
  '/settings': 'Settings',
};

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const title = PAGE_TITLES[location.pathname] || 'SmartPOS Pro';

  return (
    <header className="h-[60px] flex items-center justify-between px-3 md:px-6 border-b border-white/[0.05] flex-shrink-0"
      style={{ background: 'rgba(9,14,26,0.9)', backdropFilter: 'blur(12px)' }}>

      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Mobile hamburger menu */}
        <button
          onClick={onMenuToggle}
          className="md:hidden flex-shrink-0 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-accent-green/10 active:scale-95"
          style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-slate-400 transition-colors group-hover:text-accent-green">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        {/* Title */}
        <div className="min-w-0 flex-1 animate-slide-right">
          <h1 className="font-display font-bold text-white text-sm md:text-lg tracking-wide truncate transition-colors duration-300">{title}</h1>
          <p className="hidden sm:block text-slate-600 text-[9px] md:text-[10px] font-body tracking-wider uppercase">
            {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Right: User info + Status + Logout */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Cart badge - hide on small mobile */}
        {itemCount > 0 && (
          <button onClick={() => navigate('/pos?cart=1')}
            className="hidden sm:flex items-center gap-2 bg-accent-green/10 hover:bg-accent-green/20 border border-accent-green/30 rounded-lg px-2 md:px-3 py-1.5 transition-all duration-200 flex-shrink-0 active:scale-95 animate-slide-up">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3 md:w-4 md:h-4 text-accent-green">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
            </svg>
            <span className="text-accent-green font-display text-[9px] md:text-xs font-bold animate-bounce">{itemCount}</span>
          </button>
        )}

        {/* Clock - hide on mobile */}
        <div className="hidden md:block text-right flex-shrink-0 animate-fade-in">
          <p className="font-display font-bold text-white text-lg tracking-wider leading-none transition-all duration-300">
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-slate-600 text-[9px] tracking-widest font-body uppercase">
            {String(time.getSeconds()).padStart(2, '0')}s
          </p>
        </div>

  

        <div className="flex items-center gap-2 flex-shrink-0 animate-slide-left">
          <div className="md:hidden flex-shrink-0 rounded-lg flex items-center justify-center font-display font-bold text-[10px] text-accent-green transition-all duration-300"
            style={{ width: '24px', height: '24px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>

          <button
            onClick={logout}
            title="Logout"
            className="lg:hidden flex-shrink-0 flex items-center justify-center rounded-lg text-slate-600 hover:text-accent-red hover:bg-accent-red/10 transition-all duration-200 active:scale-95"
            style={{ width: '28px', height: '28px' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
