import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  X,
  Printer
} from 'lucide-react';
import { api } from '../../api/client';

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Status update modal state
  const [statusModalOrder, setStatusModalOrder] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [courierName, setCourierName] = useState('Delhivery');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchTerm) params.set('search', searchTerm);
      return api.getAdminOrders(`?${params.toString()}`);
    },
  });

  const orders = data?.orders || [];

  const updateMutation = useMutation({
    mutationFn: ({ id, status, note, tracking }) =>
      api.updateAdminOrderStatus(id, { status, note, tracking }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      setStatusModalOrder(null);
      setTrackingNumber('');
      setStatusNote('');
    },
  });

  const handleOpenStatusModal = (order, newStatus) => {
    setStatusModalOrder(order);
    setTargetStatus(newStatus);
    setTrackingNumber(order.tracking?.trackingNumber || '');
    setCourierName(order.tracking?.courierName || 'Delhivery');
  };

  const handleConfirmStatusUpdate = () => {
    if (!statusModalOrder || !targetStatus) return;

    const payload = {
      id: statusModalOrder._id,
      status: targetStatus,
      note: statusNote || `Status updated to ${targetStatus}`,
    };

    if (targetStatus === 'shipped') {
      payload.tracking = {
        courierName,
        trackingNumber,
        trackingUrl: `https://www.delhivery.com/track/package/${trackingNumber}`,
      };
    }

    updateMutation.mutate(payload);
  };

  const statusList = [
    { label: 'All Orders', val: 'all' },
    { label: 'Placed', val: 'placed' },
    { label: 'Confirmed', val: 'confirmed' },
    { label: 'Packed', val: 'packed' },
    { label: 'Shipped', val: 'shipped' },
    { label: 'Delivered', val: 'delivered' },
    { label: 'Cancelled', val: 'cancelled' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal-900">Orders Management</h1>
          <p className="text-xs text-gray-500">Track and fulfill customer orders through the delivery lifecycle</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order # or Phone..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-cream-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {statusList.map((item) => (
          <button
            key={item.val}
            type="button"
            onClick={() => setStatusFilter(item.val)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
              statusFilter === item.val
                ? 'bg-brand-500 text-white shadow-xs'
                : 'bg-white border border-cream-300 text-charcoal-900 hover:bg-cream-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-cream-200 shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-gray-400 animate-pulse">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">No orders found matching filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-cream-50 text-charcoal-900 font-bold border-b border-cream-200">
                <tr>
                  <th className="py-3 px-4">Order Reference</th>
                  <th className="py-3 px-4">Customer & Phone</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Status Actions</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {orders.map((ord) => {
                  return (
                    <tr key={ord._id} className="hover:bg-cream-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-brand-600">
                        {ord.orderNumber}
                        <div className="text-[10px] text-gray-400 font-normal">
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-charcoal-900">{ord.shippingAddress?.name}</p>
                        <p className="text-[11px] text-gray-500">{ord.shippingAddress?.phone}</p>
                        <p className="text-[10px] text-gray-400">{ord.shippingAddress?.city}, {ord.shippingAddress?.pincode}</p>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-charcoal-900">{ord.items?.length} piece(s)</span>
                        <div className="text-[10px] text-gray-500 line-clamp-1">
                          {ord.items?.[0]?.title}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-extrabold text-charcoal-900">₹{ord.amounts?.total}</span>
                        <span className="block text-[10px] uppercase text-gray-400">{ord.payment?.method}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border bg-brand-50 text-brand-700 border-brand-200">
                          {ord.orderStatus.replace('_', ' ')}
                        </span>
                        {ord.tracking?.trackingNumber && (
                          <div className="text-[10px] text-gray-400 mt-1">
                            {ord.tracking.courierName}: {ord.tracking.trackingNumber}
                          </div>
                        )}
                      </td>

                      {/* Transition Dropdown / Quick Action */}
                      <td className="py-3 px-4">
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleOpenStatusModal(ord, e.target.value)}
                          className="px-2 py-1 rounded-lg border border-cream-300 text-xs font-semibold text-charcoal-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          <option value="placed">Placed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="packed">Packed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1.5 rounded-lg hover:bg-cream-100 text-gray-600 hover:text-charcoal-900"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Modal (especially for Shipped with Tracking) */}
      {statusModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setStatusModalOrder(null)} />
          <div className="relative bg-white rounded-3xl p-6 max-w-md w-full shadow-elevated space-y-4 z-10">
            <div className="flex items-center justify-between border-b border-cream-100 pb-3">
              <h3 className="text-sm font-bold text-charcoal-900">
                Update Status to: <span className="uppercase text-brand-600">{targetStatus}</span>
              </h3>
              <button type="button" onClick={() => setStatusModalOrder(null)}>
                <X className="w-4 h-4 text-gray-400 hover:text-charcoal-900" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Updating order <strong>#{statusModalOrder.orderNumber}</strong>
            </p>

            {targetStatus === 'shipped' && (
              <div className="space-y-3 p-3 bg-cream-50 rounded-2xl border border-cream-200">
                <div>
                  <label className="block text-[11px] font-bold text-charcoal-900 mb-1">Courier Partner</label>
                  <input
                    type="text"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="Delhivery / BlueDart / DTDC"
                    className="w-full px-3 py-1.5 rounded-xl border border-cream-300 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-charcoal-900 mb-1">AWB Tracking Number *</label>
                  <input
                    type="text"
                    required
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. 123456789012"
                    className="w-full px-3 py-1.5 rounded-xl border border-cream-300 text-xs bg-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-charcoal-900 mb-1">Timeline Note (Optional)</label>
              <textarea
                rows={2}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="e.g. Handed over to Kolkata dispatch hub"
                className="w-full px-3 py-1.5 rounded-xl border border-cream-300 text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-cream-100 text-xs font-bold text-charcoal-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updateMutation.isPending}
                onClick={handleConfirmStatusUpdate}
                className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-xs font-bold text-white shadow-sm"
              >
                {updateMutation.isPending ? 'Updating...' : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-3xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-elevated space-y-4 z-10 text-xs">
            <div className="flex items-center justify-between border-b border-cream-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-charcoal-900">Order #{selectedOrder.orderNumber}</h3>
                <span className="text-[10px] text-gray-400">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</span>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-charcoal-900">Items ({selectedOrder.items?.length})</h4>
              {selectedOrder.items?.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-2 rounded-xl bg-cream-50">
                  <div>
                    <p className="font-bold text-charcoal-900">{item.title}</p>
                    <p className="text-[11px] text-gray-500">Size: {item.variant?.size} • Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-brand-600">₹{item.subtotal}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 pt-2 border-t border-cream-100">
              <h4 className="font-bold text-charcoal-900">Delivery Address</h4>
              <p className="text-gray-600">
                {selectedOrder.shippingAddress?.name}<br />
                {selectedOrder.shippingAddress?.addressLine}, {selectedOrder.shippingAddress?.locality}<br />
                {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}<br />
                Phone: {selectedOrder.shippingAddress?.phone}
              </p>
            </div>

            <div className="space-y-1 pt-2 border-t border-cream-100">
              <h4 className="font-bold text-charcoal-900">Status History</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {selectedOrder.statusHistory?.map((h, i) => (
                  <div key={i} className="text-[11px] text-gray-500 flex justify-between">
                    <span><strong>{h.status}:</strong> {h.note}</span>
                    <span className="text-[10px] text-gray-400 shrink-0">{new Date(h.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-cream-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-charcoal-900 text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

