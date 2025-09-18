
import React, { useState, useEffect, useReducer } from 'react';
import { FilterCriteria, AuditLog, TableOption, FetchAuditLogsResponse } from './types';
import FilterPanel from './components/FilterPanel';
import DataTable from './components/DataTable';
import Login from './components/Login';
import { fetchAuditLogs } from './services/auditService';
import { fetchTables } from './services/tableService';
import { fetchAndSetToken } from './services/authService';
import { LogoIcon, MoonIcon, SunIcon, ExclamationTriangleIcon } from './components/Icons';

type Theme = 'light' | 'dark';

interface PageState {
  logs: AuditLog[];
  nextLink: string | null;
}

// --- State Management via useReducer ---

interface AppState {
  pageHistory: PageState[];
  totalCount: number;
  currentPage: number;
  hasSearched: boolean;
  isLoading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SEARCH_START' }
  | { type: 'SEARCH_SUCCESS'; payload: FetchAuditLogsResponse }
  | { type: 'SEARCH_FAILURE'; payload: string }
  | { type: 'PAGE_CHANGE_START' }
  | { type: 'NEXT_PAGE_SUCCESS'; payload: FetchAuditLogsResponse }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'PAGE_CHANGE_FAILURE'; payload: string };

const initialState: AppState = {
  pageHistory: [],
  totalCount: 0,
  currentPage: 1,
  hasSearched: false,
  isLoading: false,
  error: null,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SEARCH_START':
      return {
        ...initialState,
        isLoading: true,
        hasSearched: true,
      };
    case 'SEARCH_SUCCESS':
      const firstPage: PageState = { logs: action.payload.logs, nextLink: action.payload.nextLink };
      return {
        ...state,
        isLoading: false,
        error: null,
        totalCount: action.payload.totalCount,
        pageHistory: [firstPage],
        currentPage: 1,
      };
    case 'SEARCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'PAGE_CHANGE_START':
      return { ...state, isLoading: true, error: null };
    case 'NEXT_PAGE_SUCCESS':
      const newPage: PageState = { logs: action.payload.logs, nextLink: action.payload.nextLink };
      return {
          ...state,
          isLoading: false,
          pageHistory: [...state.pageHistory, newPage],
          currentPage: state.currentPage + 1,
      };
    case 'SET_PAGE':
        return {
            ...state,
            currentPage: action.payload,
        };
    case 'PAGE_CHANGE_FAILURE':
        return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
};


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  const [tableOptions, setTableOptions] = useState<TableOption[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [tablesError, setTablesError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const [filters, setFilters] = useState<FilterCriteria>({
    department: 'ALL',
    tableName: '', 
    action: 'ALL',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    recordId: '',
    pageSize: 50,
  });
  
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('audit-viewer-theme') as Theme;
    return savedTheme || 'dark';
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    const initializeApp = async () => {
      try {
        setInitializationError(null);
        await fetchAndSetToken();
        setIsInitialized(true);
      } catch (e: any) {
          const errorMessage = e.message || 'An unexpected error occurred during application startup.';
          setInitializationError(errorMessage);
          setIsInitialized(false);
      }
    };
    
    initializeApp();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isInitialized) return;

    const updateTablesForDepartment = async () => {
      setTablesLoading(true);
      setTablesError(null);
      try {
        const tables = await fetchTables(filters.department);
        setTableOptions(tables);

        if (tables.length > 0) {
          if (!tables.some(t => t.logicalName === filters.tableName)) {
            setFilters(prev => ({ ...prev, tableName: tables[0].logicalName }));
          }
        } else {
          setFilters(prev => ({ ...prev, tableName: '' }));
        }
      } catch (e: any)
      {
        const errorMessage = e.message || 'Failed to load tables for the selected department.';
        setTablesError(errorMessage);
        setTableOptions([]);
        setFilters(prev => ({ ...prev, tableName: '' }));
      } finally {
        setTablesLoading(false);
      }
    };
    
    updateTablesForDepartment();
  }, [filters.department, isInitialized]);
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('audit-viewer-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  const handleSearch = async () => {
    if (!isInitialized) return;
    
    dispatch({ type: 'SEARCH_START' });

    try {
      const results = await fetchAuditLogs(filters, null);
      dispatch({ type: 'SEARCH_SUCCESS', payload: results });
    } catch (err: unknown) {
      let message = 'Failed to fetch audit logs. Please try again.';
      if (err instanceof Error) {
        message = err.message;
      }
      dispatch({ type: 'SEARCH_FAILURE', payload: message });
    }
  };
  
  const handlePageChange = async (direction: 'next' | 'prev') => {
    if (direction === 'prev') {
      // The button is disabled in the UI if currentPage is 1.
      dispatch({ type: 'SET_PAGE', payload: state.currentPage - 1 });
      return;
    }

    // Direction is 'next'
    const nextPageNumber = state.currentPage + 1;

    // If we have already fetched the next page, just navigate to it.
    if (nextPageNumber <= state.pageHistory.length) {
      dispatch({ type: 'SET_PAGE', payload: nextPageNumber });
      return;
    }

    // Otherwise, fetch the next page from the API.
    // The button is disabled if there's no nextLink, but we safeguard here too.
    const currentPageData = state.pageHistory[state.currentPage - 1];
    if (!currentPageData?.nextLink) {
      return;
    }

    dispatch({ type: 'PAGE_CHANGE_START' });
    try {
      const results = await fetchAuditLogs(filters, currentPageData.nextLink);
      dispatch({ type: 'NEXT_PAGE_SUCCESS', payload: results });
    } catch (err: unknown) {
      let message = 'Failed to fetch next page. Please try again.';
      if (err instanceof Error) {
        message = err.message;
      }
      dispatch({ type: 'PAGE_CHANGE_FAILURE', payload: message });
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="h-screen font-sans bg-secondary text-foreground dark:bg-dark-background dark:text-dark-foreground">
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  const currentLogs = state.pageHistory[state.currentPage - 1]?.logs ?? [];
  const totalPages = state.totalCount > 0 ? Math.ceil(state.totalCount / filters.pageSize) : 0;

  return (
    <div className="h-screen font-sans bg-secondary text-foreground dark:bg-dark-background dark:text-dark-foreground p-4">
      <div className="flex h-full w-full gap-4">
        <FilterPanel
          isOpen={isPanelOpen}
          setIsOpen={setIsPanelOpen}
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
          isSearching={state.isLoading && state.pageHistory.length === 0}
          tableOptions={tableOptions}
          tablesLoading={tablesLoading}
          tablesError={tablesError}
        />
        <main className="flex-1 flex flex-col transition-all duration-300 ease-in-out bg-card dark:bg-dark-card rounded-lg border border-border dark:border-dark-border overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b border-border flex-shrink-0 dark:border-dark-border">
            <div className="flex items-center space-x-3">
              <LogoIcon className="h-8 w-8 text-primary dark:text-dark-primary" />
              <h1 className="text-2xl font-bold text-card-foreground dark:text-dark-card-foreground">
                Audit Log Viewer
              </h1>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-muted-foreground hover:bg-muted dark:hover:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Toggle theme"
            >
              <SunIcon className="h-6 w-6 hidden dark:block" />
              <MoonIcon className="h-6 w-6 block dark:hidden" />
            </button>
          </header>
          <div className="flex-1 p-6 overflow-auto">
            {initializationError ? (
               <div className="flex flex-col items-center justify-center h-full text-center text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-10 rounded-lg border border-red-200 dark:border-red-900/50">
                <ExclamationTriangleIcon className="w-16 h-16 mb-6 text-red-500 dark:text-red-400" />
                <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">Application Initialization Failed</h2>
                <p className="max-w-md">
                  The application could not start. This is often due to a problem with authentication or connecting to the API.
                </p>
                 <p className="mt-4 p-2 bg-red-100 dark:bg-red-800/50 rounded font-mono text-sm max-w-full text-left">
                    <strong>Error:</strong> {initializationError}
                </p>
              </div>
            ) : (
              <DataTable 
                logs={currentLogs}
                isLoading={state.isLoading}
                error={state.error}
                totalCount={state.totalCount}
                currentPage={state.currentPage}
                pageSize={filters.pageSize}
                onPageChange={handlePageChange}
                hasSearched={state.hasSearched}
                totalPages={totalPages}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
