import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Image as ImageIcon, 
  X, 
  Check, 
  AlertCircle,
  Package
} from 'lucide-react';
import { api } from '../../api/client';

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    fabric: '100% Breathable Cotton',
    description: '',
    mrp: '',
    price: '',
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800',
    variants: [
      { size: 'S', color: 'Crimson', stock: 15 },
      { size: 'M', color: 'Crimson', stock: 20 },
      { size: 'L', color: 'Crimson', stock: 18 },
      { size: 'XL', color: 'Crimson', stock: 10 },
      { size: 'XXL', color: 'Crimson', stock: 5 },
    ],
    bestseller: false,
    isNewArrival: true,
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => api.getAdminProducts(),
  });

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });

  const products = productsData?.products || [];
  const categories = catData?.categories || [];

  const createMutation = useMutation({
    mutationFn: (newProduct) => api.createAdminProduct(newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      setIsAddModalOpen(false);
      // Reset form
      setFormData({
        title: '',
        category: '',
        fabric: '100% Breathable Cotton',
        description: '',
        mrp: '',
        price: '',
        imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800',
        variants: [
          { size: 'S', color: 'Crimson', stock: 15 },
          { size: 'M', color: 'Crimson', stock: 20 },
          { size: 'L', color: 'Crimson', stock: 18 },
          { size: 'XL', color: 'Crimson', stock: 10 },
          { size: 'XXL', color: 'Crimson', stock: 5 },
        ],
        bestseller: false,
        isNewArrival: true,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.deleteAdminProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
  });

  const handleStockChange = (index, value) => {
    const updated = [...formData.variants];
    updated[index].stock = Math.max(0, parseInt(value, 10) || 0);
    setFormData((prev) => ({ ...prev, variants: updated }));
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.mrp || !formData.price) {
      alert('Please fill all mandatory fields: Title, Category, MRP, and Selling Price.');
      return;
    }

    const payload = {
      title: formData.title,
      category: formData.category,
      fabric: formData.fabric,
      description: formData.description || `${formData.title} handcrafted in soft fabric.`,
      mrp: Number(formData.mrp),
      price: Number(formData.price),
      images: [{ url: formData.imageUrl, isPrimary: true }],
      variants: formData.variants.map((v) => ({
        size: v.size,
        color: v.color,
        sku: `KK-${Date.now().toString().slice(-4)}-${v.size}`,
        stock: Number(v.stock),
      })),
      bestseller: formData.bestseller,
      isNewArrival: formData.isNewArrival,
    };

    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal-900">Products Catalog ({products.length})</h1>
          <p className="text-xs text-gray-500">Manage kurtis, nighties, variant sizes and stock inventory</p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="touch-target px-4 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-cream-200 shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-gray-400 animate-pulse">Loading products...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-cream-50 text-charcoal-900 font-bold border-b border-cream-200">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Fabric</th>
                  <th className="py-3 px-4">Price / MRP</th>
                  <th className="py-3 px-4">Variants & Stock</th>
                  <th className="py-3 px-4">Badges</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {products.map((p) => {
                  const totalStock = p.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
                  return (
                    <tr key={p._id} className="hover:bg-cream-50/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200'}
                            alt={p.title}
                            className="w-12 h-14 object-cover rounded-xl bg-cream-100 shrink-0"
                          />
                          <div>
                            <h4 className="font-bold text-charcoal-900 max-w-xs line-clamp-1">{p.title}</h4>
                            <p className="text-[10px] text-gray-400 font-mono">/{p.slug}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 capitalize font-medium text-gray-600">
                        {p.category?.name || 'Kurtis'}
                      </td>

                      <td className="py-3 px-4 text-gray-600 font-medium">
                        {p.fabric}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-brand-600">₹{p.price}</span>
                        <span className="text-[10px] text-gray-400 line-through ml-1.5">₹{p.mrp}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`font-bold ${totalStock <= 10 ? 'text-amber-600' : 'text-charcoal-900'}`}>
                          {totalStock} in stock
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.variants?.map((v, i) => (
                            <span
                              key={i}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                v.stock <= 5 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-cream-100 text-gray-600'
                              }`}
                            >
                              {v.size}:{v.stock}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 text-[9px] font-bold uppercase">
                          {p.bestseller && (
                            <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded w-fit">Bestseller</span>
                          )}
                          {p.isNewArrival && (
                            <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded w-fit">New Arrival</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${p.title}"?`)) {
                              deleteMutation.mutate(p._id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-elevated space-y-6 z-10 text-xs">
            
            <div className="flex items-center justify-between border-b border-cream-100 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-500" />
                <h3 className="text-base font-bold text-charcoal-900">Add New Product</h3>
              </div>
              <button type="button" onClick={() => setIsAddModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-charcoal-900" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-900 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Royal Indigo Handblock Cotton Kurti"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-900 mb-1">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-900 mb-1">Fabric Composition *</label>
                  <input
                    type="text"
                    required
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    placeholder="e.g. 100% Cambric Cotton"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-900 mb-1">Maximum Retail Price (MRP ₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    placeholder="e.g. 1299"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-900 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 649"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-900 mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-900 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe fabric softness, occasion, styling and fit..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs"
                />
              </div>

              {/* Variant Matrix */}
              <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-3">
                <span className="text-xs font-bold text-charcoal-900 uppercase">Size Stock Matrix</span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {formData.variants.map((v, idx) => (
                    <div key={v.size} className="bg-white p-2.5 rounded-xl border border-cream-200">
                      <span className="block text-xs font-bold text-brand-600 mb-1">Size {v.size}</span>
                      <input
                        type="number"
                        min={0}
                        value={v.stock}
                        onChange={(e) => handleStockChange(idx, e.target.value)}
                        className="w-full px-2 py-1 border border-cream-300 rounded text-xs"
                        placeholder="Qty"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.bestseller}
                    onChange={(e) => setFormData({ ...formData, bestseller: e.target.checked })}
                    className="text-brand-500 rounded"
                  />
                  <span className="text-xs font-bold text-charcoal-900">Mark as Bestseller</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNewArrival}
                    onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                    className="text-brand-500 rounded"
                  />
                  <span className="text-xs font-bold text-charcoal-900">Mark as New Arrival</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-cream-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-cream-100 text-charcoal-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold shadow-md"
                >
                  {createMutation.isPending ? 'Saving...' : 'Create Product'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

