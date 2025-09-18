import React, { useState, useRef, useEffect } from 'react';
import { FilterCriteria, TableOption } from '../types';
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon, LoadingSpinnerIcon } from './Icons';

interface FilterPanelProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  filters: FilterCriteria;
  setFilters: React.Dispatch<React.SetStateAction<FilterCriteria>>;
  onSearch: () => void;
  isSearching: boolean;
  tableOptions: TableOption[];
  tablesLoading: boolean;
  tablesError: string | null;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  setIsOpen,
  filters,
  setFilters,
  onSearch,
  isSearching,
  tableOptions,
  tablesLoading,
  tablesError
}) => {
  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const tableDropdownRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Special handling for number inputs to ensure the state type is correct
    if (e.target.type === 'number') {
      const num = parseInt(value, 10);
      // If parsing fails (e.g., empty input), or value is invalid, default to 50
      setFilters(prev => ({ ...prev, [name]: isNaN(num) || num < 1 ? 50 : num }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleTableSelect = (table: TableOption) => {
    setFilters(prev => ({ ...prev, tableName: table.logicalName }));
    setIsTableDropdownOpen(false);
    setTableSearchTerm('');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (tableDropdownRef.current && !tableDropdownRef.current.contains(event.target as Node)) {
            setIsTableDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredTableOptions = tableOptions.filter(option =>
    option.displayName.toLowerCase().includes(tableSearchTerm.toLowerCase())
  );

  const selectedTable = tableOptions.find(t => t.logicalName === filters.tableName);

  const actionOptions = ['ALL', 'CREATE', 'UPDATE', 'DELETE'];
  const departmentOptions = [
      { label: 'All Departments', value: 'ALL' },
      { label: 'R&D', value: '191920000' },
      { label: 'Tech', value: '191920001' },
      { label: 'Accounting', value: '191920002' },
      { label: 'Sourcing', value: '191920003' },
      { label: 'Sales', value: '191920004' },
      { label: 'Logistics', value: '191920005' },
      { label: 'HR', value: '283640001' },
      { label: 'General', value: '191920006' },
  ];

  return (
    <aside
      className={`relative bg-card border border-border shadow-md flex flex-col transition-all duration-300 ease-in-out dark:bg-dark-card dark:border-dark-border rounded-lg ${
        isOpen ? 'w-80' : 'w-0'
      }`}
    >
      <div className="w-full h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0 dark:border-dark-border">
          <h2 className="text-xl font-semibold text-card-foreground dark:text-dark-card-foreground">Filters</h2>
        </div>
        
        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-muted-foreground mb-1.5 dark:text-dark-muted-foreground">Department</label>
            <select
              id="department"
              name="department"
              value={filters.department}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:ring-2 focus:ring-ring focus:border-ring sm:text-sm text-foreground dark:bg-dark-background dark:border-dark-input dark:text-dark-foreground"
            >
              {departmentOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="tableName" className="block text-sm font-medium text-muted-foreground mb-1.5 dark:text-dark-muted-foreground">Table</label>
            <div className="relative" ref={tableDropdownRef}>
              <button
                type="button"
                onClick={() => setIsTableDropdownOpen(prev => !prev)}
                disabled={tablesLoading || !!tablesError}
                className="w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:ring-2 focus:ring-ring focus:border-ring sm:text-sm text-foreground dark:bg-dark-background dark:border-dark-input dark:text-dark-foreground disabled:bg-muted/50 disabled:cursor-not-allowed text-left flex justify-between items-center"
                aria-haspopup="listbox"
                aria-expanded={isTableDropdownOpen}
              >
                <span className="truncate">
                  {tablesLoading ? 'Loading tables...' : tablesError ? 'Error loading tables' : selectedTable?.displayName || 'Select a table'}
                </span>
                <svg className={`w-5 h-5 text-muted-foreground transform transition-transform ${isTableDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>

              {isTableDropdownOpen && !tablesLoading && !tablesError && (
                <div className="absolute z-10 mt-1 w-full bg-card dark:bg-dark-card rounded-md shadow-lg border border-border dark:border-dark-border max-h-60 flex flex-col" role="listbox">
                  <div className="p-2 sticky top-0 bg-card dark:bg-dark-card">
                    <input
                      type="text"
                      placeholder="Search tables..."
                      value={tableSearchTerm}
                      onChange={e => setTableSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:ring-2 focus:ring-ring focus:border-ring sm:text-sm text-foreground dark:bg-dark-background dark:border-dark-input dark:text-dark-foreground"
                    />
                  </div>
                  <ul className="overflow-y-auto">
                    {filteredTableOptions.length > 0 ? (
                      filteredTableOptions.map(table => (
                        <li
                          key={table.logicalName}
                          onClick={() => handleTableSelect(table)}
                          className="px-4 py-2 text-sm text-foreground dark:text-dark-foreground hover:bg-muted dark:hover:bg-dark-muted cursor-pointer"
                          role="option"
                          aria-selected={filters.tableName === table.logicalName}
                        >
                          {table.displayName}
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-sm text-muted-foreground dark:text-dark-muted-foreground">No tables found.</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            {tablesError && <p className="text-xs text-red-600 mt-1">{tablesError}</p>}
          </div>
          
          <div>
            <label htmlFor="action" className="block text-sm font-medium text-muted-foreground mb-1.5 dark:text-dark-muted-foreground">Action</label>
            <select
              id="action"
              name="action"
              value={filters.action}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:ring-2 focus:ring-ring focus:border-ring sm:text-sm text-foreground dark:bg-dark-background dark:border-dark-input dark:text-dark-foreground"
            >
              {actionOptions.map(action => <option key={action} value={action}>{action}</option>)}
            </select>
          </div>
          
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-muted-foreground mb-1.5 dark:text-dark-muted-foreground">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:ring-2 focus:ring-ring focus:border-ring sm:text-sm text-foreground dark:bg-dark-background dark:border-dark-input dark:text-dark-foreground"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-muted-foreground mb-1.5 dark:text-dark-muted-foreground">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:ring-2 focus:ring-ring focus:border-ring sm:text-sm text-foreground dark:bg-dark-background dark:border-dark-input dark:text-dark-foreground"
            />
          </div>

          <div>
            <label htmlFor="recordId" className="block text-sm font-medium text-muted-foreground mb-1.5 dark:text-dark-muted-foreground">Record ID (Optional)</label>
            <input
              type="text"
              id="recordId"
              name="recordId"
              placeholder="e.g., a8c5e2f9-..."
              value={filters.recordId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:ring-2 focus:ring-ring focus:border-ring sm:text-sm text-foreground dark:bg-dark-background dark:border-dark-input dark:text-dark-foreground"
            />
          </div>
           <div>
            <label htmlFor="pageSize" className="block text-sm font-medium text-muted-foreground mb-1.5 dark:text-dark-muted-foreground">Page Size</label>
            <input
              type="number"
              id="pageSize"
              name="pageSize"
              min="1"
              max="1000"
              value={filters.pageSize}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:ring-2 focus:ring-ring focus:border-ring sm:text-sm text-foreground dark:bg-dark-background dark:border-dark-input dark:text-dark-foreground"
            />
          </div>
        </div>
        
        <div className="p-4 border-t border-border flex-shrink-0 dark:border-dark-border">
          <button
            onClick={onSearch}
            disabled={isSearching || tablesLoading || !!tablesError}
            className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed dark:bg-dark-primary dark:text-dark-primary-foreground dark:hover:bg-dark-primary/90"
          >
            {isSearching ? (
              <>
                <LoadingSpinnerIcon className="w-5 h-5 mr-2" />
                Searching...
              </>
            ) : (
              <>
                <SearchIcon className="w-5 h-5 mr-2" />
                Search
              </>
            )}
          </button>
        </div>
      </div>


      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-card border border-border rounded-full p-1.5 text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring dark:bg-dark-card dark:border-dark-border dark:text-dark-muted-foreground dark:hover:bg-dark-muted"
        aria-label={isOpen ? 'Collapse panel' : 'Expand panel'}
      >
        {isOpen ? <ChevronLeftIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}
      </button>
    </aside>
  );
};

export default FilterPanel;