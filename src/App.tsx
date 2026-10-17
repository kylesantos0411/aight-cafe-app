import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CafeProvider } from './context/CafeContext';

// Real Application Route Views
import { CustomerMenuView } from './views/CustomerMenuView';
import { CustomerCustomizeView } from './views/CustomerCustomizeView';
import { CustomerCartView } from './views/CustomerCartView';
import { CustomerCheckoutView } from './views/CustomerCheckoutView';
import { CustomerOrderTrackerView } from './views/CustomerOrderTrackerView';
import { CustomerAccountView } from './views/CustomerAccountView';
import { StaffLoginView } from './views/StaffLoginView';
import { StaffOrdersView } from './views/StaffOrdersView';
import { PublicQueueView } from './views/PublicQueueView';
import { DesignReferenceView } from './views/DesignReferenceView';

export default function App() {
  return (
    <CafeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans text-[#221611]">
          <main className="flex-1 flex flex-col">
            <Routes>
              {/* Customer Flow */}
              <Route path="/" element={<CustomerMenuView />} />
              <Route path="/customize/:id" element={<CustomerCustomizeView />} />
              <Route path="/cart" element={<CustomerCartView />} />
              <Route path="/checkout" element={<CustomerCheckoutView />} />
              <Route path="/order/:token" element={<CustomerOrderTrackerView />} />
              <Route path="/account" element={<CustomerAccountView />} />

              {/* Staff Portal */}
              <Route path="/staff/login" element={<StaffLoginView />} />
              <Route path="/staff/orders" element={<StaffOrdersView />} />

              {/* Public Stall Queue TV Display */}
              <Route path="/queue" element={<PublicQueueView />} />

              {/* Internal Design Reference */}
              <Route path="/design-reference" element={<DesignReferenceView />} />

              {/* Fallback to root */}
              <Route path="*" element={<CustomerMenuView />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </CafeProvider>
  );
}
