"use client";

import { Search, Filter, Calendar, Clock } from 'lucide-react';

interface BookingFiltersProps {
  filters: {
    status: string;
    dateRange: string;
    searchTerm: string;
  };
  onFiltersChange: (filters: any) => void;
  bookingCount: number;
}

export function BookingFilters({ filters, onFiltersChange, bookingCount }: BookingFiltersProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const statusOptions = [
    { value: 'all', label: 'All Bookings', count: null },
    { value: 'confirmed', label: 'Confirmed', count: null },
    { value: 'provider_assigned', label: 'Assigned', count: null },
    { value: 'in_progress', label: 'In Progress', count: null },
    { value: 'completed', label: 'Completed', count: null },
    { value: 'quote_requested', label: 'Quote Requested', count: null },
    { value: 'cancelled', label: 'Cancelled', count: null }
  ];

  const dateRangeOptions = [
    { value: 'today', label: 'Today', icon: Calendar },
    { value: 'tomorrow', label: 'Tomorrow', icon: Calendar },
    { value: 'week', label: 'Next 7 Days', icon: Calendar },
    { value: 'month', label: 'Next 30 Days', icon: Calendar },
    { value: 'all', label: 'All Time', icon: Clock }
  ];

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      dateRange: 'today',
      searchTerm: ''
    });
  };

  const hasActiveFilters = filters.status !== 'all' || filters.dateRange !== 'today' || filters.searchTerm !== '';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Date Range Filter */}
          <div className="relative">
            <select
              value={filters.dateRange}
              onChange={(e) => updateFilter('dateRange', e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {bookingCount} booking{bookingCount !== 1 ? 's' : ''} found
            {hasActiveFilters && ' with current filters'}
          </span>
          
          {/* Quick Filter Tags */}
          <div className="flex items-center space-x-2">
            {filters.status !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Status: {statusOptions.find(s => s.value === filters.status)?.label}
                <button
                  onClick={() => updateFilter('status', 'all')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            
            {filters.dateRange !== 'today' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Time: {dateRangeOptions.find(d => d.value === filters.dateRange)?.label}
                <button
                  onClick={() => updateFilter('dateRange', 'today')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            
            {filters.searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Search: "{filters.searchTerm}"
                <button
                  onClick={() => updateFilter('searchTerm', '')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}