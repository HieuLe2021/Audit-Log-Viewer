
import { authenticatedFetch } from './apiService';
import { AuditLog, FilterCriteria, RawAuditLog, DynamicsAuditResponse, FetchAuditLogsResponse } from '../types';

const AUDITS_API_URL_BASE = 'https://wecare-ii.crm5.dynamics.com/api/data/v9.2/audits';

const mapAction = (actionCode: number): 'CREATE' | 'UPDATE' | 'DELETE' => {
  switch (actionCode) {
    case 1: return 'CREATE';
    case 2: return 'UPDATE';
    case 3: return 'DELETE';
    default: return 'UPDATE'; // Default or handle as unknown
  }
};

const mapFilterActionToActionCode = (action: FilterCriteria['action']): number | null => {
    switch (action) {
        case 'CREATE': return 1;
        case 'UPDATE': return 2;
        case 'DELETE': return 3;
        default: return null; // Corresponds to 'ALL'
    }
};

const mapRawLogToAuditLog = (rawLog: RawAuditLog): AuditLog => {
  let changesString = 'N/A';

  // For UPDATE actions, attempt to parse and format the detailed JSON from 'changedata'.
  if (rawLog.action === 2 && rawLog.changedata) {
    try {
      // Attempt to parse the string as JSON
      const changeData = JSON.parse(rawLog.changedata);
      
      // Check if the parsed object has the expected structure
      if (changeData && Array.isArray(changeData.changedAttributes) && changeData.changedAttributes.length > 0) {
        changesString = changeData.changedAttributes.map((attr: { logicalName: string; oldValue: any; newValue: any; }) => {
          const oldVal = JSON.stringify(attr.oldValue);
          const newVal = JSON.stringify(attr.newValue);
          return `${attr.logicalName}:\n\t${oldVal} -> ${newVal}`;
        }).join('\n\n');
      } else {
         changesString = 'No detailed changes available.';
      }
    } catch (e) {
      // Fallback for when changedata is not a valid JSON object (e.g., a simple comma-separated string).
      const changedFields = rawLog.changedata.split(',').filter(f => f.trim() !== '');
      if (changedFields.length > 0) {
        changesString = "Fields changed:\n" + changedFields.map(field => `- ${field.trim()}`).join('\n');
      } else {
        changesString = 'Change detected, but no specific fields were listed.';
      }
    }
  }

  return {
    id: rawLog.auditid,
    timestamp: new Date(rawLog.createdon),
    tableName: rawLog.objecttypecode,
    action: mapAction(rawLog.action),
    recordId: rawLog._objectid_value,
    user: {
      id: rawLog._userid_value,
      name: rawLog['_userid_value@OData.Community.Display.V1.FormattedValue'],
    },
    changes: changesString,
  };
};

export const fetchAuditLogs = async (filters: FilterCriteria, nextLink: string | null): Promise<FetchAuditLogsResponse> => {
  let url: string;
  const fetchOptions: RequestInit = { method: 'GET' };

  if (nextLink) {
    // If a nextLink is provided, use it directly for the next page.
    url = nextLink;
  } else {
    // Otherwise, construct the URL for the first page.
    const filterConditions: string[] = [];

    // Date filtering
    if (filters.startDate) {
        filterConditions.push(`createdon ge ${filters.startDate}T00:00:00Z`);
    }
    if (filters.endDate) {
        filterConditions.push(`createdon le ${filters.endDate}T23:59:59Z`);
    }

    // Table Name (logical name) filtering
    if (filters.tableName) {
        filterConditions.push(`objecttypecode eq '${filters.tableName}'`);
    }

    // Action filtering
    const actionCode = mapFilterActionToActionCode(filters.action);
    if (actionCode !== null) {
        filterConditions.push(`action eq ${actionCode}`);
    }
    
    // Record ID filtering
    if (filters.recordId && filters.recordId.trim() !== '') {
        filterConditions.push(`_objectid_value eq ${filters.recordId.trim()}`);
    }

    // Build the OData query for the first page
    const select = '$select=auditid,createdon,objecttypecode,action,_objectid_value,_userid_value,changedata';
    const orderBy = '$orderby=createdon desc';
    const count = '$count=true'; // Request total count on the first page
    
    let query = `${select}&${orderBy}&${count}`;

    if (filterConditions.length > 0) {
        const filter = `$filter=${filterConditions.join(' and ')}`;
        query += `&${filter}`;
    }
    
    url = `${AUDITS_API_URL_BASE}?${query}`;
    
    // Use Prefer header for paging, which is more reliable for getting a nextLink
    fetchOptions.headers = {
      'Prefer': `odata.maxpagesize=${filters.pageSize}`
    };
  }


  try {
    const response = await authenticatedFetch(url, fetchOptions);
    const data: DynamicsAuditResponse = await response.json();
    
    return {
      logs: data.value.map(mapRawLogToAuditLog),
      totalCount: data['@odata.count'] ?? 0,
      nextLink: data['@odata.nextLink'] || null,
    };

  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    // Re-throw the error to be handled by the App component
    throw error;
  }
};
