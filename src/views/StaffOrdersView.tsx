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
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-start p-3 sm:p-6 font-sans">
      <div className="w-full flex justify-between items-center max-w-7xl pb-3 text-xs font-semibold text-[#7A695C]">
        <button
          onClick={() => navigate('/')}
          className="px-3 py-1.5 bg-white border border-[#DFD6CC] text-[#221611] rounded-xl hover:bg-[#F2EDE4] transition-colors shadow-2xs"
        >
          ← Return to Customer App
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/queue')}
            className="px-3 py-1.5 bg-white border border-[#DFD6CC] text-[#221611] rounded-xl hover:bg-[#F2EDE4] transition-colors shadow-2xs"
          >
            📺 Open Stall TV Screen
          </button>
        </div>
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
