import { useState } from 'react';
import { Search, Plus, X, CreditCard, Banknote, Smartphone, Globe, Printer, Plus as PlusIcon, Trash2 } from 'lucide-react';
import { mockBilling } from '../data/mockData';

const paymentModeColors: Record<string, { bg: string; text: string }> = {
  Cash: { bg: '#F0FDF4', text: '#15803D' },
  Card: { bg: '#EFF6FF', text: '#1D4ED8' },
  UPI: { bg: '#FFF7ED', text: '#B45309' },
  'Net Banking': { bg: '#F5F3FF', text: '#6D28D9' },
};

type BillingItem = { description: string; amount: number };

const billingCategories = [
  { label: 'Scan', key: 'scan', color: '#3CC0D0' },
  { label: 'Procedure', key: 'procedure', color: '#1F2A5A' },
  { label: 'Consultation', key: 'consultation', color: '#F6C177' },
  { label: 'Pharmacy', key: 'pharmacy', color: '#22C55E' },
  { label: 'Injection', key: 'injection', color: '#8B5CF6' },
];

export function Billing() {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [items, setItems] = useState<Record<string, BillingItem[]>>({
    scan: [{ description: '', amount: 0 }],
    procedure: [],
    consultation: [{ description: '', amount: 0 }],
    pharmacy: [],
    injection: [],
  });
  const [patient, setPatient] = useState('');
  const [notes, setNotes] = useState('');

  const filtered = mockBilling.filter(b =>
    b.patientName.toLowerCase().includes(search.toLowerCase()) ||
    b.createdBy.toLowerCase().includes(search.toLowerCase())
  );

  const addItem = (cat: string) => {
    setItems(prev => ({ ...prev, [cat]: [...prev[cat], { description: '', amount: 0 }] }));
  };
  const removeItem = (cat: string, idx: number) => {
    setItems(prev => ({ ...prev, [cat]: prev[cat].filter((_, i) => i !== idx) }));
  };
  const updateItem = (cat: string, idx: number, field: keyof BillingItem, val: string | number) => {
    setItems(prev => ({
      ...prev,
      [cat]: prev[cat].map((item, i) => i === idx ? { ...item, [field]: val } : item)
    }));
  };

  const total = Object.values(items).flat().reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1F2A5A' }}>Patient Billing</h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>{filtered.length} billing records</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)', boxShadow: '0 4px 15px rgba(60,192,208,0.35)' }}>
          <Plus size={16} /> Create Bill
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 mb-4 flex gap-3 items-center" style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
          <input type="text" placeholder="Search by patient name..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: '#F4F7FB', border: '1.5px solid #E5E7EB', fontFamily: 'Poppins' }} />
        </div>
        <input type="date" defaultValue="2026-03-12"
          className="px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', fontFamily: 'Poppins' }} />
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm" style={{ background: '#F4F7FB', color: '#6B7280' }}>
          <Printer size={14} /> Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {[
          { label: 'Total Revenue', value: '₹75,700', color: '#22C55E' },
          { label: 'Cash Payments', value: '₹12,000', color: '#3CC0D0' },
          { label: 'Card / UPI', value: '₹26,700', color: '#F6C177' },
          { label: 'Pending Bills', value: '3', color: '#EF4444' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>{s.label}</p>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F8F9FB' }}>
                {['Patient Name', 'Created By', 'Date', 'Time', 'Session', 'Notes', 'Payment Mode', 'Total Bill'].map(col => (
                  <th key={col} className="text-left px-5 py-4 text-xs font-semibold" style={{ color: '#6B7280' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((bill, i) => {
                const pc = paymentModeColors[bill.paymentMode] || { bg: '#F4F7FB', text: '#6B7280' };
                return (
                  <tr key={bill.id} className="border-t hover:bg-blue-50/20 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, hsl(${i * 45}, 55%, 45%), hsl(${i * 45 + 30}, 55%, 55%))` }}>
                          {bill.patientName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-medium" style={{ color: '#1F2A5A' }}>{bill.patientName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: '#374151' }}>{bill.createdBy}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: '#6B7280' }}>{bill.date}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: '#6B7280' }}>{bill.time}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#F4F7FB', color: '#6B7280' }}>{bill.session}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm max-w-32 truncate" style={{ color: '#6B7280' }}>{bill.notes}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: pc.bg, color: pc.text }}>
                        {bill.paymentMode}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold" style={{ color: '#1F2A5A' }}>₹{bill.totalBill.toLocaleString()}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Bill Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10" style={{ borderColor: '#F3F4F6' }}>
              <div>
                <h2 className="font-bold text-lg" style={{ color: '#1F2A5A' }}>Create New Bill</h2>
                <p className="text-xs" style={{ color: '#6B7280' }}>Add billing items and select payment mode</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
                <X size={18} style={{ color: '#6B7280' }} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Patient */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Patient Name</label>
                  <input type="text" placeholder="Search patient..." value={patient} onChange={e => setPatient(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', fontFamily: 'Poppins' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Notes</label>
                  <input type="text" placeholder="Billing notes..." value={notes} onChange={e => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', fontFamily: 'Poppins' }} />
                </div>
              </div>

              {/* Billing Categories */}
              {billingCategories.map(cat => (
                <div key={cat.key} className="rounded-xl overflow-hidden border" style={{ borderColor: '#E5E7EB' }}>
                  <div className="flex items-center justify-between px-4 py-2.5" style={{ background: `${cat.color}15` }}>
                    <span className="text-sm font-semibold" style={{ color: cat.color }}>{cat.label}</span>
                    <button onClick={() => addItem(cat.key)}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium"
                      style={{ background: cat.color, color: 'white' }}>
                      <PlusIcon size={10} /> Add
                    </button>
                  </div>
                  {items[cat.key].length === 0 ? (
                    <div className="px-4 py-3 text-xs" style={{ color: '#9CA3AF' }}>No items added</div>
                  ) : (
                    <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
                      {items[cat.key].map((item, idx) => (
                        <div key={idx} className="flex gap-2 px-4 py-2.5 items-center">
                          <input type="text" placeholder="Description" value={item.description}
                            onChange={e => updateItem(cat.key, idx, 'description', e.target.value)}
                            className="flex-1 px-2 py-1.5 rounded-lg text-xs outline-none" style={{ border: '1.5px solid #E5E7EB', fontFamily: 'Poppins' }} />
                          <div className="relative w-28">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#6B7280' }}>₹</span>
                            <input type="number" placeholder="0" value={item.amount || ''}
                              onChange={e => updateItem(cat.key, idx, 'amount', e.target.value)}
                              className="w-full pl-5 pr-2 py-1.5 rounded-lg text-xs outline-none" style={{ border: '1.5px solid #E5E7EB', fontFamily: 'Poppins' }} />
                          </div>
                          <button onClick={() => removeItem(cat.key, idx)} className="p-1 rounded-lg hover:bg-red-50">
                            <Trash2 size={12} style={{ color: '#EF4444' }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Payment Mode */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>Mode of Payment</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Cash', icon: Banknote },
                    { label: 'Card', icon: CreditCard },
                    { label: 'UPI', icon: Smartphone },
                    { label: 'Net Banking', icon: Globe },
                  ].map(({ label, icon: Icon }) => (
                    <button key={label} onClick={() => setPaymentMode(label)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all border"
                      style={{
                        background: paymentMode === label ? '#1F2A5A' : 'white',
                        color: paymentMode === label ? 'white' : '#6B7280',
                        borderColor: paymentMode === label ? '#1F2A5A' : '#E5E7EB',
                      }}>
                      <Icon size={18} />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">Total Bill Amount</span>
                  <span className="text-2xl font-bold text-white">₹{total.toLocaleString()}</span>
                </div>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>Payment via {paymentMode}</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border hover:bg-gray-50"
                  style={{ borderColor: '#E5E7EB', color: '#6B7280' }}>Cancel</button>
                <button onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
                  style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)' }}>
                  Generate Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
