import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCafe } from '../context/CafeContext';
import { Screen13StaffOrders } from '../components/figma-screens/Screen13StaffOrders';

export const StaffOrdersView: React.FC = () => {
  const navigate = useNavigate();
  const { isStaffLoggedIn, logoutStaff } = useCafe();

  useEffect(() => {
    if (!isStaffLoggedIn) {
      navigate('/staff/login');
    }
  }, [isStaffLoggedIn, navigate]);

  const handleSignOut = async () => {
    await logoutStaff();
    navigate('/staff/login');
  };

  const handleOpenQueueDisplay = () => {
    window.open('/queue', '_blank');
  };

  if (!isStaffLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-start p-6 font-sans overflow-x-auto">
      <div className="w-full flex justify-between items-center max-w-[1440px] pb-3 text-xs font-semibold text-[#7A695C]">
        <button
          onClick={() => navigate('/')}
          className="px-3 py-1.5 bg-white border border-[#DFD6CC] text-[#221611] rounded-xl hover:bg-[#FAF8F5] transition-colors"
        >
          ← Return to Customer App
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/queue')}
            className="px-3 py-1.5 bg-white border border-[#DFD6CC] text-[#221611] rounded-xl hover:bg-[#FAF8F5] transition-colors"
          >
            📺 Open Stall TV Screen
          </button>
        </div>
      </div>

      <div className="my-auto transition-transform">
        <Screen13StaffOrders
          onOpenQueueDisplay={handleOpenQueueDisplay}
          onSignOut={handleSignOut}
        />
      </div>
    </div>
  );
};
