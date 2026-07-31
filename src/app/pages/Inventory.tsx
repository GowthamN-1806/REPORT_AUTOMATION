import { useState } from 'react';
import { Search, Plus, AlertTriangle, CheckCircle, XCircle, X, Package, Filter } from 'lucide-react';
import { mockInventory } from '../data/mockData';

function getExpiryStatus(expiryDate: string): 'Safe' | 'Expiring Soon' | 'Expired' {
  const expiry = new Date(expiryDate);
  const now = new Date('2026-03-12');
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Expired';
  if (diffDays <= 60) return 'Expiring Soon';
  return 'Safe';
}

const expiryConfig = {
  Safe: { bg: '#F0FDF4', text: '#22C55E', border: '#BBF7D0', icon: CheckCircle },
  'Expiring Soon': { bg: '#FFF7ED', text: '#F59E0B', border: '#FED7AA', icon: AlertTriangle },
  Expired: { bg: '#FEF2F2', text: '#EF4444', border: '#FECACA', icon: XCircle },
};

export function Inventory() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    drugName: '', dosage: '', category: '', generic: '',
    quantity: '', vendor: '', orderDate: '', expiryDate: '',
  });

  const filtered = mockInventory.filter(d => {
    const status = getExpiryStatus(d.expiryDate);
    return (d.drugName.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === 'All' || status === statusFilter);
  });

  const summary = {
    total: mockInventory.length,
    safe: mockInventory.filter(d => getExpiryStatus(d.expiryDate) === 'Safe').length,
    expiringSoon: mockInventory.filter(d => getExpiryStatus(d.expiryDate) === 'Expiring Soon').length,
    expired: mockInventory.filter(d => getExpiryStatus(d.expiryDate) === 'Expired').length,
    lowStock: mockInventory.filter(d => d.quantity <= 10).length,
  };

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1F2A5A' }}>Drug Inventory</h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>{filtered.length} drugs tracked</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)', boxShadow: '0 4px 15px rgba(60,192,208,0.35)' }}>
          <Plus size={16} /> Add Drug
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {[
          { label: 'Total Drugs', value: summary.total, bg: '#EEF2FF', text: '#1F2A5A' },
          { label: 'Safe', value: summary.safe, bg: '#F0FDF4', text: '#22C55E' },
          { label: 'Expiring Soon', value: summary.expiringSoon, bg: '#FFF7ED', text: '#F59E0B' },
          { label: 'Expired', value: summary.expired, bg: '#FEF2F2', text: '#EF4444' },
          { label: 'Low Stock (≤10)', value: summary.lowStock, bg: '#F5F3FF', text: '#8B5CF6' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-4 text-center" style={{ background: s.bg, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <p className="text-2xl font-bold" style={{ color: s.text }}>{s.value}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: s.text }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Expiry Tracker */}
      <div className="bg-white rounded-2xl p-5 mb-4" style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
        <h3 className="font-semibold mb-3" style={{ color: '#1F2A5A' }}>Drug Expiry Tracker</h3>
        <div className="space-y-2">
          {mockInventory.filter(d => {
            const status = getExpiryStatus(d.expiryDate);
            return status !== 'Safe';
          }).map((drug, i) => {
            const status = getExpiryStatus(drug.expiryDate);
            const config = expiryConfig[status];
            const Icon = config.icon;
            const expiry = new Date(drug.expiryDate);
            const now = new Date('2026-03-12');
            const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border"
                style={{ background: config.bg, borderColor: config.border }}>
                <Icon size={16} style={{ color: config.text }} />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: '#1F2A5A' }}>{drug.drugName} ({drug.dosage})</p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>Expires: {drug.expiryDate} · Vendor: {drug.vendor}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: config.text, color: 'white' }}>
                    {status === 'Expired' ? `${Math.abs(diffDays)}d overdue` : `${diffDays}d left`}
                  </span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'rgba(0,0,0,0.05)', color: config.text }}>
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 mb-4 flex flex-wrap gap-3 items-center" style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
          <input type="text" placeholder="Search drug name or category..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: '#F4F7FB', border: '1.5px solid #E5E7EB', fontFamily: 'Poppins' }} />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: '#6B7280' }} />
          {['All', 'Safe', 'Expiring Soon', 'Expired'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: statusFilter === s ? '#1F2A5A' : '#F4F7FB',
                color: statusFilter === s ? 'white' : '#6B7280',
              }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F8F9FB' }}>
                {['Drug Name', 'Dosage', 'Category', 'Generic Medicine', 'Quantity', 'Vendor', 'Order Date', 'Expiry Date', 'Status'].map(col => (
                  <th key={col} className="text-left px-4 py-4 text-xs font-semibold" style={{ color: '#6B7280' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((drug, i) => {
                const status = getExpiryStatus(drug.expiryDate);
                const config = expiryConfig[status];
                const Icon = config.icon;
                const isLowStock = drug.quantity <= 10;
                return (
                  <tr key={drug.id} className="border-t hover:bg-blue-50/20 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#EEF2FF' }}>
                          <Package size={13} style={{ color: '#1F2A5A' }} />
                        </div>
                        <span className="text-sm font-medium" style={{ color: '#1F2A5A' }}>{drug.drugName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: '#374151' }}>{drug.dosage}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#EEF2FF', color: '#1F2A5A' }}>{drug.category}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: '#6B7280' }}>{drug.generic}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-sm" style={{ color: isLowStock ? '#EF4444' : '#1F2A5A' }}>
                        {drug.quantity}
                        {isLowStock && <span className="ml-1 text-xs font-normal" style={{ color: '#EF4444' }}>⚠ Low</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: '#374151' }}>{drug.vendor}</td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: '#6B7280' }}>{drug.orderDate}</td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: '#6B7280' }}>{drug.expiryDate}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Icon size={13} style={{ color: config.text }} />
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: config.bg, color: config.text, border: `1px solid ${config.border}` }}>
                          {status}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Drug Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#F3F4F6' }}>
              <h2 className="font-bold text-lg" style={{ color: '#1F2A5A' }}>Add New Drug</h2>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
                <X size={18} style={{ color: '#6B7280' }} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Drug Name', key: 'drugName', placeholder: 'e.g., Clomiphene' },
                  { label: 'Dosage', key: 'dosage', placeholder: 'e.g., 50mg' },
                  { label: 'Category', key: 'category', placeholder: 'e.g., Fertility' },
                  { label: 'Generic Medicine', key: 'generic', placeholder: 'Generic name' },
                  { label: 'Quantity', key: 'quantity', placeholder: 'Units' },
                  { label: 'Vendor', key: 'vendor', placeholder: 'Vendor name' },
                  { label: 'Order Date', key: 'orderDate', type: 'date' },
                  { label: 'Expiry Date', key: 'expiryDate', type: 'date' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>{field.label}</label>
                    <input
                      type={field.type || 'text'}
                      placeholder={field.placeholder}
                      value={(form as any)[field.key]}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ border: '1.5px solid #E5E7EB', fontFamily: 'Poppins' }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border hover:bg-gray-50"
                  style={{ borderColor: '#E5E7EB', color: '#6B7280' }}>Cancel</button>
                <button onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
                  style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)' }}>Add Drug</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
