
export enum UserRole {
  FIELD_WORKER = 'Field Worker',
  HSE_SUPERVISOR = 'HSE Supervisor',
  HSE_MANAGER = 'HSE Manager',
  COMPLIANCE_OFFICER = 'Compliance Officer'
}

export enum IncidentCategory {
  NEAR_MISS = 'Near Miss',
  INJURY = 'Injury',
  EQUIPMENT_FAILURE = 'Equipment Failure',
  GAS_LEAK = 'Gas Leak',
  ENVIRONMENTAL_SPILL = 'Environmental Spill'
}

export enum Severity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum ActionStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: Severity;
  reporterId: string;
  reporterName: string;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  evidenceUrls: string[];
  status: 'Reported' | 'Under Investigation' | 'Resolved';
}

export interface CorrectiveAction {
  id: string;
  incidentId: string;
  title: string;
  assignedTo: string;
  deadline: string;
  priority: Severity;
  status: ActionStatus;
  evidenceUrl?: string;
}
