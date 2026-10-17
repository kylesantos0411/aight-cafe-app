import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import type { CustomerUser, Order } from '../types/cafe';

export const CustomerAccountView: React.FC = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authService.getCustomerSession().then(async user => {
      setCustomer(user);
      if (user) {
        const all = await orderService.getAllOrders();
        setOrders(all.filter(o => o.customerId === user.id || o.customerName.toLowerCase() === user.fullName.toLowerCase()));
      }
    });
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let user: CustomerUser;
      if (isRegistering) {
        user = await authService.signUpCustomer(email, password, email.split('@')[0]);
      } else {
        user = await authService.signInCustomer(email, password);
      }
      setCustomer(user);
      const all = await orderService.getAllOrders();
      setOrders(all.filter(o => o.customerId === user.id || o.customerName.toLowerCase() === user.fullName.toLowerCase()));
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await authService.signOutCustomer();
    setCustomer(null);
    setOrders([]);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#221611] font-sans flex flex-col selection:bg-[#221611] selection:text-[#FAF8F5]">
      <div className="w-full max-w-xl mx-auto px-4 sm:px-6 md:px-8 py-5 md:py-8 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#ECE5DC]">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm font-bold text-[#221611] p-1 -ml-1 hover:text-[#5C4A3E] cursor-pointer"
          >
            <span>←</span>
            <span>Back to menu</span>
          </button>
          <span className="font-bold text-sm text-[#221611]">Customer Account</span>
          <span className="text-xs text-[#8C7A6D]">☕</span>
        </div>

        {customer ? (
          <div className="mt-6 space-y-6 flex-1 flex flex-col">
            <div className="p-4 bg-white rounded-2xl border border-[#ECE5DC] space-y-1 shadow-xs">
              <span className="text-[10px] uppercase tracking-wider text-[#8C7A6D] font-bold">Signed in as</span>
              <h2 className="text-base font-black text-[#221611]">{customer.fullName}</h2>
              <p className="text-xs text-[#7A695C]">{customer.email}</p>
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-sm text-[#221611] mb-3">Order History</h3>
              {orders.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#8C7A6D] bg-white rounded-2xl border border-[#ECE5DC]">
                  No past orders on this account yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {orders.map(o => (
                    <Link
                      key={o.id}
                      to={`/order/${o.privateToken}`}
                      className="block p-3.5 bg-white rounded-2xl border border-[#ECE5DC] hover:border-[#221611] transition-all shadow-xs"
                    >
                      <div className="flex justify-between items-start text-xs">
                        <div>
                          <span className="font-bold font-mono text-sm text-[#221611]">{o.code}</span>
                          <span className="text-[#7A695C] ml-2 font-medium">({o.items.length} items)</span>
                        </div>
                        <span className="font-bold text-[#221611]">₱{o.totalAmount}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-[#8C7A6D] mt-2 pt-2 border-t border-[#F2ECE3]">
                        <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                        <span className="capitalize font-semibold text-[#221611]">{o.status}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-auto pt-4">
              <button
                onClick={handleSignOut}
                className="w-full py-3 bg-white border border-[#DFD6CC] text-[#221611] hover:bg-[#FAF8F5] rounded-2xl font-bold text-xs transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="mt-8 space-y-4 text-xs flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-black text-[#221611]">
                  {isRegistering ? 'Create customer account' : 'Welcome back'}
                </h2>
                <p className="text-xs text-[#7A695C] mt-1">
                  Track your orders and view your purchase history.
                </p>
              </div>

              <div>
                <label className="font-bold text-[#221611] block mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="alex@example.com"
                  className="w-full px-3.5 py-3 bg-white rounded-2xl border border-[#DFD6CC] text-xs font-medium text-[#221611] focus:outline-hidden focus:ring-1 focus:ring-[#221611]"
                />
              </div>

              <div>
                <label className="font-bold text-[#221611] block mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-3 bg-white rounded-2xl border border-[#DFD6CC] text-xs font-medium text-[#221611] focus:outline-hidden focus:ring-1 focus:ring-[#221611]"
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-[11px] font-medium">
                  {error}
                </div>
              )}
            </div>

            <div className="pt-4 space-y-2 mt-auto">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#221611] hover:bg-[#36251E] text-white rounded-2xl font-bold text-xs transition-colors"
              >
                {loading ? 'Please wait...' : isRegistering ? 'Create account' : 'Sign in'}
              </button>

              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="w-full text-center text-xs text-[#7A695C] hover:text-[#221611] font-medium py-1"
              >
                {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
              </button>
            </div>
          </form>
        )}

        {/* Home indicator */}
        <div className="h-4 flex items-center justify-center pt-4">
          <div className="w-32 h-1 bg-[#221611]/30 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
