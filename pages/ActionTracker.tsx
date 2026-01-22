
import React from 'react';
import { CorrectiveAction, ActionStatus, Severity, UserRole } from '../types';
import { useAuth } from '../App';
import { SEVERITY_COLORS } from '../constants';

interface ActionTrackerProps {
  actions: CorrectiveAction[];
  setActions: React.Dispatch<React.SetStateAction<CorrectiveAction[]>>;
}

const ActionTracker: React.FC<ActionTrackerProps> = ({ actions, setActions }) => {
  const { user } = useAuth();

  const canReassign = user?.role === UserRole.HSE_SUPERVISOR || user?.role === UserRole.HSE_MANAGER;
  
  const updateStatus = (id: string, newStatus: ActionStatus) => {
    if (user?.role === UserRole.FIELD_WORKER && newStatus === ActionStatus.COMPLETED) {
      alert("Evidence upload required for closure. Status updated to 'Awaiting Verification'.");
    }
    setActions(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Corrective Actions</h1>
          <p className="text-slate-500 text-sm">
            {user?.role === UserRole.FIELD_WORKER ? "Tasks assigned to your site." : "Track and verify remediation activities."}
          </p>
        </div>
        {canReassign && (
          <button className="bg-[#1565C0] hover:bg-[#0D47A1] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-[#1565C0]/20 transition-all uppercase tracking-widest">
            New Task Assignment
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['Open', 'In Progress', 'Completed'] as ActionStatus[]).map(status => (
          <div key={status} className="space-y-4">
            <h3 className="font-black text-slate-400 uppercase text-[10px] px-2 tracking-[0.2em]">{status}</h3>
            <div className="space-y-3">
              {actions.filter(a => a.status === status).map(action => (
                <div key={action.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-[#1565C0]/50 transition-all hover:shadow-md">
                  <div className="flex justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-300">{action.id}</span>
                    <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-bold uppercase border ${SEVERITY_COLORS[action.priority]}`}>
                      {action.priority}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">{action.title}</h4>
                  <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-tighter">Assigned: {action.assignedTo}</p>
                  
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Due: {action.deadline}</span>
                    <select 
                      className={`bg-slate-50 border-none text-[10px] font-black uppercase rounded-lg px-2.5 py-1.5 outline-none cursor-pointer transition-colors ${action.status === ActionStatus.COMPLETED ? 'text-[#2E7D32]' : 'text-[#1565C0]'}`}
                      value={action.status}
                      onChange={(e) => updateStatus(action.id, e.target.value as ActionStatus)}
                      disabled={user?.role === UserRole.FIELD_WORKER && action.status === ActionStatus.COMPLETED}
                    >
                      <option value={ActionStatus.OPEN}>Open</option>
                      <option value={ActionStatus.IN_PROGRESS}>In Progress</option>
                      <option value={ActionStatus.COMPLETED}>Completed</option>
                    </select>
                  </div>
                </div>
              ))}
              {actions.filter(a => a.status === status).length === 0 && (
                <div className="py-12 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-2xl">
                  No Actions
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionTracker;
