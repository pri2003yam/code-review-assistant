'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';

interface DashboardFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  onSearch: (query: string) => void;
}

export interface FilterState {
  language: string;
  severity: string;
  sortBy: string;
  minScore: string;
  maxScore: string;
}

const LANGUAGES = [
  { value: 'all', label: 'All Languages' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
];

const SEVERITIES = [
  { value: 'all', label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'warning', label: 'Warning' },
  { value: 'suggestion', label: 'Suggestion' },
];

const SORT_OPTIONS = [
  { value: 'date', label: 'Newest First' },
  { value: 'score', label: 'Highest Score' },
  { value: 'issues', label: 'Most Issues' },
];

export function DashboardFilters({ onFilterChange, onSearch }: DashboardFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    language: 'all',
    severity: 'all',
    sortBy: 'date',
    minScore: '',
    maxScore: '',
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      language: 'all',
      severity: 'all',
      sortBy: 'date',
      minScore: '',
      maxScore: '',
    };
    setFilters(resetFilters);
    setSearchQuery('');
    onSearch('');
    onFilterChange(resetFilters);
  };

  const hasActiveFilters =
    filters.language !== 'all' ||
    filters.severity !== 'all' ||
    filters.sortBy !== 'date' ||
    filters.minScore ||
    filters.maxScore ||
    searchQuery;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
        <Input
          type="text"
          placeholder="Search by filename or keywords..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
        />
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="outline"
          className="gap-2 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 flex-1"
        >
          <Filter className="w-4 h-4" />
          Filters {hasActiveFilters && <Badge className="bg-blue-600 text-xs">Active</Badge>}
        </Button>
        {hasActiveFilters && (
          <Button
            onClick={handleReset}
            size="sm"
            variant="outline"
            className="gap-2 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
            Reset
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {isExpanded && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-4 backdrop-blur-sm">
          {/* Language Filter */}
          <div>
            <label className="text-sm font-semibold text-slate-200 mb-2 block">
              Language
            </label>
            <select
              value={filters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="text-sm font-semibold text-slate-200 mb-2 block">
              Issue Severity
            </label>
            <select
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SEVERITIES.map((sev) => (
                <option key={sev.value} value={sev.value}>
                  {sev.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Option */}
          <div>
            <label className="text-sm font-semibold text-slate-200 mb-2 block">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Score Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-slate-200 mb-2 block">
                Min Score
              </label>
              <Input
                type="number"
                min="0"
                max="10"
                step="0.1"
                placeholder="0"
                value={filters.minScore}
                onChange={(e) => handleFilterChange('minScore', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-200 mb-2 block">
                Max Score
              </label>
              <Input
                type="number"
                min="0"
                max="10"
                step="0.1"
                placeholder="10"
                value={filters.maxScore}
                onChange={(e) => handleFilterChange('maxScore', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
