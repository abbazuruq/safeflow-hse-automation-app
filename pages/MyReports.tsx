
import React from 'react';
import { Incident, UserRole } from '../types';
import { useAuth } from '../App';
import { SEVERITY_COLORS } from '../constants';
import { useNavigate } from 'react-router-dom';

interface MyReportsProps {
  incidents: Incident[];
}

const MyReports: React.FC<MyReportsProps> = ({ incidents }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const myIncidents = incidents.filter(i => i.reporterId === user?.id);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">My Safety Reports</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">History of your reported incidents and hazards.</p>
        </div>
        {user?.role === UserRole.FIELD_WORKER && (
          <button 
            onClick={() => navigate('/incidents', { state: { openForm: true } })}
            className="bg-[#1565C0] text-white px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-[#0D47A1] shadow-lg shadow-[#1565C0]/20 transition-all"
          >
            New Report
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Ref ID</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Date Submitted</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {myIncidents.map(incident => (
                <tr key={incident.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                  <td className="px-6 py-4 text-xs font-bold text-slate-900">{incident.id}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{incident.category}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-700 truncate max-w-xs">{incident.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${SEVERITY_COLORS[incident.severity]}`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{new Date(incident.timestamp).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center text-[10px] font-black uppercase tracking-widest ${incident.status === 'Resolved' ? 'text-green-600' : 'text-[#1565C0]'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${incident.status === 'Resolved' ? 'bg-green-500' : 'bg-[#1565C0] animate-pulse'}`}></span>
                      {incident.status}
                    </span>
                  </td>
                </tr>
              ))}
              {myIncidents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No personal reports logged</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyReports;
