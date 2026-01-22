
import React from 'react';
import { useAuth } from '../App';
import { UserRole } from '../types';

const AuditManager: React.FC = () => {
  const { user } = useAuth();
  
  const canManageTemplates = user?.role === UserRole.COMPLIANCE_OFFICER || user?.role === UserRole.HSE_MANAGER;
  const canStartAudit = user?.role === UserRole.HSE_SUPERVISOR || user?.role === UserRole.HSE_MANAGER;

  const AUDIT_TEMPLATES = [
    { title: 'Weekly Facility Safety Walk', code: 'SF-INS-001', freq: 'Weekly' },
    { title: 'Rig Operation Compliance', code: 'SF-INS-002', freq: 'Bi-Weekly' },
    { title: 'Environment Impact Assessment', code: 'SF-INS-003', freq: 'Monthly' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Audits & Inspections</h1>
          <p className="text-slate-500 text-sm italic">Digital compliance checklists</p>
        </div>
        {canStartAudit && (
          <button className="bg-[#1565C0] text-white px-6 py-2.5 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-[#0D47A1] shadow-lg shadow-[#1565C0]/20 transition-all">
            Start Inspection
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Inspection Templates</h3>
            {canManageTemplates && <button className="text-[11px] font-black text-[#F57C00] uppercase hover:underline">Edit Hub</button>}
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {AUDIT_TEMPLATES.map(template => (
              <div key={template.code} className="p-5 rounded-xl border border-slate-100 bg-slate-50 hover:border-[#1565C0] hover:bg-blue-50/30 transition-all cursor-pointer group">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{template.code}</span>
                <h4 className="font-bold text-slate-800 text-sm mt-1 group-hover:text-[#1565C0] transition-colors">{template.title}</h4>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-[9px] bg-white px-2 py-1 rounded border border-slate-200 font-bold uppercase text-slate-500">{template.freq}</span>
                  {canStartAudit && <span className="text-[#1565C0] text-[10px] font-black uppercase tracking-tighter">Initialize &rarr;</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Verification Status</h3>
          <div className="text-[11px] font-medium text-slate-400 bg-slate-50 p-6 rounded-xl border border-dashed border-slate-200 text-center uppercase tracking-widest">
            History restricted to supervisor & compliance roles
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditManager;
