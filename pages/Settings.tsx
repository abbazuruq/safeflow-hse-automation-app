
import React, { useState } from 'react';
import { useAuth } from '../App';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    criticalOnly: true,
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Manage your profile and notification preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Profile</h3>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#1565C0]">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h4 className="font-black text-slate-900 text-lg leading-tight">{user?.name}</h4>
            <p className="text-xs font-bold text-[#1565C0] uppercase tracking-widest mt-1">{user?.role}</p>
            <p className="text-xs text-slate-400 mt-4 truncate">{user?.email}</p>
            <button className="mt-6 w-full py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 transition-colors">Edit Photo</button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Notification Channels</h3>
              <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Active</span>
            </div>
            <div className="p-6 space-y-6">
              {[
                { key: 'email', label: 'Email Alerts', desc: 'Receive detailed reports via company email' },
                { key: 'sms', label: 'SMS Alerts', desc: 'Critical incident notifications on your mobile' },
                { key: 'push', label: 'Web Push', desc: 'Real-time browser notifications for assigned actions' },
                { key: 'criticalOnly', label: 'High Severity Only', desc: 'Silence low and medium risk notifications' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between group">
                  <div>
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tighter leading-none mb-1">{item.label}</p>
                    <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                  </div>
                  <button 
                    onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifications] }))}
                    className={`w-12 h-6 rounded-full transition-all flex items-center p-1 ${notifications[item.key as keyof typeof notifications] ? 'bg-[#1565C0]' : 'bg-slate-200'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Security & Session</h3>
            </div>
            <div className="p-6">
              <button className="w-full py-4 px-6 border-2 border-slate-100 rounded-2xl text-left hover:border-[#1565C0]/30 hover:bg-blue-50/30 transition-all group mb-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">Reset Security PIN</p>
                     <p className="text-xs text-slate-400 font-medium">Used for quick report authorization</p>
                   </div>
                   <svg className="w-4 h-4 text-slate-300 group-hover:text-[#1565C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                 </div>
              </button>
              <div className="flex items-center justify-between pt-2 px-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Login: {new Date().toLocaleTimeString()}</p>
                <button className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Revoke Other Sessions</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
