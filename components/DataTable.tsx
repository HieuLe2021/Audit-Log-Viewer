
import React, { useState } from 'react';
import { AuditLog } from '../types';
import { LoadingSpinnerIcon, DocumentMagnifyingGlassIcon, ExclamationTriangleIcon, ClipboardIcon, CheckIcon, SearchIcon } from './Icons';
import Pagination from './Pagination';

interface DataTableProps {
  logs: AuditLog[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (direction: 'next' | 'prev') => void;
  hasSearched: boolean;
  totalPages: number;
}

const getActionBadgeColor = (action: string) => {
  switch (action) {
    case 'CREATE': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    case 'UPDATE': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
    case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const DataTable: React.FC<DataTableProps> = ({ logs, isLoading, error, totalCount, currentPage, pageSize, onPageChange, hasSearched, totalPages }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCopy = (id: string, textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  const isInitialState = !hasSearched && !isLoading && !error;

  // Filter logs on the current page based on the search term
  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    return log.changes?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoading && logs.length === 0) { // Show full-screen loader only on initial load or search
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground dark:text-dark-muted-foreground p-10 bg-card dark:bg-dark-card rounded-lg shadow-md border border-border dark:border-dark-border">
        <LoadingSpinnerIcon className="w-12 h-12 mb-4 text-primary dark:text-dark-primary" />
        <p className="text-lg font-medium text-foreground dark:text-dark-foreground">Loading Audit Logs...</p>
        <p>Please wait while we fetch the data.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-10 rounded-lg border border-red-200 dark:border-red-900/50">
        <ExclamationTriangleIcon className="w-12 h-12 mb-4 text-red-500 dark:text-red-400" />
        <p className="text-lg font-medium text-red-800 dark:text-red-200">An Error Occurred</p>
        <p>{error}</p>
      </div>
    );
  }
  
  if (isInitialState) {
     return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground dark:text-dark-muted-foreground p-10 border-2 border-dashed border-border dark:border-dark-border bg-card dark:bg-dark-card rounded-lg">
        <DocumentMagnifyingGlassIcon className="w-16 h-16 mb-4 text-muted-foreground/50" />
        <p className="text-xl font-semibold text-foreground dark:text-dark-foreground">Ready to Search</p>
        <p className="mt-1">Use the filters on the left to start viewing audit logs.</p>
      </div>
    );
  }
  
  if (totalCount === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground dark:text-dark-muted-foreground p-10 border-2 border-dashed border-border dark:border-dark-border bg-card dark:bg-dark-card rounded-lg">
        <DocumentMagnifyingGlassIcon className="w-16 h-16 mb-4 text-muted-foreground/50" />
        <p className="text-xl font-semibold text-foreground dark:text-dark-foreground">No Logs Found</p>
        <p className="mt-1">Your search returned no results. Try adjusting the filters.</p>
      </div>
    );
  }

  return (
    <div className={`bg-card dark:bg-dark-card shadow-md rounded-lg overflow-hidden border border-border dark:border-dark-border flex flex-col h-full ${isLoading ? 'opacity-50' : ''}`}>
      <div className="p-4 border-b border-border dark:border-dark-border flex items-center justify-between flex-shrink-0">
        <div className="relative w-1/3 min-w-[250px]">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search changes on this page..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md shadow-sm focus:ring-2 focus:ring-ring sm:text-sm text-foreground dark:bg-dark-background dark:border-dark-input dark:text-dark-foreground"
            disabled={logs.length === 0}
          />
        </div>
        <Pagination 
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={onPageChange}
            isLoading={isLoading}
            totalPages={totalPages}
        />
      </div>
      <div className="overflow-x-auto flex-grow">
        <table className="min-w-full divide-y divide-border table-fixed w-full">
          <thead className="bg-secondary dark:bg-dark-secondary">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-foreground dark:text-dark-secondary-foreground uppercase tracking-wider w-[18%]">Timestamp</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-foreground dark:text-dark-secondary-foreground uppercase tracking-wider w-[15%]">User</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-foreground dark:text-dark-secondary-foreground uppercase tracking-wider w-[15%]">Table</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-foreground dark:text-dark-secondary-foreground uppercase tracking-wider w-[36%]">Changes</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-foreground dark:text-dark-secondary-foreground uppercase tracking-wider w-[8%]">Action</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-secondary-foreground dark:text-dark-secondary-foreground uppercase tracking-wider w-[8%]">Record ID</th>
            </tr>
          </thead>
          <tbody className="bg-card dark:bg-dark-card">
            {filteredLogs.map(log => (
              <tr key={log.id} className="border-b border-border dark:border-dark-border">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground/80 dark:text-dark-muted-foreground/80">{log.timestamp.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap truncate text-sm text-muted-foreground dark:text-dark-muted-foreground" title={log.user.name}>{log.user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground dark:text-dark-muted-foreground font-mono">{log.tableName}</td>
                <td className="px-6 py-4 text-base text-foreground dark:text-dark-foreground align-top" title={log.changes}>
                  {log.action === 'UPDATE' && log.changes ? (
                    <pre className="font-sans whitespace-pre-wrap break-words">{log.changes}</pre>
                  ) : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground dark:text-dark-muted-foreground font-mono text-center">
                  <button 
                    onClick={() => handleCopy(log.id, log.recordId)}
                    className="p-1.5 rounded-md hover:bg-muted dark:hover:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-ring"
                    title="Copy Record ID"
                  >
                    {copiedId === log.id ? (
                      <CheckIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <ClipboardIcon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
