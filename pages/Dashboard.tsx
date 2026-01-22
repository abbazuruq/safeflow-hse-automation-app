
import React, { useMemo } from 'react';
import { Incident, CorrectiveAction, Severity, ActionStatus, UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  incidents: Incident[];
  actions: CorrectiveAction[];
}

const Dashboard: React.FC<DashboardProps> = ({ incidents, actions }) => {
  const { user, notifications, clearNotifications } = useAuth();
  const navigate = useNavigate();
  const isWorker = user?.role === UserRole.FIELD_WORKER;
  const isManagement = user?.role === UserRole.HSE_SUPERVISOR || user?.role === UserRole.HSE_MANAGER;

  const incidentsLabel = isWorker ? "My Open Incidents" : "Open Incidents";
  const actionsLabel = isWorker ? "My Pending Actions" : "Pending Actions";

  // Filtered statistics
  const stats = useMemo(() => {
    const relevantIncidents = isWorker ? incidents.filter(i => i.reporterId === user?.id) : incidents;
    const openCount = relevantIncidents.filter(i => i.status !== 'Resolved').length;
    
    const relevantActions = isWorker 
      ? actions.filter(a => a.assignedTo.includes(user?.name || '') || a.assignedTo.includes('Field Team')) 
      : actions;
    const pendingActionCount = relevantActions.filter(a => a.status !== ActionStatus.COMPLETED).length;
    
    return { 
      openCount, 
      pendingActionCount, 
      recentReports: relevantIncidents.slice(0, 5) 
    };
  }, [incidents, actions, user, isWorker]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach(i => counts[i.category] = (counts[i.category] || 0) + 1);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [incidents]);

  const severityData = useMemo(() => {
    const counts: Record<string, number> = {
      [Severity.LOW]: 0,
      [Severity.MEDIUM]: 0,
      [Severity.HIGH]: 0,
      [Severity.CRITICAL]: 0,
    };
    incidents.forEach(i => counts[i.severity]++);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [incidents]);

  const PIE_COLORS = ['#1565C0', '#F57C00', '#FBC02D', '#D32F2F', '#546E7A'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Management Notifications */}
      {isManagement && notifications.length > 0 && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-3xl p-6 shadow-xl shadow-orange-900/5 animate-bounce-subtle">
          <div className="flex items-start justify-between">
            <div className="flex space-x-4">
              <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </div>
              <div>
                <h2 className="text-lg font-black text-orange-900 uppercase tracking-tight">Immediate Action Required</h2>
                <div className="mt-1 space-y-1">
                  {notifications.map((note, idx) => (
                    <p key={idx} className="text-sm font-bold text-orange-800/80">{note}</p>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => { clearNotifications(); navigate('/incidents'); }}
                className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-600/20 transition-all active:scale-95"
              >
                Review Now
              </button>
              <button 
                onClick={clearNotifications}
                className="text-orange-400 hover:text-orange-600 p-2 transition-colors"
                title="Dismiss All"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-[#001E3C] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-none">Welcome back, {user?.name}</h1>
          <p className="text-slate-400 mt-2 font-black uppercase tracking-widest text-[10px]">{user?.role} • Operational Hub</p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#1565C0]/10 to-transparent pointer-events-none"></div>
      </div>

      {/* Primary Action Buttons (Worker Only) */}
      {isWorker && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/incidents', { state: { openForm: true } })}
            className="group relative bg-[#1565C0] hover:bg-[#0D47A1] p-6 rounded-2xl shadow-lg shadow-[#1565C0]/20 transition-all flex items-center space-x-4 overflow-hidden"
          >
            <div className="bg-white/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            </div>
            <div className="text-left">
              <span className="block text-white font-black uppercase tracking-widest text-lg">Report Incident</span>
              <span className="text-blue-100/70 text-[10px] font-black uppercase tracking-tighter">Submit immediate safety event</span>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/incidents', { state: { openForm: true } })}
            className="group relative bg-[#F57C00] hover:bg-[#E65100] p-6 rounded-2xl shadow-lg shadow-[#F57C00]/20 transition-all flex items-center space-x-4 overflow-hidden"
          >
            <div className="bg-white/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div className="text-left">
              <span className="block text-white font-black uppercase tracking-widest text-lg">Report Hazard</span>
              <span className="text-orange-100/70 text-[10px] font-black uppercase tracking-tighter">Flag unsafe site conditions</span>
            </div>
          </button>
        </div>
      )}

      {/* Safety Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div 
          onClick={() => navigate(isWorker ? '/my-reports' : '/incidents')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-[#1565C0] cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99] group"
        >
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 group-hover:text-[#1565C0] transition-colors">{incidentsLabel}</p>
          <div className="flex items-end justify-between">
            <p className="text-5xl font-black text-slate-900 tracking-tighter">{stats.openCount}</p>
            <span className="text-[10px] font-black text-[#1565C0] uppercase tracking-tighter mb-1">Awaiting Review &rarr;</span>
          </div>
        </div>
        <div 
          onClick={() => navigate(isWorker ? '/settings' : '/actions')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-[#F57C00] cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99] group"
        >
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 group-hover:text-[#F57C00] transition-colors">{actionsLabel}</p>
          <div className="flex items-end justify-between">
            <p className="text-5xl font-black text-slate-900 tracking-tighter">{stats.pendingActionCount}</p>
            <span className="text-[10px] font-black text-[#F57C00] uppercase tracking-tighter mb-1">Needs Completion &rarr;</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Recent Activity Log</h3>
          <button onClick={() => navigate(isWorker ? '/my-reports' : '/incidents')} className="text-[10px] font-black text-[#1565C0] hover:underline uppercase tracking-widest">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ref ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recentReports.map(report => (
                <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-xs font-black text-slate-900 tracking-tighter">{report.id}</td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-black uppercase">{report.category}</td>
                  <td className="px-6 py-4 text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(report.timestamp).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center text-[10px] font-black uppercase tracking-tighter ${report.status === 'Resolved' ? 'text-[#2E7D32]' : 'text-[#1565C0]'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${report.status === 'Resolved' ? 'bg-[#2E7D32]' : 'bg-[#1565C0] animate-pulse'}`}></span>
                      {report.status}
                    </span>
                  </td>
                </tr>
              ))}
              {stats.recentReports.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-xs font-bold text-slate-300 uppercase tracking-widest italic">No reports found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* High-level Analytics */}
      {!isWorker && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-6">Incident Category Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '11px' }} />
                  <Bar dataKey="value" fill="#1565C0" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-6">Severity Matrix</h3>
            <div className="h-64 flex flex-col md:flex-row items-center">
              <div className="flex-1 w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 mt-4 md:mt-0 px-4">
                {severityData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }}></div>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{d.name}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
