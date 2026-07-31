import { useState } from 'react';
import { Search, Printer, Download, Filter, FileText, Pill, ScanLine, Syringe, Stethoscope, ChevronRight } from 'lucide-react';

const reportTypes = [
  { key: 'pharmacy', label: 'Pharmacy Report', icon: Pill, color: '#3CC0D0' },
  { key: 'scan', label: 'Scan Report', icon: ScanLine, color: '#F6C177' },
  { key: 'procedure', label: 'Procedure Report', icon: Stethoscope, color: '#1F2A5A' },
  { key: 'consultation', label: 'Consultation Report', icon: FileText, color: '#22C55E' },
  { key: 'injection', label: 'Injection Report', icon: Syringe, color: '#8B5CF6' },
];

// Pharmacy Report: Sl No, Date, Patient Name, Pharmacy, Pharmacy Amount, Remarks
const pharmacyData = [
  { date: '12/03/2026', patientName: 'Aisha Mehta', pharmacy: 'Clomiphene 50mg', pharmacyAmount: 1200, remarks: 'Morning dose – taken after food', session: 'Morning' },
  { date: '12/03/2026', patientName: 'Deepa Pillai', pharmacy: 'Progesterone 200mg', pharmacyAmount: 2250, remarks: 'Vaginal suppository, continue for 14 days', session: 'Morning' },
  { date: '11/03/2026', patientName: 'Kavitha Rao', pharmacy: 'FSH Injection 75 IU', pharmacyAmount: 8500, remarks: 'Continue stimulation protocol', session: 'Afternoon' },
  { date: '11/03/2026', patientName: 'Mohammed Ali', pharmacy: 'GnRH Agonist 3.75mg', pharmacyAmount: 12000, remarks: 'Single dose – down regulation', session: 'Morning' },
  { date: '10/03/2026', patientName: 'Priya Nair', pharmacy: 'Folic Acid 5mg', pharmacyAmount: 180, remarks: 'Daily supplement – continue', session: 'Evening' },
  { date: '10/03/2026', patientName: 'Rajesh Kumar', pharmacy: 'Metformin 500mg', pharmacyAmount: 320, remarks: 'Twice daily with meals', session: 'Morning' },
  { date: '09/03/2026', patientName: 'Sunita Verma', pharmacy: 'Estradiol 2mg', pharmacyAmount: 450, remarks: 'Endometrial preparation phase', session: 'Morning' },
];

// Scan Report: Sl No, Date, Patient Name, Scan Type, Doctor, Amount, Remarks
const scanData = [
  { date: '12/03/2026', patientName: 'Aisha Mehta', scanType: 'Follicular Study', doctor: 'Dr. Rekha Nair', amount: 1500, remarks: '3 mature follicles – trigger advised', session: 'Morning' },
  { date: '12/03/2026', patientName: 'Sunita Verma', scanType: 'Pelvic USG', doctor: 'Dr. Rekha Nair', amount: 1200, remarks: 'Fibroids noted – review in 6 weeks', session: 'Afternoon' },
  { date: '11/03/2026', patientName: 'Priya Nair', scanType: 'Obstetric USG', doctor: 'Dr. Rekha Nair', amount: 1500, remarks: 'Week 28 – normal fetal growth', session: 'Morning' },
  { date: '11/03/2026', patientName: 'Kavitha Rao', scanType: 'Antral Follicle Count', doctor: 'Dr. Rekha Nair', amount: 2000, remarks: 'AFC: 12 – good ovarian reserve', session: 'Afternoon' },
  { date: '10/03/2026', patientName: 'Deepa Pillai', scanType: 'Endometrial Thickness', doctor: 'Dr. Priya Sharma', amount: 1200, remarks: 'ET: 9.2mm – ready for transfer', session: 'Morning' },
  { date: '10/03/2026', patientName: 'Rahul Joshi', scanType: 'Scrotal USG', doctor: 'Dr. Suresh Babu', amount: 1800, remarks: 'Normal – mild varicocele noted', session: 'Afternoon' },
];

