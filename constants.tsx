
import { Severity, ActionStatus, UserRole } from './types';

// Brand Colors:
// Primary Blue: #1565C0
// Success Green: #2E7D32
// Warning Orange: #F57C00
// Critical Red: #D32F2F

export const SEVERITY_COLORS = {
  [Severity.LOW]: 'bg-blue-50 text-[#1565C0] border-[#1565C0]/20',
  [Severity.MEDIUM]: 'bg-orange-50 text-[#F57C00] border-[#F57C00]/20',
  [Severity.HIGH]: 'bg-orange-100 text-[#F57C00] border-[#F57C00]/30 font-bold',
  [Severity.CRITICAL]: 'bg-red-50 text-[#D32F2F] border-[#D32F2F]/30 animate-pulse font-extrabold',
};

export const STATUS_COLORS = {
  [ActionStatus.OPEN]: 'bg-slate-100 text-slate-700 border-slate-200',
  [ActionStatus.IN_PROGRESS]: 'bg-blue-50 text-[#1565C0] border-[#1565C0]/20',
  [ActionStatus.COMPLETED]: 'bg-green-50 text-[#2E7D32] border-[#2E7D32]/20',
};

export const NAVIGATION_LINKS = [
  { name: 'Dashboard', path: '/', roles: [UserRole.FIELD_WORKER, UserRole.HSE_SUPERVISOR, UserRole.HSE_MANAGER, UserRole.COMPLIANCE_OFFICER] },
  { name: 'Incidents', path: '/incidents', roles: [UserRole.HSE_SUPERVISOR, UserRole.HSE_MANAGER] },
  { name: 'My Reports', path: '/my-reports', roles: [UserRole.FIELD_WORKER] },
  { name: 'Actions', path: '/actions', roles: [UserRole.HSE_SUPERVISOR, UserRole.HSE_MANAGER] }, 
  { name: 'Reports', path: '/reports', roles: [UserRole.HSE_MANAGER, UserRole.COMPLIANCE_OFFICER] },
  { name: 'Settings', path: '/settings', roles: [] },
];
