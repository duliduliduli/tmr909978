"use client";

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Phone, Star, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { BookingCard } from './BookingCard';
import { BookingFilters } from './BookingFilters';
import { BookingStats } from './BookingStats';

interface Booking {
  id: string;
  bookingNumber: string;
  status: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  totalAmount: number;
  serviceAddress: string;
  service: {
    name: string;
    category: string;
  };
  customer: {
    name: string;
    phone?: string;
    avatar?: string;
  };
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    color?: string;
    licensePlate?: string;
  };
  specialInstructions?: string;
  hasReview: boolean;
  createdAt: string;
}

interface BookingDashboardProps {
  providerId: string;
}

export function BookingDashboard({ providerId }: BookingDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'today',
    searchTerm: ''
  });

  useEffect(() => {
    fetchBookings();
  }, [providerId]);

  useEffect(() => {
    applyFilters();
  }, [bookings, filters]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/bookings?providerId=${providerId}&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error: any) {
      setError(error.message || 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(booking => booking.status === filters.status.toUpperCase());
    }

    // Date range filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filters.dateRange) {
      case 'today':
        filtered = filtered.filter(booking => {
          const bookingDate = new Date(booking.scheduledStartTime);
          const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
          return bookingDay.getTime() === today.getTime();
        });
        break;
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filtered = filtered.filter(booking => {
          const bookingDate = new Date(booking.scheduledStartTime);
          const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
          return bookingDay.getTime() === tomorrow.getTime();
        });
        break;
      case 'week':
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        filtered = filtered.filter(booking => {
          const bookingDate = new Date(booking.scheduledStartTime);
          return bookingDate >= today && bookingDate <= weekFromNow;
        });
        break;
      case 'month':
        const monthFromNow = new Date(today);
        monthFromNow.setMonth(monthFromNow.getMonth() + 1);
        filtered = filtered.filter(booking => {
          const bookingDate = new Date(booking.scheduledStartTime);
          return bookingDate >= today && bookingDate <= monthFromNow;
        });
        break;
    }

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.bookingNumber.toLowerCase().includes(searchLower) ||
        booking.customer.name.toLowerCase().includes(searchLower) ||
        booking.serviceAddress.toLowerCase().includes(searchLower) ||
        booking.service.name.toLowerCase().includes(searchLower)
      );
    }

    setFilteredBookings(filtered);
  };

  const handleBookingUpdate = (updatedBooking: Booking) => {
    setBookings(prev => prev.map(booking => 
      booking.id === updatedBooking.id ? updatedBooking : booking
    ));
  };

  const groupBookingsByDate = (bookings: Booking[]) => {
    const groups: { [key: string]: Booking[] } = {};
    
    bookings.forEach(booking => {
      const date = new Date(booking.scheduledStartTime).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(booking);
    });

    // Sort groups by date
    const sortedDates = Object.keys(groups).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    return sortedDates.map(date => ({
      date,
      bookings: groups[date].sort((a, b) => 
        new Date(a.scheduledStartTime).getTime() - new Date(b.scheduledStartTime).getTime()
      )
    }));
  };

  const formatDateGroup = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="h-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Bookings</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchBookings}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const groupedBookings = groupBookingsByDate(filteredBookings);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your appointments and services</p>
          </div>
          <button
            onClick={fetchBookings}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Refresh
          </button>
        </div>

        {/* Stats */}
        <BookingStats bookings={bookings} />
      </div>

      {/* Filters */}
      <BookingFilters
        filters={filters}
        onFiltersChange={setFilters}
        bookingCount={filteredBookings.length}
      />

      {/* Bookings List */}
      {groupedBookings.length > 0 ? (
        <div className="space-y-6">
          {groupedBookings.map(({ date, bookings: dayBookings }) => (
            <div key={date} className="bg-white rounded-lg shadow">
              {/* Date Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {formatDateGroup(date)}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {dayBookings.length} appointment{dayBookings.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Bookings */}
              <div className="divide-y divide-gray-200">
                {dayBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onUpdate={handleBookingUpdate}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-600 mb-4">
              {filters.status === 'all' 
                ? 'You don\'t have any bookings yet.'
                : `No ${filters.status.toLowerCase()} bookings found.`
              }
            </p>
            {filters.status !== 'all' || filters.searchTerm || filters.dateRange !== 'today' ? (
              <button
                onClick={() => setFilters({ status: 'all', dateRange: 'today', searchTerm: '' })}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}