// Procedure Report: Sl No, Date, Patient Name, Procedure, Doctor, Amount, Remarks
const procedureData = [
  { date: '12/03/2026', patientName: 'Aisha Mehta', procedure: 'Egg Retrieval (OPU)', doctor: 'Dr. Priya Sharma', amount: 25000, remarks: '9 eggs retrieved – 7 mature', session: 'Morning' },
  { date: '12/03/2026', patientName: 'Mohammed Ali', procedure: 'Embryo Transfer', doctor: 'Dr. Priya Sharma', amount: 15000, remarks: '2 blastocysts transferred – Day 5', session: 'Afternoon' },
  { date: '11/03/2026', patientName: 'Deepa Pillai', procedure: 'IUI Procedure', doctor: 'Dr. Priya Sharma', amount: 8000, remarks: 'Post-wash count 18 million – done', session: 'Morning' },
  { date: '10/03/2026', patientName: 'Sunita Verma', procedure: 'Laparoscopy', doctor: 'Dr. Anil Kapoor', amount: 35000, remarks: 'Endometriosis Grade II – cauterized', session: 'Morning' },
  { date: '09/03/2026', patientName: 'Kavitha Rao', procedure: 'Hysteroscopy', doctor: 'Dr. Priya Sharma', amount: 18000, remarks: 'Polyp removed – cavity normal', session: 'Afternoon' },
  { date: '09/03/2026', patientName: 'Arjun Patel', procedure: 'TESA', doctor: 'Dr. Suresh Babu', amount: 22000, remarks: 'Adequate sperm retrieved – frozen', session: 'Morning' },
];

// Consultation Report: Sl No, Date, Patient Name, Doctor, Consultation Type, Fee, Remarks
const consultationData = [
  { date: '12/03/2026', patientName: 'Rajesh Kumar', doctor: 'Dr. Anil Kapoor', consultationType: 'General Checkup', fee: 800, remarks: 'BP normal – weight management advised', session: 'Morning' },
  { date: '12/03/2026', patientName: 'Priya Nair', doctor: 'Dr. Anil Kapoor', consultationType: 'Prenatal Care', fee: 1200, remarks: 'Week 28 – iron supplements prescribed', session: 'Afternoon' },
  { date: '11/03/2026', patientName: 'Vikram Singh', doctor: 'Dr. Rekha Nair', consultationType: 'Follow-up', fee: 600, remarks: 'Post surgery recovery – satisfactory', session: 'Morning' },
  { date: '10/03/2026', patientName: 'Arjun Patel', doctor: 'Dr. Priya Sharma', consultationType: 'IVF Planning', fee: 2000, remarks: 'Second cycle – modified protocol', session: 'Afternoon' },
  { date: '10/03/2026', patientName: 'Aisha Mehta', doctor: 'Dr. Priya Sharma', consultationType: 'Fertility Consultation', fee: 1500, remarks: 'Stimulation day 8 – follicles growing', session: 'Morning' },
  { date: '09/03/2026', patientName: 'Deepa Pillai', doctor: 'Dr. Priya Sharma', consultationType: 'IUI Counseling', fee: 1000, remarks: 'Third IUI cycle – husband briefed', session: 'Afternoon' },
];

// Injection Report: Sl No, Date, Patient Name, Injection Type, Doctor, Amount, Remarks
const injectionData = [
  { date: '12/03/2026', patientName: 'Aisha Mehta', injectionType: 'HCG 5000 IU', doctor: 'Dr. Priya Sharma', amount: 2500, remarks: 'Trigger shot given – OPU in 36 hrs', session: 'Morning' },
  { date: '12/03/2026', patientName: 'Kavitha Rao', injectionType: 'FSH 150 IU', doctor: 'Dr. Priya Sharma', amount: 1800, remarks: 'Day 7 stimulation – responding well', session: 'Morning' },
  { date: '11/03/2026', patientName: 'Deepa Pillai', injectionType: 'Progesterone IM', doctor: 'Dr. Priya Sharma', amount: 800, remarks: 'Luteal support – post IUI day 3', session: 'Afternoon' },
  { date: '10/03/2026', patientName: 'Mohammed Ali', injectionType: 'GnRH Antagonist', doctor: 'Dr. Priya Sharma', amount: 3200, remarks: 'Cetrotide – blocking premature LH surge', session: 'Morning' },
  { date: '10/03/2026', patientName: 'Sunita Verma', injectionType: 'Decapeptyl 3.75mg', doctor: 'Dr. Anil Kapoor', amount: 4500, remarks: 'Endometriosis management protocol', session: 'Morning' },
  { date: '09/03/2026', patientName: 'Priya Nair', injectionType: 'Anti-D Immunoglobulin', doctor: 'Dr. Anil Kapoor', amount: 1200, remarks: 'Rh-negative – prophylactic dose given', session: 'Afternoon' },
];

// Column definitions per report type (matching LCNC spec exactly)
type ReportKey = 'pharmacy' | 'scan' | 'procedure' | 'consultation' | 'injection';

