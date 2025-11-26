'use client';

import { useState, useCallback } from 'react';
import { Report } from '@/types';
import { ReportCard } from './ReportCard';
import { DashboardFilters, FilterState } from './DashboardFilters';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface ReportsListProps {
  initialReports: Report[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
  onRefresh?: () => void;
}

export function ReportsList({
  initialReports,
  initialTotal,
  initialPage,
  initialTotalPages,
  onRefresh,
}: ReportsListProps) {
  const [reports, setReports] = useState(initialReports);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    language: 'all',
    severity: 'all',
    sortBy: 'date',
    minScore: '',
    maxScore: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete report');
      }

      setReports((prev) => prev.filter((r) => r._id !== id));
      toast.success('Report deleted successfully');
      onRefresh?.();
    } catch (error) {
      toast.error('Failed to delete report');
      console.error('Delete error:', error);
    }
  };

  const buildQueryString = useCallback((pageNum: number = 1) => {
    const params = new URLSearchParams();
    params.set('page', String(pageNum));
    
    if (filters.language !== 'all') {
      params.set('language', filters.language);
    }
    if (filters.severity !== 'all') {
      params.set('severity', filters.severity);
    }
    if (filters.sortBy !== 'date') {
      params.set('sortBy', filters.sortBy);
    }
    if (filters.minScore) {
      params.set('minScore', filters.minScore);
    }
    if (filters.maxScore) {
      params.set('maxScore', filters.maxScore);
    }
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    
    return params.toString();
  }, [filters, searchQuery]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || isLoading) return;
    setIsLoading(true);
    setPage(newPage);
    // Navigate with all current filters
    window.location.href = `/dashboard?${buildQueryString(newPage)}`;
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1); // Reset to page 1 when filters change
    window.location.href = `/dashboard?${buildQueryString(1).replace(/page=1/, `${new URLSearchParams().set('page', '1')}`)}&${new URLSearchParams(Object.fromEntries(
      Object.entries(newFilters)
        .filter(([, v]) => v && v !== 'all')
        .map(([k, v]) => [k, v] as const)
    )).toString()}`;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to page 1 when searching
    // Navigate with search query
    const params = new URLSearchParams();
    params.set('page', '1');
    if (query) {
      params.set('search', query);
    }
    if (filters.language !== 'all') {
      params.set('language', filters.language);
    }
    if (filters.severity !== 'all') {
      params.set('severity', filters.severity);
    }
    if (filters.sortBy !== 'date') {
      params.set('sortBy', filters.sortBy);
    }
    if (filters.minScore) {
      params.set('minScore', filters.minScore);
    }
    if (filters.maxScore) {
      params.set('maxScore', filters.maxScore);
    }
    window.location.href = `/dashboard?${params.toString()}`;
  };

  if (reports.length === 0) {
    return (
      <div className="space-y-6">
        <DashboardFilters onFilterChange={handleFilterChange} onSearch={handleSearch} />
        <div className="text-center py-12">
          <p className="text-slate-400">
            {searchQuery || Object.values(filters).some(v => v && v !== 'all') 
              ? 'No results found. Try adjusting your filters.'
              : 'No code reviews yet. Start by uploading a file!'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="bg-linear-to-r from-slate-800/40 to-slate-700/40 p-6 rounded-xl border border-slate-600/30 backdrop-blur-sm">
        <DashboardFilters onFilterChange={handleFilterChange} onSearch={handleSearch} />
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <ReportCard
            key={report._id}
            report={report}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 pt-8 border-t border-slate-700/50">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-slate-700/50 to-slate-600/50 hover:from-slate-600/70 hover:to-slate-500/70 disabled:opacity-50 disabled:cursor-not-allowed text-slate-100 rounded-lg transition-all font-semibold border border-slate-600/50 hover:border-slate-500/80 shadow-lg hover:shadow-xl"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="text-sm text-slate-400 px-6 py-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
            Page <span className="font-bold text-cyan-300">{page}</span> of <span className="font-bold text-cyan-300">{totalPages}</span>
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-slate-700/50 to-slate-600/50 hover:from-slate-600/70 hover:to-slate-500/70 disabled:opacity-50 disabled:cursor-not-allowed text-slate-100 rounded-lg transition-all font-semibold border border-slate-600/50 hover:border-slate-500/80 shadow-lg hover:shadow-xl"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
