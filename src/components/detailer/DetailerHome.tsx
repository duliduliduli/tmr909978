"use client";

import { mockBookings } from "@/lib/mockData";
import { Calendar, Plus, QrCode, Settings, DollarSign, Clock } from "lucide-react";

export function DetailerHome() {
  const todaysBookings = mockBookings.filter(b => 
    new Date(b.scheduledFor).toDateString() === new Date().toDateString()
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Good morning, Mike!</h1>
        <p className="text-teal-100 mb-4">You have {todaysBookings.length} appointments today</p>
        <div className="flex items-center gap-4 text-teal-100">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm">$240 today</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span className="text-sm">4.5 hrs booked</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow text-left">
          <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
            <Plus className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Add Service</h3>
          <p className="text-sm text-gray-600">Create new service offering</p>
        </button>
        <button className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow text-left">
          <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
            <QrCode className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Share QR Code</h3>
          <p className="text-sm text-gray-600">Get more customers</p>
        </button>
      </div>

      {/* Today's Schedule */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Today's Schedule</h2>
          <button className="text-teal-600 text-sm font-medium flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            View Calendar
          </button>
        </div>
        
        {todaysBookings.length > 0 ? (
          <div className="space-y-3">
            {todaysBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">Full Detail Service</div>
                    <div className="text-sm text-gray-600">Customer: John Doe</div>
                    <div className="text-sm text-gray-600">{booking.address}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">${booking.total}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(booking.scheduledFor).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-teal-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors">
                    Start Service
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">No appointments today</h3>
            <p className="text-sm text-gray-600 mb-4">Share your QR code to get more bookings!</p>
            <button className="bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors">
              Share QR Code
            </button>
          </div>
        )}
      </div>

      {/* Performance Stats */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">This Week</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">$1,240</div>
                <div className="text-sm text-gray-600">Revenue</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">12</div>
                <div className="text-sm text-gray-600">Services</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Settings */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Available for bookings</h3>
            <p className="text-sm text-gray-600">Customers can book your services</p>
          </div>
          <button className="bg-teal-500 w-12 h-6 rounded-full relative">
            <div className="bg-white w-5 h-5 rounded-full absolute right-0.5 top-0.5"></div>
          </button>
        </div>
      </div>
    </div>
  );
}