const reportColumnsMap: Record<ReportKey, { key: string; label: string; highlight?: boolean }[]> = {
  pharmacy: [
    { key: 'date', label: 'Date' },
    { key: 'patientName', label: 'Patient Name', highlight: true },
    { key: 'pharmacy', label: 'Pharmacy' },
    { key: 'pharmacyAmount', label: 'Pharmacy Amount', highlight: true },
    { key: 'remarks', label: 'Remarks' },
  ],
  scan: [
    { key: 'date', label: 'Date' },
    { key: 'patientName', label: 'Patient Name', highlight: true },
    { key: 'scanType', label: 'Scan Type' },
    { key: 'doctor', label: 'Doctor' },
    { key: 'amount', label: 'Amount', highlight: true },
    { key: 'remarks', label: 'Remarks' },
  ],
  procedure: [
    { key: 'date', label: 'Date' },
    { key: 'patientName', label: 'Patient Name', highlight: true },
    { key: 'procedure', label: 'Procedure' },
    { key: 'doctor', label: 'Doctor' },
    { key: 'amount', label: 'Amount', highlight: true },
    { key: 'remarks', label: 'Remarks' },
  ],
  consultation: [
    { key: 'date', label: 'Date' },
    { key: 'patientName', label: 'Patient Name', highlight: true },
    { key: 'doctor', label: 'Doctor' },
    { key: 'consultationType', label: 'Consultation Type' },
    { key: 'fee', label: 'Fee', highlight: true },
    { key: 'remarks', label: 'Remarks' },
  ],
  injection: [
    { key: 'date', label: 'Date' },
    { key: 'patientName', label: 'Patient Name', highlight: true },
    { key: 'injectionType', label: 'Injection Type' },
    { key: 'doctor', label: 'Doctor' },
    { key: 'amount', label: 'Amount', highlight: true },
    { key: 'remarks', label: 'Remarks' },
  ],
};

const reportDataMap: Record<ReportKey, any[]> = {
  pharmacy: pharmacyData,
  scan: scanData,
  procedure: procedureData,
  consultation: consultationData,
  injection: injectionData,
};

const sessionOptions = ['All Sessions', 'Morning', 'Afternoon', 'Evening'];

