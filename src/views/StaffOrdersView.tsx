import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCafe } from '../context/CafeContext';
import { Screen13StaffOrders } from '../components/figma-screens/Screen13StaffOrders';

export const StaffOrdersView: React.FC = () => {
  const navigate = useNavigate();
  const { isStaffLoggedIn, logoutStaff, refreshOrders } = useCafe();

  useEffect(() => {
    if (!isStaffLoggedIn) {
      navigate('/admin/login');
    } else {
      refreshOrders();
      const interval = setInterval(() => {
        refreshOrders();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isStaffLoggedIn, navigate, refreshOrders]);

  const handleSignOut = async () => {
    await logoutStaff();
    navigate('/admin/login');
  };

  const handleOpenQueueDisplay = () => {
    window.open('/queue', '_blank');
  };

  if (!isStaffLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-start p-3 sm:p-6 font-sans">
      <div className="w-full flex justify-end items-center max-w-7xl pb-3 text-xs font-semibold text-[#7A695C]">
        <button
          onClick={handleOpenQueueDisplay}
          className="px-3 py-1.5 bg-white border border-[#DFD6CC] text-[#221611] rounded-xl hover:bg-[#F2EDE4] transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
        >
          <span>📺</span>
          <span>Open Stall TV Screen</span>
          <span className="text-[10px]">↗</span>
        </button>
      </div>

      <div className="w-full max-w-7xl">
        <Screen13StaffOrders
          onOpenQueueDisplay={handleOpenQueueDisplay}
          onSignOut={handleSignOut}
        />
      </div>
    </div>
  );
};

export { StaffOrdersView as AdminOrdersView };
