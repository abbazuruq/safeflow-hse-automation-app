
import React, { useState, useMemo } from 'react';
import { Incident, UserRole, Severity, IncidentCategory, ActionStatus } from '../types';
import { useAuth } from '../App';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

interface ReportsProps {
  incidents: Incident[];
}

const Reports: React.FC<ReportsProps> = ({ incidents }) => {
  const { user } = useAuth();
  const isComplianceOfficer = user?.role === UserRole.COMPLIANCE_OFFICER;

  // --- State for Filters ---
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [regulation, setRegulation] = useState('NUPRC - PIA 2021');
  const [selectedLocation, setSelectedLocation] = useState('All Sites');

  // --- Export Logic ---
  const exportToExcel = () => {
    let headers: string[] = [];
    let rows: any[][] = [];
    let fileName = '';

    if (isComplianceOfficer) {
      headers = ['Reg_ID', 'Regulatory_Ref', 'Category', 'Severity', 'Filing_Status', 'Evidence_Count', 'Date', 'Location'];
      rows = incidents.map(i => [
        i.id,
        regulation,
        i.category,
        i.severity,
        i.status === 'Resolved' ? 'Filed' : 'Pending',
        i.evidenceUrls.length,
        new Date(i.timestamp).toLocaleDateString(),
        `"${i.location.address || 'Unknown'}"`
      ]);
      fileName = `SafeFlow_Statutory_Log_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      headers = ['ID', 'Title', 'Category', 'Severity', 'Status', 'Date', 'Location'];
      rows = incidents.map(i => [
        i.id,
        `"${i.title.replace(/"/g, '""')}"`,
        i.category,
        i.severity,
        i.status,
        new Date(i.timestamp).toLocaleDateString(),
        `"${i.location.address || 'Unknown'}"`
      ]);
      fileName = `SafeFlow_Operational_Report_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = (format: 'PDF' | 'EXCEL') => {
    if (format === 'PDF') {
      window.print();
    } else {
      exportToExcel();
    }
  };

  // --- Data Calculations ---
  const stats = useMemo(() => {
    const total = incidents.length;
    const critical = incidents.filter(i => i.severity === Severity.CRITICAL).length;
    const resolved = incidents.filter(i => i.status === 'Resolved').length;
    const withEvidence = incidents.filter(i => i.evidenceUrls.length > 0).length;
    
    return { 
      total, 
      critical, 
      resolved, 
      complianceRate: total > 0 ? Math.round((resolved / total) * 100) : 100,
      evidenceRate: total > 0 ? Math.round((withEvidence / total) * 100) : 100
    };
  }, [incidents]);

  const COLORS = ['#1565C0', '#F57C00', '#FBC02D', '#D32F2F'];

  // --- Render Compliance Officer View ---
  if (isComplianceOfficer) {
    return (
      <div className="space-y-8 animate-fadeIn pb-20">
        {/* Regulatory Header */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-6 no-print">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Statutory Reporting Hub</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Regulatory traceability, evidence logs, and audit readiness.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2">
              <select 
                value={regulation}
                onChange={(e) => setRegulation(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>NUPRC - PIA 2021</option>
                <option>NMDPRA - Health & Safety</option>
                <option>DPR - Environmental</option>
              </select>
              
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Current Quarter</option>
                <option>Previous Quarter</option>
                <option>Annual Filing 2024</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
              <button 
                onClick={() => handleExport('PDF')} 
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 shadow-sm"
              >
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                <span>Statutory PDF</span>
              </button>
              <button 
                onClick={() => handleExport('EXCEL')} 
                className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 shadow-lg shadow-green-900/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span>Filing Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Compliance KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Filing Accuracy', value: '100%', sub: 'No Rejected Submissions', color: 'text-green-600', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Evidence Coverage', value: `${stats.evidenceRate}%`, sub: 'Traceable Records', color: 'text-blue-600', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
            { label: 'Non-Compliance Alerts', value: stats.total - stats.resolved, sub: 'Items Awaiting Filing', color: 'text-red-600', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
            { label: 'Correction SLA', value: '94.2%', sub: 'Deadline Adherence', color: 'text-orange-600', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          ].map((kpi, i) => (
            <div key={i} className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                 <div className={`p-3 rounded-2xl bg-slate-50 ${kpi.color}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={kpi.icon} /></svg>
                 </div>
                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{kpi.sub}</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
              <p className={`text-3xl font-black ${kpi.color} tracking-tighter mt-1`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Regulatory Incident Log Table */}
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Statutory Incident Log</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Traceable for {regulation}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Defensible</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-8 py-4">Reg Ref ID</th>
                  <th className="px-8 py-4">Filing Category</th>
                  <th className="px-8 py-4">Severity</th>
                  <th className="px-8 py-4">Evidence</th>
                  <th className="px-8 py-4">Date Reported</th>
                  <th className="px-8 py-4">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incidents.map(incident => (
                  <tr key={incident.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5 text-xs font-black text-slate-900 tracking-tighter">{incident.id}</td>
                    <td className="px-8 py-5 text-xs text-slate-600 font-bold uppercase">{incident.category}</td>
                    <td className="px-8 py-5">
                      <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-black uppercase border tracking-widest ${
                        incident.severity === Severity.CRITICAL ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-1">
                        <svg className={`w-4 h-4 ${incident.evidenceUrls.length > 0 ? 'text-blue-500' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="text-[10px] font-black text-slate-400 uppercase">{incident.evidenceUrls.length} Files</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(incident.timestamp).toLocaleDateString()}</td>
                    <td className="px-8 py-5">
                      <span className={`flex items-center text-[10px] font-black uppercase tracking-widest ${incident.status === 'Resolved' ? 'text-[#2E7D32]' : 'text-orange-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${incident.status === 'Resolved' ? 'bg-[#2E7D32]' : 'bg-orange-500 animate-pulse'}`}></div>
                        {incident.status === 'Resolved' ? 'Filed & Closed' : 'Investigation Open'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Evidence Traceability Hub */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
           <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Evidence Traceability Hub</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incidents.slice(0, 8).map((i, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                   <div className="flex items-center space-x-4">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${i.evidenceUrls.length > 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-50 text-red-400'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 21a9.963 9.963 0 006.49-2.385M7.5 7.5l-.013.013M10.5 10.5l-.013.013m4.545 4.547l-.013.013m1.44-4.038l-.013.013M14.903 8.605l1.562-1.562M15.457 15.141l-1.561 1.562M14.903 15.141l1.562 1.562M15.457 8.605l-1.561-1.562" /></svg>
                     </div>
                     <div>
                       <p className="text-xs font-black text-slate-800 tracking-tight">{i.id}</p>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{i.category} • Proof Verification</p>
                     </div>
                   </div>
                   <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Audit Proof &rarr;</button>
                </div>
              ))}
           </div>
           {incidents.length === 0 && (
              <div className="py-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest italic">
                No traceable evidence logs available for this period.
              </div>
           )}
        </div>
      </div>
    );
  }

  // --- Render HSE Manager (Operational) View ---
  const severityData = useMemo(() => {
    const counts = {
      [Severity.LOW]: incidents.filter(i => i.severity === Severity.LOW).length,
      [Severity.MEDIUM]: incidents.filter(i => i.severity === Severity.MEDIUM).length,
      [Severity.HIGH]: incidents.filter(i => i.severity === Severity.HIGH).length,
      [Severity.CRITICAL]: incidents.filter(i => i.severity === Severity.CRITICAL).length,
    };
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [incidents]);

  const locationRiskData = useMemo(() => {
    const locations: Record<string, number> = {};
    incidents.forEach(i => {
      const loc = i.location.address || 'Unknown';
      locations[loc] = (locations[loc] || 0) + 1;
    });
    return Object.entries(locations)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [incidents]);

  const trendData = useMemo(() => {
    return [
      { week: 'W1', incidents: 4, compliance: 92 },
      { week: 'W2', incidents: 2, compliance: 95 },
      { week: 'W3', incidents: 7, compliance: 88 },
      { week: 'W4', incidents: 3, compliance: 94 },
      { week: 'W5', incidents: 5, compliance: 91 },
      { week: 'W6', incidents: 2, compliance: 98 },
    ];
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      {/* Operational Header */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-6 no-print">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Operational Insights</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Real-time performance metrics and safety trend analysis.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Quarter to Date</option>
              <option>Year to Date</option>
            </select>
            
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All Sites</option>
              <option>Port Harcourt Terminal</option>
              <option>Lagos Offshore</option>
              <option>Warri Refinery</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
            <button 
              onClick={() => handleExport('PDF')} 
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 shadow-sm"
            >
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              <span>Export PDF</span>
            </button>
            <button 
              onClick={() => handleExport('EXCEL')} 
              className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 shadow-lg shadow-green-900/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <span>Export Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Row (Manager) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Incidents', value: stats.total, sub: 'This Period', color: 'text-blue-600', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'LTI-Free Days', value: '124', sub: 'Current Streak', color: 'text-green-600', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Critical Risks', value: stats.critical, sub: 'Active Investigation', color: 'text-red-600', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
          { label: 'Compliance Index', value: '94.2%', sub: 'Target: 98%', color: 'text-orange-600', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-200 group hover:border-blue-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
               <div className={`p-3 rounded-2xl bg-slate-50 ${kpi.color} group-hover:scale-110 transition-transform`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={kpi.icon} /></svg>
               </div>
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{kpi.sub}</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
            <p className={`text-3xl font-black ${kpi.color} tracking-tighter mt-1`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Incident Frequency Trend</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1565C0" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1565C0" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="incidents" stroke="#1565C0" strokeWidth={3} fillOpacity={1} fill="url(#colorIncidents)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Severity Matrix</h3>
          </div>
          <div className="h-72 flex flex-col sm:flex-row items-center">
            <div className="flex-1 w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={severityData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value">
                    {severityData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3 px-4 w-full">
              {severityData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 group hover:bg-slate-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{d.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
