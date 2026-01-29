"use client";

import { useMemo } from 'react';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Star,
  Users
} from 'lucide-react';

interface Booking {
  id: string;
  status: string;
  scheduledStartTime: string;
  totalAmount: number;
  hasReview: boolean;
  createdAt: string;
}

interface BookingStatsProps {
  bookings: Booking[];
}

interface StatCard {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<any>;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function BookingStats({ bookings }: BookingStatsProps) {
  const stats = useMemo(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Today's bookings
    const todayBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.scheduledStartTime);
      return bookingDate >= startOfToday && bookingDate < new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    });

    // This week's bookings
    const weekBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.scheduledStartTime);
      return bookingDate >= startOfWeek;
    });

    // This month's bookings
    const monthBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.scheduledStartTime);
      return bookingDate >= startOfMonth;
    });

    // Revenue calculations
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const monthRevenue = monthBookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    // Status counts
    const confirmedCount = bookings.filter(b => 
      ['CONFIRMED', 'PROVIDER_ASSIGNED', 'IN_PROGRESS'].includes(b.status)
    ).length;

    const completedCount = bookings.filter(b => b.status === 'COMPLETED').length;
    
    const pendingCount = bookings.filter(b => 
      ['QUOTE_REQUESTED', 'PENDING_PAYMENT'].includes(b.status)
    ).length;

    // Reviews
    const reviewCount = bookings.filter(b => b.hasReview).length;
    const reviewRate = completedBookings.length > 0 ? (reviewCount / completedBookings.length) * 100 : 0;

    // Calculate trends (mock data for demo)
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return { value: 0, isPositive: true };
      const change = ((current - previous) / previous) * 100;
      return {
        value: Math.abs(change),
        isPositive: change >= 0
      };
    };

    const formatCurrency = (cents: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(cents / 100);
    };

    return [
      {
        title: "Today's Appointments",
        value: todayBookings.length,
        subtitle: `${todayBookings.filter(b => b.status === 'COMPLETED').length} completed`,
        icon: Calendar,
        color: 'text-blue-600',
        trend: calculateTrend(todayBookings.length, 3) // Mock previous day
      },
      {
        title: 'Monthly Revenue',
        value: formatCurrency(monthRevenue),
        subtitle: `${monthBookings.filter(b => b.status === 'COMPLETED').length} completed jobs`,
        icon: DollarSign,
        color: 'text-green-600',
        trend: calculateTrend(monthRevenue, 45000) // Mock previous month
      },
      {
        title: 'Active Bookings',
        value: confirmedCount,
        subtitle: `${pendingCount} pending actions`,
        icon: Clock,
        color: 'text-orange-600',
        trend: calculateTrend(confirmedCount, 8)
      },
      {
        title: 'Completion Rate',
        value: `${completedCount > 0 ? Math.round((completedCount / bookings.length) * 100) : 0}%`,
        subtitle: `${completedCount} of ${bookings.length} total`,
        icon: CheckCircle,
        color: 'text-teal-600',
        trend: calculateTrend(completedCount, bookings.length - 5)
      }
    ] as StatCard[];
  }, [bookings]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg bg-white ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            {stat.trend && (
              <div className={`flex items-center text-sm ${
                stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`h-4 w-4 mr-1 ${
                  stat.trend.isPositive ? '' : 'rotate-180'
                }`} />
                <span>{stat.trend.value.toFixed(1)}%</span>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </h3>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {stat.title}
            </p>
            {stat.subtitle && (
              <p className="text-xs text-gray-500">
                {stat.subtitle}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}