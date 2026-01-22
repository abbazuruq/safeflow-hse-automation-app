
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Incident, IncidentCategory, Severity, UserRole, CorrectiveAction, ActionStatus } from '../types';
import { useAuth } from '../App';
import { getSafetyRecommendations } from '../services/gemini';
import { SEVERITY_COLORS } from '../constants';

interface IncidentManagerProps {
  incidents: Incident[];
  setIncidents: React.Dispatch<React.SetStateAction<Incident[]>>;
  actions: CorrectiveAction[];
  setActions: React.Dispatch<React.SetStateAction<CorrectiveAction[]>>;
}

const IncidentManager: React.FC<IncidentManagerProps> = ({ incidents, setIncidents, actions, setActions }) => {
  const { user, addNotification } = useAuth();
  const routerLocation = useLocation();
  
  const [isReporting, setIsReporting] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Managerial Task Form State
  const [isAssigningTask, setIsAssigningTask] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    assignedTo: '',
    deadline: '',
    priority: Severity.MEDIUM
  });

  const canReport = user?.role === UserRole.FIELD_WORKER || user?.role === UserRole.HSE_SUPERVISOR;
  const canAnalyze = user?.role === UserRole.HSE_SUPERVISOR || user?.role === UserRole.HSE_MANAGER;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: IncidentCategory.NEAR_MISS,
    severity: Severity.MEDIUM,
    locationName: '',
    evidenceFiles: [] as File[],
  });

  useEffect(() => {
    if (routerLocation.state?.openForm) {
      setIsReporting(true);
      if (routerLocation.state.category) {
        setFormData(prev => ({ ...prev, category: routerLocation.state.category }));
      }
    }
  }, [routerLocation.state]);

  const generateUniqueId = (prefix: string = 'INC') => {
    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randPart = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${datePart}-${randPart}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        evidenceFiles: [...prev.evidenceFiles, ...Array.from(e.target.files!)]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      evidenceFiles: prev.evidenceFiles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newIncident: Incident = {
      id: generateUniqueId(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      severity: formData.severity,
      reporterId: user?.id || '999',
      reporterName: user?.name || 'Unknown',
      timestamp: new Date().toISOString(),
      location: { lat: 0, lng: 0, address: formData.locationName },
      evidenceUrls: formData.evidenceFiles.map(f => URL.createObjectURL(f)),
      status: 'Reported'
    };

    setIncidents([newIncident, ...incidents]);
    setIsReporting(false);
    
    addNotification(`New Incident ${newIncident.id} reported by ${user?.name} at ${formData.locationName || 'Unspecified Location'}.`);

    setFormData({ 
      title: '', 
      description: '', 
      category: IncidentCategory.NEAR_MISS, 
      severity: Severity.MEDIUM,
      locationName: '',
      evidenceFiles: []
    });
    
    alert(`Success: Incident ${newIncident.id} has been logged in the system.`);
  };

  const updateIncidentStatus = (id: string, newStatus: Incident['status']) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
    if (selectedIncident?.id === id) {
      setSelectedIncident(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const updateIncidentSeverity = (id: string, newSeverity: Severity) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, severity: newSeverity } : i));
    if (selectedIncident?.id === id) {
      setSelectedIncident(prev => prev ? { ...prev, severity: newSeverity } : null);
    }
  };

  const analyzeIncident = async (incident: Incident) => {
    if (!canAnalyze) return;
    setSelectedIncident(incident);
    setIsAnalyzing(true);
    setAiInsight(null);
    setIsAssigningTask(false);
    const result = await getSafetyRecommendations(incident);
    setAiInsight(result);
    setIsAnalyzing(false);
  };

  const handleAssignTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;

    const newAction: CorrectiveAction = {
      id: generateUniqueId('ACT'),
      incidentId: selectedIncident.id,
      title: taskData.title,
      assignedTo: taskData.assignedTo,
      deadline: taskData.deadline,
      priority: taskData.priority,
      status: ActionStatus.OPEN
    };

    setActions([newAction, ...actions]);
    setIsAssigningTask(false);
    setTaskData({ title: '', assignedTo: '', deadline: '', priority: Severity.MEDIUM });
    alert(`Task ${newAction.id} assigned to ${newAction.assignedTo}`);
  };

  const handleEscalation = () => {
    if (!selectedIncident) return;
    updateIncidentSeverity(selectedIncident.id, Severity.CRITICAL);
    addNotification(`URGENT: Incident ${selectedIncident.id} has been escalated to Critical by ${user?.name}.`);
    alert("Incident escalated to management and flagged as Critical.");
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Incident Log</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            {canAnalyze ? "Investigate and resolve operational safety risks." : "Track your safety reports and hazards."}
          </p>
        </div>
        {canReport && (
          <button
            onClick={() => setIsReporting(true)}
            className="bg-[#F57C00] hover:bg-[#E65100] text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-[#F57C00]/20 transition-all flex items-center justify-center space-x-3 active:scale-[0.98] w-full md:w-auto uppercase tracking-widest text-xs"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            <span>Report Incident</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-4">
          {incidents.filter(i => user?.role === UserRole.FIELD_WORKER ? i.reporterId === user.id : true).map(incident => (
            <div 
              key={incident.id} 
              className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-200 transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 ${selectedIncident?.id === incident.id ? 'ring-2 ring-[#1565C0] shadow-md' : ''}`}
              onClick={() => canAnalyze && analyzeIncident(incident)}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{incident.id}</span>
                    <span className={`px-2 py-0.5 rounded-[6px] text-[10px] font-black uppercase border tracking-widest ${SEVERITY_COLORS[incident.severity]}`}>
                      {incident.severity}
                    </span>
                    <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200 tracking-widest">
                      {incident.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight">{incident.title}</h3>
                  <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">{incident.description}</p>
                </div>
                <div className="sm:text-right shrink-0">
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{new Date(incident.timestamp).toLocaleDateString()}</div>
                  <div className="text-[10px] text-[#1565C0] font-black mt-2 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded inline-block">{incident.status}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {canAnalyze && (
          <div className="xl:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="bg-[#001E3C] rounded-3xl shadow-2xl overflow-hidden text-white min-h-[400px] border border-slate-800 hidden xl:block animate-slideRight">
                <div className="bg-[#1565C0] p-5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F57C00] animate-pulse"></div>
                    <h3 className="font-black text-[10px] uppercase tracking-[0.3em]">Action Hub (AI & Management)</h3>
                  </div>
                </div>
                <div className="p-6">
                  {!selectedIncident ? (
                    <div className="flex flex-col items-center justify-center text-center space-y-4 py-24 opacity-40">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      <p className="text-xs font-black uppercase tracking-widest">Select an incident to investigate</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Section: AI Analysis */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                           <span className="text-[10px] font-black text-[#1565C0] uppercase tracking-widest block">AI-Generated Strategy</span>
                           <span className="text-[9px] font-black bg-white/10 px-1.5 py-0.5 rounded">SafeFlow 3.0</span>
                        </div>
                        {isAnalyzing ? (
                          <div className="space-y-4">
                            <div className="h-2 bg-slate-800 rounded w-full animate-pulse"></div>
                            <div className="h-2 bg-slate-800 rounded w-5/6 animate-pulse"></div>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-300 leading-relaxed font-medium bg-slate-900/50 p-5 rounded-2xl border border-white/5 shadow-inner max-h-40 overflow-y-auto">
                            {aiInsight}
                          </div>
                        )}
                      </div>

                      {/* Section: Management Actions */}
                      <div className="space-y-4 pt-4 border-t border-slate-800">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Operational Controls</span>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => setIsAssigningTask(!isAssigningTask)}
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${isAssigningTask ? 'bg-blue-600 border-blue-500' : 'bg-slate-900 border-slate-800 hover:border-blue-500'}`}
                          >
                            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            <span className="text-[9px] font-black uppercase tracking-widest">Assign Task</span>
                          </button>
                          <button 
                            onClick={handleEscalation}
                            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-red-900/40 hover:border-red-500 transition-all text-red-400"
                          >
                            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <span className="text-[9px] font-black uppercase tracking-widest">Escalate</span>
                          </button>
                        </div>

                        {isAssigningTask && (
                          <form onSubmit={handleAssignTask} className="bg-slate-900/80 p-4 rounded-2xl border border-blue-500/30 animate-fadeIn space-y-3">
                             <input 
                              type="text" 
                              required
                              placeholder="Action title..."
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-blue-500 outline-none"
                              value={taskData.title}
                              onChange={e => setTaskData({...taskData, title: e.target.value})}
                             />
                             <input 
                              type="text" 
                              required
                              placeholder="Assign to..."
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-blue-500 outline-none"
                              value={taskData.assignedTo}
                              onChange={e => setTaskData({...taskData, assignedTo: e.target.value})}
                             />
                             <div className="flex gap-2">
                               <input 
                                type="date" 
                                required
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-[10px] text-white focus:border-blue-500 outline-none"
                                value={taskData.deadline}
                                onChange={e => setTaskData({...taskData, deadline: e.target.value})}
                               />
                               <button type="submit" className="bg-blue-600 px-3 py-2 rounded-lg text-[10px] font-black uppercase">Assign</button>
                             </div>
                          </form>
                        )}
                      </div>

                      {/* Section: Compliance Tuning */}
                      <div className="pt-4 border-t border-slate-800">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Compliance Adjustments</label>
                        <div className="space-y-4">
                           <div>
                              <p className="text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Re-Classify Risk</p>
                              <div className="grid grid-cols-4 gap-1">
                                {Object.values(Severity).map(sev => (
                                  <button
                                    key={sev}
                                    onClick={() => updateIncidentSeverity(selectedIncident.id, sev)}
                                    className={`py-1 rounded text-[8px] font-black uppercase transition-all ${selectedIncident.severity === sev ? 'bg-white text-slate-950 shadow-lg' : 'bg-slate-900 text-slate-500 hover:text-white'}`}
                                  >
                                    {sev}
                                  </button>
                                ))}
                              </div>
                           </div>
                           <div>
                              <p className="text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Workflow Status</p>
                              <div className="grid grid-cols-3 gap-1">
                                {(['Reported', 'Under Investigation', 'Resolved'] as Incident['status'][]).map(status => (
                                  <button
                                    key={status}
                                    onClick={() => updateIncidentStatus(selectedIncident.id, status)}
                                    className={`py-1.5 rounded text-[8px] font-black uppercase border transition-all ${
                                      selectedIncident.status === status 
                                        ? 'bg-[#1565C0] border-[#1565C0] text-white' 
                                        : 'bg-slate-900 border-slate-800 text-slate-400'
                                    }`}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isReporting && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 z-[100] overflow-y-auto">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-slideUp my-auto flex flex-col max-h-[95vh] border border-white/20">
            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">New Safety Report</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">HSE COMPLIANCE AUTOMATION</p>
              </div>
              <button onClick={() => setIsReporting(false)} className="bg-slate-200 text-slate-500 hover:bg-red-100 hover:text-red-500 p-3 rounded-full transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Event Category</label>
                  <select 
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-black text-slate-800 outline-none focus:ring-4 focus:ring-[#1565C0]/10 focus:border-[#1565C0] transition-all cursor-pointer appearance-none shadow-sm" 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as IncidentCategory})}
                  >
                    {Object.values(IncidentCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Risk Severity</label>
                  <select 
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-black text-slate-800 outline-none focus:ring-4 focus:ring-[#1565C0]/10 focus:border-[#1565C0] transition-all cursor-pointer appearance-none shadow-sm" 
                    value={formData.severity}
                    onChange={e => setFormData({...formData, severity: e.target.value as Severity})}
                  >
                    {Object.values(Severity).map(sev => <option key={sev} value={sev}>{sev}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Location / Area</label>
                <input 
                  type="text" 
                  placeholder="e.g., Compressor House A, Zone 4" 
                  required 
                  className="w-full border-2 border-slate-100 p-5 rounded-2xl text-base font-bold text-slate-800 outline-none focus:ring-4 focus:ring-[#1565C0]/10 focus:border-[#1565C0] transition-all shadow-sm" 
                  value={formData.locationName}
                  onChange={e => setFormData({...formData, locationName: e.target.value})} 
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Incident Headline</label>
                <input 
                  type="text" 
                  placeholder="Summarize the event in one sentence..." 
                  required 
                  className="w-full border-2 border-slate-100 p-5 rounded-2xl text-base font-bold text-slate-800 outline-none focus:ring-4 focus:ring-[#1565C0]/10 focus:border-[#1565C0] transition-all shadow-sm" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Manual Description</label>
                <textarea 
                  placeholder="Describe the circumstances, individuals involved, and immediate actions taken..." 
                  rows={4} 
                  required 
                  className="w-full border-2 border-slate-100 p-5 rounded-2xl text-base font-medium text-slate-800 outline-none focus:ring-4 focus:ring-[#1565C0]/10 focus:border-[#1565C0] transition-all resize-none shadow-sm" 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Supporting Evidence (Images/Video)</label>
                <div className="flex flex-wrap gap-4">
                  <label className="w-24 h-24 border-4 border-dashed border-slate-100 rounded-[28px] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-[#1565C0]/30 transition-all group shadow-sm bg-slate-50/50">
                    <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
                    <svg className="w-8 h-8 text-slate-300 group-hover:text-[#1565C0] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                    <span className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-tighter">Attach</span>
                  </label>
                  
                  {formData.evidenceFiles.map((file, idx) => (
                    <div key={idx} className="w-24 h-24 bg-white border-2 border-slate-50 rounded-[28px] flex flex-col items-center justify-center p-3 text-center relative shadow-md animate-fadeIn">
                      <button 
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-xl hover:bg-red-600 transition-colors scale-90 active:scale-75"
                      >
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                      <div className="text-[#1565C0]">
                        {file.type.startsWith('image/') ? (
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        ) : (
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        )}
                      </div>
                      <span className="text-[8px] font-black text-slate-400 mt-2 truncate w-full uppercase tracking-tighter">{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-10 border-t border-slate-100 sticky bottom-0 bg-white md:static">
                <button 
                  type="submit" 
                  className="w-full bg-[#1565C0] text-white py-6 rounded-[32px] font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-[#1565C0]/40 active:scale-[0.97] transition-all flex items-center justify-center space-x-4 group"
                >
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  <span>Submit Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentManager;
