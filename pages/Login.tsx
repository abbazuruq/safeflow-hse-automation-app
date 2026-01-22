
import React, { useState } from 'react';
import { useAuth } from '../App';
import { UserRole } from '../types';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.FIELD_WORKER);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%">
          <pattern id="pattern-hex" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M20 0L37.3205 10V30L20 40L2.67949 30V10L20 0Z" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#pattern-hex)" />
        </svg>
      </div>

      <div className="max-w-md w-full z-10">
        {/* Login Card */}
        <div className="bg-white rounded-[8px] shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8">
            {/* Logo & Branding */}
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-10 h-10 bg-[#1565C0] rounded-lg flex items-center justify-center shadow-lg shadow-[#1565C0]/20">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-[#1565C0] tracking-tight">HSE SafeFlow</h1>
              </div>
              <p className="text-slate-600 text-center text-sm font-medium leading-relaxed px-4">
                Safety Simplified. Compliance Automated.
                <br />
                <span className="text-slate-400 font-normal">Your secure gateway to effortless HSE management.</span>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" /></svg>
                  </span>
                  <input 
                    type="email" 
                    required
                    placeholder="engineer@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-[#1565C0] transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-[#1565C0] transition-all outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#1565C0] transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Demo Role Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Access Role</label>
                <select 
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-lg text-sm text-[#1565C0] font-semibold focus:ring-2 focus:ring-[#1565C0] outline-none cursor-pointer"
                >
                  {Object.values(UserRole).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between py-1">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1565C0] focus:ring-[#1565C0] border-slate-300 transition-all" 
                  />
                  <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
                </label>
                <button type="button" className="text-xs font-semibold text-[#1565C0] hover:text-[#0D47A1] transition-colors">Forgot Password?</button>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold py-3 rounded-lg shadow-lg shadow-[#1565C0]/20 transform active:scale-[0.98] transition-all duration-200"
              >
                Sign In
              </button>
            </form>
          </div>

          <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#2E7D32]"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Systems Online & Secure</span>
          </div>
        </div>

        <footer className="mt-8 text-center text-[10px] font-medium text-slate-400 uppercase tracking-widest space-x-4">
          <span>&copy; 2026 HSE SafeFlow Nigeria</span>
          <span className="hover:text-slate-600 cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-slate-600 cursor-pointer transition-colors">Privacy Policy</span>
        </footer>
      </div>
    </div>
  );
};

export default Login;
