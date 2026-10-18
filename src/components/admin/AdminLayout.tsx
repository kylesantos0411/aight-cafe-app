import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCafe } from '../../context/CafeContext';

interface Props {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AdminLayout: React.FC<Props> = ({ children, title = 'Staff Portal', subtitle }) => {
  const navigate = useNavigate();
  const { staffUser, logoutStaff } = useCafe();

  const handleSignOut = async () => {
    await logoutStaff();
    navigate('/admin/login');
  };

  const handleOpenQueueDisplay = () => {
    window.open('/queue', '_blank');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
      isActive
        ? 'bg-[#221611] text-[#FAF8F5] shadow-xs'
        : 'text-[#7A695C] hover:bg-[#F2EDE4] hover:text-[#221611]'
    }`;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#221611] font-sans flex flex-col selection:bg-[#221611] selection:text-[#FAF8F5]">
      {/* Top Staff Navigation Bar */}
      <header className="bg-[#FAF8F5] border-b border-[#ECE5DC] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-[#221611]">aight .</span>
              <span className="text-[10px] font-bold tracking-widest text-[#7A695C] bg-[#ECE5DC] px-2 py-0.5 rounded-full">
                ADMIN
              </span>
            </div>
            <span className="hidden sm:inline-block text-xs font-semibold text-[#8C7A6D]">
              · Silangan, San Mateo, Rizal
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <NavLink to="/admin/pos" className={navLinkClass}>
              <span>🏪</span>
              <span>POS</span>
            </NavLink>
            <NavLink to="/admin/orders" className={navLinkClass}>
              <span>📋</span>
              <span>Orders</span>
            </NavLink>
            <NavLink to="/admin/menu" className={navLinkClass}>
              <span>☕</span>
              <span>Menu</span>
            </NavLink>
            <NavLink to="/admin/history" className={navLinkClass}>
              <span>📜</span>
              <span>History</span>
            </NavLink>
            <NavLink to="/admin/nfc" className={navLinkClass}>
              <span>🏷️</span>
              <span>NFC Hub</span>
            </NavLink>
            <button
              onClick={handleOpenQueueDisplay}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#7A695C] hover:bg-[#F2EDE4] hover:text-[#221611] transition-colors"
              title="Open public stall queue TV display in new tab"
            >
              <span>📺</span>
              <span>Stall TV</span>
              <span className="text-[10px]">↗</span>
            </button>
          </nav>

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-right">
              <div className="w-8 h-8 rounded-full bg-[#221611] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                {staffUser?.fullName?.[0] || 'S'}
              </div>
              <div className="text-left text-xs leading-tight">
                <div className="font-bold text-[#221611] truncate max-w-[120px]">
                  {staffUser?.fullName || 'Operator'}
                </div>
                <div className="text-[10px] text-[#8C7A6D] capitalize">
                  {staffUser?.role?.replace('_', ' ') || 'Staff'}
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 bg-white border border-[#DFD6CC] hover:bg-[#F2EDE4] text-[#221611] rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {subtitle && (
          <div className="mb-6">
            <h1 className="text-2xl font-black text-[#221611] tracking-tight">{title}</h1>
            <p className="text-xs text-[#8C7A6D] mt-1">{subtitle}</p>
          </div>
        )}
        {children}
      </main>
    </div>
  );
};
