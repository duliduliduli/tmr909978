"use client";

import { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  Phone, 
  Star, 
  DollarSign, 
  Car,
  User,
  MessageSquare,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  MoreHorizontal,
  AlertTriangle
} from 'lucide-react';

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

interface BookingCardProps {
  booking: Booking;
  onUpdate: (booking: Booking) => void;
}

export function BookingCard({ booking, onUpdate }: BookingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      CONFIRMED: {
        color: 'bg-blue-100 text-blue-800',
        icon: CheckCircle,
        label: 'Confirmed'
      },
      PROVIDER_ASSIGNED: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        label: 'Assigned'
      },
      IN_PROGRESS: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: Play,
        label: 'In Progress'
      },
      COMPLETED: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        label: 'Completed'
      },
      CANCELLED: {
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
        label: 'Cancelled'
      },
      QUOTE_REQUESTED: {
        color: 'bg-orange-100 text-orange-800',
        icon: MessageSquare,
        label: 'Quote Requested'
      },
      NO_SHOW_CUSTOMER: {
        color: 'bg-red-100 text-red-800',
        icon: AlertTriangle,
        label: 'Customer No-Show'
      }
    };

    return configs[status as keyof typeof configs] || {
      color: 'bg-gray-100 text-gray-800',
      icon: Clock,
      label: status.replace('_', ' ')
    };
  };

  const handleAction = async (action: string) => {
    setActionLoading(action);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          userId: 'provider-id', // Should come from auth
          userRole: 'provider'
        })
      });

      if (!response.ok) throw new Error('Action failed');

      const updatedBooking = await response.json();
      onUpdate({ ...booking, status: updatedBooking.status });

    } catch (error: any) {
      console.error('Action failed:', error);
      // Show error toast/notification
    } finally {
      setActionLoading(null);
    }
  };

  const getAvailableActions = () => {
    const actions = [];

    switch (booking.status) {
      case 'CONFIRMED':
        actions.push(
          { id: 'provider_accept', label: 'Accept Booking', color: 'green' },
          { id: 'cancel_booking', label: 'Decline', color: 'red' }
        );
        break;
      case 'PROVIDER_ASSIGNED':
        actions.push(
          { id: 'start_service', label: 'Start Service', color: 'blue' },
          { id: 'customer_no_show', label: 'Customer No-Show', color: 'orange' }
        );
        break;
      case 'IN_PROGRESS':
        actions.push(
          { id: 'complete_service', label: 'Complete Service', color: 'green' }
        );
        break;
      case 'QUOTE_REQUESTED':
        actions.push(
          { id: 'provide_quote', label: 'Send Quote', color: 'blue' }
        );
        break;
    }

    return actions;
  };

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;
  const availableActions = getAvailableActions();
  
  const isUpcoming = new Date(booking.scheduledStartTime) > new Date();
  const isPastDue = new Date(booking.scheduledStartTime) < new Date() && 
                    !['COMPLETED', 'CANCELLED', 'NO_SHOW_CUSTOMER', 'NO_SHOW_PROVIDER'].includes(booking.status);

  return (
    <div className={`p-6 hover:bg-gray-50 transition-colors ${isPastDue ? 'border-l-4 border-red-500' : ''}`}>
      <div className="flex items-start justify-between">
        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            {/* Time */}
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 text-gray-400 mr-1" />
              <span className="font-medium">
                {formatTime(booking.scheduledStartTime)} - {formatTime(booking.scheduledEndTime)}
              </span>
            </div>

            {/* Status Badge */}
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </span>

            {/* Booking Number */}
            <span className="text-xs text-gray-500">#{booking.bookingNumber}</span>
          </div>

          {/* Service & Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <h4 className="font-medium text-gray-900">{booking.service.name}</h4>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <User className="h-4 w-4 mr-1" />
                <span>{booking.customer.name}</span>
                {booking.customer.phone && (
                  <>
                    <span className="mx-2">•</span>
                    <Phone className="h-4 w-4 mr-1" />
                    <a 
                      href={`tel:${booking.customer.phone}`}
                      className="text-teal-600 hover:text-teal-700"
                    >
                      {booking.customer.phone}
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {formatPrice(booking.totalAmount)}
              </div>
              {booking.hasReview && (
                <div className="flex items-center justify-end text-sm text-yellow-600">
                  <Star className="h-4 w-4 mr-1" />
                  <span>Review available</span>
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start text-sm text-gray-600 mb-3">
            <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
            <span className="break-all">{booking.serviceAddress}</span>
          </div>

          {/* Vehicle Info */}
          {booking.vehicleInfo && (
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <Car className="h-4 w-4 mr-1" />
              <span>
                {booking.vehicleInfo.year} {booking.vehicleInfo.make} {booking.vehicleInfo.model}
                {booking.vehicleInfo.color && ` (${booking.vehicleInfo.color})`}
                {booking.vehicleInfo.licensePlate && ` - ${booking.vehicleInfo.licensePlate}`}
              </span>
            </div>
          )}

          {/* Special Instructions */}
          {booking.specialInstructions && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <MessageSquare className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <h6 className="text-sm font-medium text-yellow-800 mb-1">Special Instructions</h6>
                  <p className="text-sm text-yellow-700">{booking.specialInstructions}</p>
                </div>
              </div>
            </div>
          )}

          {/* Expanded Details */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="ml-2 text-gray-900">{booking.service.category}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-start space-x-2 ml-4">
          {/* Action Buttons */}
          {availableActions.length > 0 && (
            <div className="flex space-x-2">
              {availableActions.slice(0, 2).map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleAction(action.id)}
                  disabled={actionLoading === action.id}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    action.color === 'green'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : action.color === 'blue'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : action.color === 'orange'
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  } disabled:opacity-50`}
                >
                  {actionLoading === action.id ? '...' : action.label}
                </button>
              ))}
            </div>
          )}

          {/* Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Warning for overdue bookings */}
      {isPastDue && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-sm text-red-700 font-medium">
              This appointment is overdue and requires immediate attention.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}