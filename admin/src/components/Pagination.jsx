import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between border-t border-stone-100 bg-white px-4 py-3 sm:px-6">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-stone-700">
                        Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                        <span className="font-medium">{totalItems}</span> results
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-stone-400 ring-1 ring-inset ring-stone-300 hover:bg-stone-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>

                        {[...Array(totalPages)].map((_, index) => {
                            const pageNumber = index + 1;
                            // Basic logic to show limited page numbers can be added here if needed
                            // For now, show all reasonable amount of pages or implement more complex logic later
                            return (
                                <button
                                    key={pageNumber}
                                    onClick={() => onPageChange(pageNumber)}
                                    aria-current={currentPage === pageNumber ? 'page' : undefined}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === pageNumber
                                            ? 'z-10 bg-ruvera-gold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ruvera-gold'
                                            : 'text-stone-900 ring-1 ring-inset ring-stone-300 hover:bg-stone-50 focus:z-20 focus:outline-offset-0'
                                        }`}
                                >
                                    {pageNumber}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-stone-400 ring-1 ring-inset ring-stone-300 hover:bg-stone-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}
