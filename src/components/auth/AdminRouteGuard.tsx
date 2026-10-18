import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCafe } from '../../context/CafeContext';

interface Props {
  children: React.ReactNode;
}

export const AdminRouteGuard: React.FC<Props> = ({ children }) => {
  const { isStaffLoggedIn, isStaffAuthChecking } = useCafe();
  const location = useLocation();

  if (isStaffAuthChecking) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-[#221611] font-sans">
        <div className="w-10 h-10 border-3 border-[#DFD6CC] border-t-[#221611] rounded-full animate-spin mb-4" />
        <span className="text-xs font-bold tracking-wider uppercase text-[#7A695C]">
          Verifying staff access...
        </span>
      </div>
    );
  }

  if (!isStaffLoggedIn) {
    // Redirect unauthenticated or unauthorized visitors to staff login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
