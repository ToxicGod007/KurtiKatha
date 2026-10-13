import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  IndianRupee, 
  ShoppingBag, 
  Clock, 
  AlertTriangle, 
  Users, 
  Package, 
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { api } from '../../api/client';

export default function AdminDashboard(props) {
  const outletCtx = useOutletContext();
  const onNavigateTab = props.onNavigateTab || outletCtx?.onNavigateTab;
  const { data, isLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => api.getAdminMetrics(),
    refetchInterval: 15000, // Refresh every 15s for live sales
  });

  const metrics = data?.metrics || {
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrdersCount: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockAlerts: [],
    recentOrders: [],
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-cream-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${metrics.totalRevenue.toLocaleString('en-IN')}`,
      desc: 'Paid & completed orders',
      icon: IndianRupee,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Total Orders',
      value: metrics.totalOrders,
      desc: 'All-time placed orders',
      icon: ShoppingBag,
      color: 'bg-brand-50 text-brand-600 border-brand-200',
    },
    {
      title: 'Pending Fulfillment',
      value: metrics.pendingOrdersCount,
      desc: 'Requires packing / shipping',
      icon: Clock,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      title: 'Catalog Products',
      value: metrics.totalProducts,
      desc: 'Active ethnic kurtis & nighties',
      icon: Package,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal-900">Store Performance Overview</h1>
          <p className="text-xs text-gray-500">Live operational stats from your MongoDB database</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Store Online & Accepting Orders
        </span>
      </div>

      {/* 2. Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-cream-200 shadow-card space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">{card.title}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-charcoal-900">{card.value}</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Low Stock Inventory Alert */}
      {metrics.lowStockAlerts.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h2 className="text-sm font-bold">Low Stock Warning ({metrics.lowStockAlerts.length} variants need reorder)</h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('products')}
              className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
            >
              <span>Manage Products</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {metrics.lowStockAlerts.slice(0, 6).map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-3 border border-amber-200 flex items-center justify-between shadow-2xs"
              >
                <div>
                  <h4 className="text-xs font-bold text-charcoal-900 line-clamp-1">{item.title}</h4>
                  <p className="text-[11px] text-gray-400">
                    Size: <strong>{item.size}</strong> • SKU: {item.sku}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-extrabold text-xs border border-red-200 shrink-0">
                  {item.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Recent Orders Table */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-cream-200 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-cream-100 pb-3">
          <h2 className="text-sm font-bold text-charcoal-900">Recent Customer Orders</h2>
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('orders')}
            className="text-xs font-bold text-brand-600 hover:underline"
          >
            View All Orders &rarr;
          </button>
        </div>

        {metrics.recentOrders.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">No orders placed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-cream-50 text-charcoal-900 font-bold border-b border-cream-200">
                <tr>
                  <th className="py-2.5 px-3">Order Number</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {metrics.recentOrders.map((order) => {
                  const statusColors = {
                    placed: 'bg-amber-50 text-amber-700 border-amber-200',
                    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
                    packed: 'bg-purple-50 text-purple-700 border-purple-200',
                    shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    cancelled: 'bg-red-50 text-red-700 border-red-200',
                    pending_payment: 'bg-gray-100 text-gray-600 border-gray-200',
                  };

                  return (
                    <tr key={order._id} className="hover:bg-cream-50/50">
                      <td className="py-2.5 px-3 font-mono font-bold text-brand-600">
                        {order.orderNumber}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-charcoal-900">
                        {order.shippingAddress?.name || 'Customer'}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-charcoal-900">
                        ₹{order.amounts?.total}
                      </td>
                      <td className="py-2.5 px-3 uppercase text-[11px] text-gray-500">
                        {order.payment?.method}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                          {order.orderStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
