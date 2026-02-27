import { useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_LABELS, ROLE_COLORS } from '../../utils/formatCurrency';

const NAV = [
  { to: '/', end: true, label: 'Dashboard', icon: () => <path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5zM4 13a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1v-5z"/>, roles: null },
  { to: '/pos', label: 'POS Terminal', icon: () => <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>, roles: ['super_admin', 'store_admin', 'cashier'] },
  { to: '/products', label: 'Products', icon: () => <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>, roles: null },
  { to: '/categories', label: 'Categories', icon: () => <><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></>, roles: null },
  { to: '/inventory/low-stock', label: 'Low Stock', icon: () => <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>, roles: ['super_admin', 'store_admin', 'inventory_manager'] },
  { to: '/inventory/adjustment', label: 'Adjustment', icon: () => <><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9H13V7.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5V11H8.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5H11v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V13h2.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/></>, roles: ['inventory_manager'] },
  { to: '/orders', label: 'Orders', icon: () => <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>, roles: ['super_admin', 'store_admin', 'cashier'] },
  { to: '/today-sales', label: "Today's Sales", icon: () => <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></>, roles: ['super_admin', 'store_admin'] },
  { to: '/reports', label: 'Reports', icon: () => <><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></>, roles: ['super_admin', 'store_admin', 'inventory_manager'] },
  { to: '/users', label: 'Users', icon: () => <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>, roles: ['super_admin'] },
  { to: '/settings', label: 'Settings', icon: () => <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>, roles: ['super_admin'] },
];

const Ico = ({ d }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
    className="w-[18px] h-[18px] flex-shrink-0">
    {typeof d === 'function' ? d() : null}
  </svg>
);

// ── Hamburger — hamesha 3 lines, koi X nahi ──
const Hamburger = () => (
  <div className="flex flex-col justify-center items-end gap-[4px]">
    <span className="block rounded-full" style={{ height: '1.5px', width: '14px', background: 'rgba(148,163,184,0.9)' }} />
    <span className="block rounded-full" style={{ height: '1.5px', width: '10px', background: 'rgba(148,163,184,0.9)' }} />
    <span className="block rounded-full" style={{ height: '1.5px', width: '14px', background: 'rgba(148,163,184,0.9)' }} />
  </div>
);

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout, hasRole } = useAuth();
  const [hoverOpen, setHoverOpen] = useState(false);
  const hoverTimer = useRef(null);

  const visibleNav = NAV.filter(n => !n.roles || hasRole(...n.roles));
  const isExpanded = !collapsed || hoverOpen || mobileOpen;

  const handleMouseEnter = () => {
    if (!collapsed) return;
    clearTimeout(hoverTimer.current);
    setHoverOpen(true);
  };

  const handleMouseLeave = () => {
    if (!collapsed) return;
    hoverTimer.current = setTimeout(() => setHoverOpen(false), 150);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={[
          'flex-shrink-0 flex flex-col z-40',
          'transition-all duration-300 ease-in-out',
          isExpanded ? 'w-[230px]' : 'w-[68px]',
          'fixed md:relative h-full',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          hoverOpen && collapsed ? 'shadow-[6px_0_40px_rgba(0,0,0,0.7)]' : '',
        ].join(' ')}
        style={{
          background: 'linear-gradient(180deg, #0d1526 0%, #090e1a 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >

        {/* ── HEADER ── */}
        <div
          className="flex items-center flex-shrink-0 px-3"
          style={{
            height: '68px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            // ✅ gap: logo+brand aur hamburger ke beech space
            gap: '12px',
          }}
        >
          {/* Logo + Brand — flex-1 taake space le */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* "S" logo */}
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-xl"
              style={{
                width: '38px',
                height: '38px',
                background: 'linear-gradient(135deg, rgba(34,197,94,0.25), rgba(34,197,94,0.08))',
                border: '1.5px solid rgba(34,197,94,0.4)',
                boxShadow: '0 0 16px rgba(34,197,94,0.15)',
              }}
            >
              <span
                className="font-display font-black text-accent-green leading-none"
                style={{ fontSize: '20px' }}
              >
                S
              </span>
            </div>

            {/* Brand text */}
            <div
              className="overflow-hidden"
              style={{
                opacity: isExpanded ? 1 : 0,
                maxWidth: isExpanded ? '130px' : '0px',
                transition: 'opacity 250ms ease, max-width 300ms ease',
              }}
            >
              <p
                className="font-display font-bold text-white leading-none whitespace-nowrap"
                style={{ fontSize: '15px', letterSpacing: '0.08em' }}
              >
                SmartPOS
              </p>
              <p
                className="font-body text-slate-500 whitespace-nowrap mt-0.5"
                style={{ fontSize: '10px', letterSpacing: '0.05em' }}
              >
                Pro v1.0
              </p>
            </div>
          </div>

          {/* ✅ Hamburger — always ☰, no X, 12px gap from brand */}
          {isExpanded && (
            <button
              onClick={onToggle}
              title="Toggle sidebar"
              className="flex-shrink-0 flex items-center justify-center rounded-lg transition-all duration-200"
              style={{
                width: '34px',
                height: '34px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(34,197,94,0.1)';
                e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              <Hamburger />
            </button>
          )}
        </div>

        {/* ── NAV ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-0.5">
          {visibleNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => mobileOpen && onMobileClose?.()}
              title={!isExpanded ? item.label : ''}
              className={({ isActive }) =>
                `nav-item transition-all duration-200
                ${isActive ? 'active' : ''}
                ${!isExpanded ? 'justify-center px-0' : 'px-3'}`
              }
            >
              <Ico d={item.icon} />
              <span
                className="overflow-hidden whitespace-nowrap transition-all duration-300"
                style={{
                  opacity: isExpanded ? 1 : 0,
                  maxWidth: isExpanded ? '160px' : '0px',
                }}
              >
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* ── USER — Mobile only ── */}
        <div
          className="flex md:hidden flex-shrink-0 px-2 py-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className={`flex items-center gap-2.5 ${!isExpanded ? 'justify-center' : 'px-1'} w-full`}>
            <div
              className="flex-shrink-0 rounded-lg flex items-center justify-center font-display font-bold text-sm"
              style={{
                width: '32px', height: '32px',
                background: 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(59,130,246,0.2))',
                border: '1px solid rgba(34,197,94,0.3)',
              }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>

            <div
              className="flex-1 min-w-0 overflow-hidden transition-all duration-300"
              style={{
                opacity: isExpanded ? 1 : 0,
                maxWidth: isExpanded ? '120px' : '0px',
              }}
            >
              <p className="text-slate-300 text-xs font-body truncate leading-none mb-1 whitespace-nowrap">
                {user?.name}
              </p>
              <span className={`badge badge-${ROLE_COLORS[user?.role] || 'gray'} text-[9px] px-1.5 py-0.5`}>
                {ROLE_LABELS[user?.role]}
              </span>
            </div>

            {isExpanded && (
              <button
                onClick={logout}
                title="Logout"
                className="flex-shrink-0 flex items-center justify-center rounded-lg text-slate-600 hover:text-accent-red hover:bg-accent-red/10 transition-all duration-200 active:scale-95"
                style={{ width: '28px', height: '28px' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            )}
          </div>
        </div>        {/* ── USER — Desktop only ── */}
        <div
          className="hidden md:block flex-shrink-0 px-2 py-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className={`flex items-center gap-2.5 ${!isExpanded ? 'justify-center' : 'px-1'}`}>
            <div
              className="flex-shrink-0 rounded-lg flex items-center justify-center font-display font-bold text-sm"
              style={{
                width: '32px', height: '32px',
                background: 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(59,130,246,0.2))',
                border: '1px solid rgba(34,197,94,0.3)',
              }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>

            <div
              className="flex-1 min-w-0 overflow-hidden transition-all duration-300"
              style={{
                opacity: isExpanded ? 1 : 0,
                maxWidth: isExpanded ? '120px' : '0px',
              }}
            >
              <p className="text-slate-300 text-xs font-body truncate leading-none mb-1 whitespace-nowrap">
                {user?.name}
              </p>
              <span className={`badge badge-${ROLE_COLORS[user?.role] || 'gray'} text-[9px] px-1.5 py-0.5`}>
                {ROLE_LABELS[user?.role]}
              </span>
            </div>

            {isExpanded && (
              <button
                onClick={logout}
                title="Logout"
                className="flex-shrink-0 flex items-center justify-center rounded-lg text-slate-600 hover:text-accent-red hover:bg-accent-red/10 transition-all"
                style={{ width: '28px', height: '28px' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}