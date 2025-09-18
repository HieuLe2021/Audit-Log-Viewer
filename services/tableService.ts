import { authenticatedFetch } from './apiService';
import { TableOption } from '../types';

const TABLES_API_URL_BASE = "https://wecare-ii.crm5.dynamics.com/api/data/v9.2/ai_tables";

interface DynamicsTable {
  ai_name: string;
  ai_logicalname: string;
}

interface FetchTablesResponse {
  value: DynamicsTable[];
}

/**
 * Fetches the list of filterable tables from the Dynamics 365 API,
 * optionally filtered by department.
 * @param departmentId The ID of the department to filter by. If 'ALL' or undefined, all tables are fetched.
 * @returns A promise that resolves to an array of table option objects.
 */
export const fetchTables = async (departmentId?: string): Promise<TableOption[]> => {
  const select = '$select=ai_name,ai_logicalname';
  let filter = 'statecode eq 0 and ai_type eq 120880000';

  // Append department filter if a specific department is selected
  if (departmentId && departmentId !== 'ALL') {
    // Use the correct field for filtering by department option set value
    filter += ` and crdfd_department eq ${departmentId}`;
  }

  const url = `${TABLES_API_URL_BASE}?${select}&$filter=${filter}`;

  try {
    const response = await authenticatedFetch(url, { method: 'GET' });
    const data: FetchTablesResponse = await response.json();
    
    const tableOptions: TableOption[] = data.value.map(table => ({
      displayName: table.ai_name,
      logicalName: table.ai_logicalname,
    })).sort((a, b) => a.displayName.localeCompare(b.displayName));

    return tableOptions;
  } catch (error) {
    console.error(`Failed to fetch tables for department ${departmentId}:`, error);
    // Re-throw the error to be handled by the calling component
    throw error;
  }
};
