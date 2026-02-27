import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      <Sidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(c => !c)} 
        mobileOpen={mobileMenuOpen}
        onMobileClose={handleMobileClose}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuToggle={handleMenuToggle} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{ background: 'radial-gradient(ellipse at 15% 0%, rgba(34,197,94,0.035) 0%, transparent 50%), #090e1a' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
