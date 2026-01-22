
import React, { useState, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { User, UserRole, Incident, CorrectiveAction, Severity, IncidentCategory, ActionStatus } from './types';
import { NAVIGATION_LINKS } from './constants';
import Dashboard from './pages/Dashboard';
import IncidentManager from './pages/IncidentManager';
import ActionTracker from './pages/ActionTracker';
import AuditManager from './pages/AuditManager';
import Reports from './pages/Reports';
import MyReports from './pages/MyReports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import AiAssistant from './components/AiAssistant';

// --- Context ---
interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  notifications: string[];
  addNotification: (message: string) => void;
  clearNotifications: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// --- Mock Data ---
const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'INC-2024-001',
    title: 'Gas leakage near Compressor A',
    description: 'Minor gas leak detected during routine inspection of the primary compressor unit. No ignition occurred.',
    category: IncidentCategory.GAS_LEAK,
    severity: Severity.HIGH,
    reporterId: 'USR-001',
    reporterName: 'John Doe',
    timestamp: '2024-11-20T08:30:00Z',
    location: { lat: 6.5244, lng: 3.3792, address: 'Port Harcourt Terminal' },
    evidenceUrls: ['https://picsum.photos/400/300'],
    status: 'Under Investigation'
  },
  {
    id: 'INC-2024-002',
    title: 'Near miss - Loose scaffolding',
    description: 'Loose scaffolding plank spotted on Level 3 of the storage tank. Area cordoned off immediately.',
    category: IncidentCategory.NEAR_MISS,
    severity: Severity.MEDIUM,
    reporterId: 'USR-999',
    reporterName: 'Efe Okoro',
    timestamp: '2024-11-22T14:15:00Z',
    location: { lat: 6.5244, lng: 3.3792, address: 'Lagos Offshore' },
    evidenceUrls: [],
    status: 'Reported'
  }
];

const MOCK_ACTIONS: CorrectiveAction[] = [
  {
    id: 'ACT-001',
    incidentId: 'INC-2024-001',
    title: 'Replace seal on Compressor A',
    assignedTo: 'Maintenance Team B',
    deadline: '2024-11-25',
    priority: Severity.HIGH,
    status: ActionStatus.IN_PROGRESS
  }
];

// --- Layout ---
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return <>{children}</>;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Sidebar - Web */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white shrink-0">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-[#1565C0] rounded-lg flex items-center justify-center font-bold text-white italic">SF</div>
          <span className="text-xl font-bold tracking-tight text-white">SafeFlow</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
          {NAVIGATION_LINKS.map(link => {
            if (link.roles.length > 0 && !link.roles.includes(user.role)) return null;
            const isActive = location.pathname === link.path;
            
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  isActive ? 'bg-[#1565C0] text-white shadow-lg shadow-[#1565C0]/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="px-4 py-3 bg-slate-800 rounded-lg mb-4">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-slate-400 font-black uppercase tracking-tighter">{user.role}</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full text-left px-4 py-2 text-slate-400 hover:text-white transition-colors flex items-center space-x-2 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#1565C0] rounded-lg flex items-center justify-center font-bold italic">SF</div>
            <span className="font-bold">SafeFlow</span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{user.role}</div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
          {/* AI Assistant available for all roles */}
          <AiAssistant />
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden bg-white border-t border-slate-200 flex items-center justify-around py-2 shadow-inner">
          {NAVIGATION_LINKS.map(link => {
             if (link.roles.length > 0 && !link.roles.includes(user.role)) return null;
             
             return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center p-2 min-w-[64px] ${location.pathname === link.path ? 'text-[#1565C0]' : 'text-slate-500'}`}
              >
                <div className={`w-1 h-1 rounded-full mb-1 ${location.pathname === link.path ? 'bg-[#1565C0]' : 'bg-transparent'}`}></div>
                <span className="text-[10px] font-bold uppercase tracking-tight">{link.name}</span>
              </Link>
             );
          })}
        </nav>
      </main>
    </div>
  );
};

// --- App Root ---
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [actions, setActions] = useState<CorrectiveAction[]>(MOCK_ACTIONS);
  const [notifications, setNotifications] = useState<string[]>([]);

  const login = (role: UserRole) => {
    setUser({
      id: role === UserRole.FIELD_WORKER ? 'USR-999' : 'USR-001',
      name: role === UserRole.FIELD_WORKER ? 'Efe Okoro' : 'Manager Tunde',
      email: 'user@safeflow.com',
      role
    });
  };

  const logout = () => {
    setUser(null);
    setNotifications([]);
  };

  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, notifications, addNotification, clearNotifications }}>
      <HashRouter>
        <Layout>
          <Routes>
            {!user ? (
              <Route path="*" element={<Login />} />
            ) : (
              <>
                <Route path="/" element={<Dashboard incidents={incidents} actions={actions} />} />
                <Route path="/incidents" element={<IncidentManager incidents={incidents} setIncidents={setIncidents} actions={actions} setActions={setActions} />} />
                <Route path="/my-reports" element={<MyReports incidents={incidents} />} />
                <Route path="/actions" element={<ActionTracker actions={actions} setActions={setActions} />} />
                <Route path="/audits" element={<AuditManager />} />
                <Route path="/reports" element={<Reports incidents={incidents} />} />
                <Route path="/settings" element={<Settings />} />
              </>
            )}
          </Routes>
        </Layout>
      </HashRouter>
    </AuthContext.Provider>
  );
};

export default App;
