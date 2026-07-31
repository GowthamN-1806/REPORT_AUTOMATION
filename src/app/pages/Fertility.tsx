import { useState } from 'react';
import { Search, Plus, X, Heart, CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react';
import { mockFertility } from '../data/mockData';

const resultConfig: Record<string, { bg: string; text: string; icon: any }> = {
  Positive: { bg: '#F0FDF4', text: '#22C55E', icon: CheckCircle },
  Negative: { bg: '#FEF2F2', text: '#EF4444', icon: XCircle },
  Pending: { bg: '#FFF7ED', text: '#F59E0B', icon: Clock },
};

const treatmentColors: Record<string, string> = {
  IVF: '#3CC0D0',
  IUI: '#F6C177',
  ICSI: '#1F2A5A',
  'IVF-FET': '#8B5CF6',
};

const cycleStepColors = ['#3CC0D0', '#F6C177', '#1F2A5A', '#22C55E'];

export function Fertility() {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<typeof mockFertility[0] | null>(null);
  const [treatmentFilter, setTreatmentFilter] = useState('All');
  const [form, setForm] = useState({
    patientName: '', treatmentType: 'IVF', cycleNumber: '', betaHCGDate: '', result: 'Pending', remarks: '',
  });

  const filtered = mockFertility.filter(f =>
    f.patientName.toLowerCase().includes(search.toLowerCase()) &&
    (treatmentFilter === 'All' || f.treatmentType === treatmentFilter)
  );

  const summary = {
    total: mockFertility.length,
    positive: mockFertility.filter(f => f.result === 'Positive').length,
    pending: mockFertility.filter(f => f.result === 'Pending').length,
    negative: mockFertility.filter(f => f.result === 'Negative').length,
    successRate: Math.round((mockFertility.filter(f => f.result === 'Positive').length / mockFertility.length) * 100),
  };

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1F2A5A' }}>Fertility Management</h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>{filtered.length} treatment records</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)', boxShadow: '0 4px 15px rgba(60,192,208,0.35)' }}>
          <Plus size={16} /> Add Record
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {[
          { label: 'Total Cycles', value: summary.total, color: '#1F2A5A', bg: '#EEF2FF' },
          { label: 'Successful', value: summary.positive, color: '#22C55E', bg: '#F0FDF4' },
          { label: 'Pending', value: summary.pending, color: '#F59E0B', bg: '#FFF7ED' },
          { label: 'Unsuccessful', value: summary.negative, color: '#EF4444', bg: '#FEF2F2' },
          { label: 'Success Rate', value: `${summary.successRate}%`, color: '#3CC0D0', bg: '#EEF9FB' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: s.bg, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Fertility Progress Tracker */}
      <div className="bg-white rounded-2xl p-5 mb-4" style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
        <h3 className="font-semibold mb-4" style={{ color: '#1F2A5A' }}>Active Treatment Progress Tracker</h3>
        <div className="space-y-5">
          {mockFertility.filter(f => f.result === 'Pending').map((record, i) => (
            <div key={i} className="p-4 rounded-2xl border" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: `${treatmentColors[record.treatmentType] || '#3CC0D0'}20` }}>
                    <Heart size={15} style={{ color: treatmentColors[record.treatmentType] || '#3CC0D0' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1F2A5A' }}>{record.patientName}</p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>{record.treatmentType} · Cycle {record.cycleNumber}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: '#FFF7ED', color: '#F59E0B' }}>
                  In Progress
                </span>
              </div>

              {/* Cycle Progress */}
              <div className="flex items-center gap-1">
                {record.cycles.map((step, stepIdx) => (
                  <div key={stepIdx} className="flex items-center gap-1 flex-1">
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mb-1"
                        style={{ background: cycleStepColors[stepIdx % cycleStepColors.length] }}>
                        {stepIdx + 1}
                      </div>
                      <p className="text-xs text-center" style={{ color: '#6B7280' }}>{step}</p>
                    </div>
                    {stepIdx < record.cycles.length - 1 && (
                      <div className="w-4 h-0.5 mb-4" style={{ background: '#E5E7EB' }} />
                    )}
                  </div>
                ))}
                {/* Result Node */}
                <div className="flex items-center gap-1">
                  <div className="w-4 h-0.5" style={{ background: '#E5E7EB' }} />
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-dashed mb-1"
                      style={{ borderColor: '#9CA3AF' }}>
                      <span className="text-xs" style={{ color: '#9CA3AF' }}>?</span>
                    </div>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>Result</p>
                  </div>
                </div>
              </div>

              <div className="mt-2 text-xs" style={{ color: '#6B7280' }}>
                Beta HCG Date: <span className="font-semibold" style={{ color: '#1F2A5A' }}>{record.betaHCGDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 mb-4 flex flex-wrap gap-3 items-center" style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
          <input type="text" placeholder="Search patient name..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: '#F4F7FB', border: '1.5px solid #E5E7EB', fontFamily: 'Poppins' }} />
        </div>
        <div className="flex gap-2">
          {['All', 'IVF', 'IUI', 'ICSI', 'IVF-FET'].map(t => (
            <button key={t} onClick={() => setTreatmentFilter(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: treatmentFilter === t ? '#1F2A5A' : '#F4F7FB',
                color: treatmentFilter === t ? 'white' : '#6B7280',
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F8F9FB' }}>
                {['Patient Name', 'Treatment Type', 'Cycle Number', 'Beta HCG Date', 'Result', 'Remarks', 'Actions'].map(col => (
                  <th key={col} className="text-left px-5 py-4 text-xs font-semibold" style={{ color: '#6B7280' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((record, i) => {
                const rc = resultConfig[record.result] || resultConfig.Pending;
                const Icon = rc.icon;
                const tc = treatmentColors[record.treatmentType] || '#3CC0D0';
                return (
                  <tr key={record.id} className="border-t hover:bg-blue-50/20 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: `linear-gradient(135deg, hsl(${i * 60}, 55%, 45%), hsl(${i * 60 + 30}, 55%, 55%))` }}>
                          {record.patientName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: '#1F2A5A' }}>{record.patientName}</p>
                          <p className="text-xs" style={{ color: '#6B7280' }}>{record.patientId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: `${tc}15`, color: tc }}>
                        {record.treatmentType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: record.cycleNumber }, (_, ci) => (
                          <div key={ci} className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold"
                            style={{ background: tc, opacity: ci === record.cycleNumber - 1 ? 1 : 0.4 }}>
                            {ci + 1}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: '#6B7280' }}>{record.betaHCGDate}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Icon size={13} style={{ color: rc.text }} />
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: rc.bg, color: rc.text }}>
                          {record.result}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm max-w-36 truncate" style={{ color: '#6B7280' }}>{record.remarks}</td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => setSelectedRecord(record)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium"
                        style={{ background: '#EEF2FF', color: '#1F2A5A' }}>
                        View <ChevronRight size={11} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#F3F4F6' }}>
              <div>
                <h2 className="font-bold text-lg" style={{ color: '#1F2A5A' }}>{selectedRecord.patientName}</h2>
                <p className="text-xs" style={{ color: '#6B7280' }}>{selectedRecord.treatmentType} · Cycle {selectedRecord.cycleNumber}</p>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
                <X size={18} style={{ color: '#6B7280' }} />
              </button>
            </div>
            <div className="p-6">
              {/* Cycle Steps */}
              <h3 className="text-sm font-semibold mb-3" style={{ color: '#1F2A5A' }}>Treatment Cycle Progress</h3>
              <div className="flex items-center gap-2 mb-5 flex-wrap">
                {[...selectedRecord.cycles, 'Result'].map((step, idx) => {
                  const isResult = step === 'Result';
                  const isLast = idx === selectedRecord.cycles.length;
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <div className={`flex flex-col items-center`}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold mb-1 shadow-md"
                          style={{ background: isResult ? (selectedRecord.result === 'Positive' ? '#22C55E' : selectedRecord.result === 'Negative' ? '#EF4444' : '#9CA3AF') : cycleStepColors[idx % cycleStepColors.length] }}>
                          {isResult ? (selectedRecord.result === 'Positive' ? '✓' : selectedRecord.result === 'Negative' ? '✗' : '?') : idx + 1}
                        </div>
                        <span className="text-xs text-center" style={{ color: '#6B7280', maxWidth: 60 }}>{step}</span>
                      </div>
                      {!isLast && <div className="w-6 h-0.5 mb-5" style={{ background: '#E5E7EB' }} />}
                    </div>
                  );
                })}
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Beta HCG Date', value: selectedRecord.betaHCGDate },
                  { label: 'Result', value: selectedRecord.result },
                  { label: 'Remarks', value: selectedRecord.remarks },
                ].map((item, i) => (
                  <div key={i} className="flex items-start justify-between py-2 border-b" style={{ borderColor: '#F3F4F6' }}>
                    <span className="text-sm" style={{ color: '#6B7280' }}>{item.label}</span>
                    <span className="text-sm font-semibold" style={{ color: '#1F2A5A' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#F3F4F6' }}>
              <h2 className="font-bold text-lg" style={{ color: '#1F2A5A' }}>Add Fertility Record</h2>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
                <X size={18} style={{ color: '#6B7280' }} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Patient Name', key: 'patientName', type: 'text', placeholder: 'Search patient...' },
                { label: 'Beta HCG Date', key: 'betaHCGDate', type: 'date' },
                { label: 'Remarks', key: 'remarks', type: 'text', placeholder: 'Any remarks...' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>{field.label}</label>
                  <input type={field.type} placeholder={field.placeholder}
                    value={(form as any)[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', fontFamily: 'Poppins' }} />
                </div>
              ))}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Treatment Type</label>
                  <select value={form.treatmentType} onChange={e => setForm({ ...form, treatmentType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', fontFamily: 'Poppins' }}>
                    <option>IVF</option><option>IUI</option><option>ICSI</option><option>IVF-FET</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Cycle Number</label>
                  <input type="number" placeholder="1" value={form.cycleNumber} onChange={e => setForm({ ...form, cycleNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', fontFamily: 'Poppins' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Result</label>
                  <select value={form.result} onChange={e => setForm({ ...form, result: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E5E7EB', fontFamily: 'Poppins' }}>
                    <option>Pending</option><option>Positive</option><option>Negative</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border hover:bg-gray-50"
                  style={{ borderColor: '#E5E7EB', color: '#6B7280' }}>Cancel</button>
                <button onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
                  style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)' }}>Save Record</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
