export interface AuditLog {
  id: string;
  timestamp: Date;
  tableName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  recordId: string;
  user: {
    id: string;
    name: string;
  };
  changes?: string; // Will now contain formatted old/new values
}

export interface FilterCriteria {
  department: string;
  tableName: string;
  action: 'ALL' | 'CREATE' | 'UPDATE' | 'DELETE';
  startDate: string;
  endDate: string;
  recordId: string;
  pageSize: number;
}

export interface TableOption {
  displayName: string;
  logicalName: string;
}

// Represents the raw data from the Dynamics 'audits' entity
export interface RawAuditLog {
    auditid: string;
    createdon: string; // ISO date string
    objecttypecode: string; // Table logical name
    action: number; // 1: Create, 2: Update, 3: Delete
    _objectid_value: string;
    _userid_value: string;
    '_userid_value@OData.Community.Display.V1.FormattedValue': string; // User's full name
    changedata?: string; // Comma-separated list of changed attributes
}

export interface DynamicsAuditResponse {
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
  value: RawAuditLog[];
}

export interface FetchAuditLogsResponse {
  logs: AuditLog[];
  totalCount: number;
  nextLink: string | null;
}