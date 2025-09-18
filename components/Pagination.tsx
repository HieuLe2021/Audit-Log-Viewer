
import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface PaginationProps {
    currentPage: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (direction: 'next' | 'prev') => void;
    isLoading: boolean;
    totalPages: number;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalCount, pageSize, onPageChange, isLoading, totalPages }) => {

    if (totalCount === 0) {
        return null; // Don't show pagination if there are no results
    }

    const isPrevDisabled = currentPage === 1 || isLoading;
    const isNextDisabled = currentPage >= totalPages || isLoading;

    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalCount);

    return (
        <div className="flex items-center justify-end space-x-6">
             <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground whitespace-nowrap">
                Showing <span className="font-medium">{startIndex.toLocaleString()}</span> to <span className="font-medium">{endIndex.toLocaleString()}</span> of{' '}
                <span className="font-medium">{totalCount.toLocaleString()}</span> results
            </p>
            { totalPages > 1 && 
                <>
                    <span className="text-sm text-border dark:text-dark-border">|</span>
                    <nav className="relative z-0 inline-flex items-center rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange('prev')}
                            disabled={isPrevDisabled}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-border bg-secondary text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed dark:border-dark-border dark:bg-dark-secondary dark:hover:bg-dark-muted"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <span className="relative inline-flex items-center px-4 py-2 border border-border bg-secondary text-sm font-medium text-foreground dark:border-dark-border dark:bg-dark-secondary dark:text-dark-foreground whitespace-nowrap">
                                Page {currentPage.toLocaleString()} of {totalPages.toLocaleString()}
                        </span>
                        <button
                            onClick={() => onPageChange('next')}
                            disabled={isNextDisabled}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-border bg-secondary text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed dark:border-dark-border dark:bg-dark-secondary dark:hover:bg-dark-muted"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </nav>
                </>
            }
        </div>
    );
};

export default Pagination;