export function Reports() {
  const [activeReport, setActiveReport] = useState<ReportKey>('pharmacy');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('2026-03-09');
  const [dateTo, setDateTo] = useState('2026-03-13');
  const [session, setSession] = useState('All Sessions');

  const data = reportDataMap[activeReport] || [];
  const columns = reportColumnsMap[activeReport] || [];

  const filteredData = data.filter((row: any) => {
    const matchesSearch = Object.values(row).some((val: any) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    );
    const matchesSession = session === 'All Sessions' || row.session === session;
    return matchesSearch && matchesSession;
  });

  const amountKey = columns.find(c => c.highlight && (c.key === 'amount' || c.key === 'pharmacyAmount' || c.key === 'fee'));
  const totalAmount = filteredData.reduce((sum: number, row: any) =>
    sum + (amountKey ? Number(row[amountKey.key] || 0) : 0), 0
  );

  const activeConfig = reportTypes.find(r => r.key === activeReport)!;

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1F2A5A' }}>Reports</h1>
          <p className="text-sm flex items-center gap-1" style={{ color: '#6B7280' }}>
            <span style={{ color: '#9CA3AF' }}>Dashboard</span>
            <ChevronRight size={12} style={{ color: '#9CA3AF' }} />
            <span>Reports</span>
            <ChevronRight size={12} style={{ color: '#9CA3AF' }} />
            <span style={{ color: '#1F2A5A' }}>{activeConfig.label}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-80 transition-all"
            style={{ background: '#F4F7FB', color: '#6B7280', border: '1.5px solid #E5E7EB' }}>
            <Printer size={15} /> Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all"
            style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)', boxShadow: '0 4px 12px rgba(60,192,208,0.3)' }}>
            <Download size={15} /> Download PDF
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex gap-2.5 mb-4 flex-wrap">
        {reportTypes.map(rt => {
          const Icon = rt.icon;
          const isActive = activeReport === rt.key;
          return (
            <button key={rt.key} onClick={() => { setActiveReport(rt.key as ReportKey); setSearch(''); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: isActive ? rt.color : 'white',
                color: isActive ? 'white' : '#6B7280',
                boxShadow: isActive ? `0 4px 15px ${rt.color}40` : '0 2px 8px rgba(0,0,0,0.05)',
                border: isActive ? 'none' : '1.5px solid #E5E7EB',
              }}>
              <Icon size={15} />
              {rt.label}
            </button>
          );
        })}
      </div>

      {/* Entry & Filter Form Section */}
      <div className="bg-white rounded-2xl p-5 mb-4" style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
        <p className="text-xs font-semibold mb-3" style={{ color: '#6B7280' }}>FILTER & SEARCH</p>
        <div className="flex flex-wrap gap-3 items-end">
          {/* Search */}
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#374151' }}>Search Patient</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
              <input type="text" placeholder="Search by patient, doctor..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: '#F4F7FB', border: '1.5px solid #E5E7EB', color: '#374151', fontFamily: 'Poppins' }} />
            </div>
          </div>

          {/* Session dropdown */}
          <div className="min-w-36">
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#374151' }}>Session</label>
            <select value={session} onChange={e => setSession(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: '#F4F7FB', border: '1.5px solid #E5E7EB', color: '#374151', fontFamily: 'Poppins' }}>
              {sessionOptions.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#374151' }}>Start Date</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm outline-none"
              style={{ border: '1.5px solid #E5E7EB', background: '#F4F7FB', fontFamily: 'Poppins', color: '#374151' }} />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#374151' }}>End Date</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm outline-none"
              style={{ border: '1.5px solid #E5E7EB', background: '#F4F7FB', fontFamily: 'Poppins', color: '#374151' }} />
          </div>

          {/* Apply filter button */}
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #1F2A5A, #3CC0D0)' }}>
            <Filter size={13} /> Apply Filter
          </button>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
        {/* Report Title Banner */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ background: `${activeConfig.color}10`, borderBottom: `2px solid ${activeConfig.color}25` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${activeConfig.color}20` }}>
              <activeConfig.icon size={18} style={{ color: activeConfig.color }} />
            </div>
            <div>
              <h3 className="font-bold" style={{ color: '#1F2A5A' }}>{activeConfig.label}</h3>
              <p className="text-xs" style={{ color: '#6B7280' }}>Period: {dateFrom} to {dateTo}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: '#6B7280' }}>Total Amount</p>
            <p className="text-xl font-bold" style={{ color: activeConfig.color }}>
              ₹{totalAmount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F8F9FB' }}>
                <th className="text-left px-5 py-3.5 text-xs font-semibold" style={{ color: '#6B7280' }}>Sl No</th>
                {columns.map(col => (
                  <th key={col.key} className="text-left px-5 py-3.5 text-xs font-semibold" style={{ color: '#6B7280' }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-5 py-12 text-center text-sm" style={{ color: '#9CA3AF' }}>
                    No records found for the selected filters.
                  </td>
                </tr>
              ) : (
                filteredData.map((row: any, i: number) => (
                  <tr key={i} className="border-t hover:bg-blue-50/20 transition-colors cursor-pointer"
                    style={{ borderColor: '#F3F4F6' }}>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold px-2 py-1 rounded-md" style={{ background: '#F4F7FB', color: '#6B7280' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </td>
                    {columns.map((col) => (
                      <td key={col.key} className="px-5 py-3.5">
                        {col.key === 'pharmacyAmount' || col.key === 'amount' || col.key === 'fee' ? (
                          <span className="font-semibold text-sm" style={{ color: activeConfig.color }}>
                            ₹{Number(row[col.key]).toLocaleString()}
                          </span>
                        ) : col.key === 'patientName' ? (
                          <span className="text-sm font-semibold" style={{ color: '#1F2A5A' }}>{row[col.key]}</span>
                        ) : col.key === 'remarks' ? (
                          <span className="text-xs" style={{ color: '#6B7280', maxWidth: '200px', display: 'inline-block' }}>{row[col.key]}</span>
                        ) : col.key === 'date' ? (
                          <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: '#F4F7FB', color: '#374151' }}>{row[col.key]}</span>
                        ) : (
                          <span className="text-sm" style={{ color: '#374151' }}>{row[col.key]}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Total Summary */}
        <div className="px-5 py-4" style={{ background: `${activeConfig.color}08`, borderTop: `2px solid ${activeConfig.color}20` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold" style={{ color: '#1F2A5A' }}>
                Total Records: <span style={{ color: activeConfig.color }}>{filteredData.length}</span>
              </span>
              <span className="text-sm font-semibold" style={{ color: '#1F2A5A' }}>
                Showing: {filteredData.length} / {data.length} entries
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs" style={{ color: '#6B7280' }}>Total Amount: </span>
              <span className="text-lg font-bold" style={{ color: activeConfig.color }}>
                ₹{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 flex items-center justify-between" style={{ background: '#F8F9FB', borderTop: '1px solid #E5E7EB' }}>
          <div className="text-xs" style={{ color: '#9CA3AF' }}>
            Generated on: March 13, 2026 · ACUTIX Hospital Management System
          </div>
          <div className="text-xs font-medium" style={{ color: '#6B7280' }}>
            Authorized by: Dr. Riya Desai (Administrator)
          </div>
        </div>
      </div>
    </div>
  );
}
