import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CafeProvider } from './context/CafeContext';

// Customer Route Views
import { CustomerMenuView } from './views/CustomerMenuView';
import { CustomerCustomizeView } from './views/CustomerCustomizeView';
import { CustomerCartView } from './views/CustomerCartView';
import { CustomerCheckoutView } from './views/CustomerCheckoutView';
import { CustomerOrderTrackerView } from './views/CustomerOrderTrackerView';
import { CustomerAccountView } from './views/CustomerAccountView';
import { CustomerLoginView } from './views/CustomerLoginView';
import { CustomerRegisterView } from './views/CustomerRegisterView';
import { ReorderView } from './views/ReorderView';
import { TrackOrderView } from './views/TrackOrderView';
import { CustomerRewardsView } from './views/CustomerRewardsView';

// Staff / Admin Route Views & Route Guard
import { AdminLoginView } from './views/AdminLoginView';
import { AdminOrdersView } from './views/StaffOrdersView';
import { AdminMenuView } from './views/AdminMenuView';
import { AdminHistoryView } from './views/AdminHistoryView';
import { AdminNfcView } from './views/AdminNfcView';
import { AdminRouteGuard } from './components/auth/AdminRouteGuard';

// Standalone Public Stall Queue Display (TV/Monitor)
import { PublicQueueView } from './views/PublicQueueView';

export default function App() {
  return (
    <CafeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans text-[#221611]">
          <main className="flex-1 flex flex-col">
            <Routes>
              {/* 1. Customer Routes */}
              <Route path="/" element={<CustomerMenuView />} />
              <Route path="/menu" element={<CustomerMenuView />} />
              <Route path="/customize/:id" element={<CustomerCustomizeView />} />
              <Route path="/cart" element={<CustomerCartView />} />
              <Route path="/checkout" element={<CustomerCheckoutView />} />
              <Route path="/order/:token" element={<CustomerOrderTrackerView />} />
              <Route path="/reorder" element={<ReorderView />} />
              <Route path="/track" element={<TrackOrderView />} />
              <Route path="/rewards" element={<CustomerRewardsView />} />
              <Route path="/login" element={<CustomerLoginView />} />
              <Route path="/register" element={<CustomerRegisterView />} />
              <Route path="/account" element={<CustomerAccountView />} />
              <Route path="/account/orders" element={<CustomerAccountView />} />

              {/* 2. Staff / Admin Routes (Role-Protected) */}
              <Route path="/admin/login" element={<AdminLoginView />} />
              <Route path="/admin" element={<Navigate to="/admin/orders" replace />} />
              <Route
                path="/admin/orders"
                element={
                  <AdminRouteGuard>
                    <AdminOrdersView />
                  </AdminRouteGuard>
                }
              />
              <Route
                path="/admin/menu"
                element={
                  <AdminRouteGuard>
                    <AdminMenuView />
                  </AdminRouteGuard>
                }
              />
              <Route
                path="/admin/history"
                element={
                  <AdminRouteGuard>
                    <AdminHistoryView />
                  </AdminRouteGuard>
                }
              />
              <Route
                path="/admin/nfc"
                element={
                  <AdminRouteGuard>
                    <AdminNfcView />
                  </AdminRouteGuard>
                }
              />

              {/* Legacy staff redirects */}
              <Route path="/staff/login" element={<Navigate to="/admin/login" replace />} />
              <Route path="/staff/orders" element={<Navigate to="/admin/orders" replace />} />
              <Route path="/staff" element={<Navigate to="/admin/orders" replace />} />

              {/* 3. Standalone Public Stall TV Queue Display */}
              <Route path="/queue" element={<PublicQueueView />} />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </CafeProvider>
  );
}
