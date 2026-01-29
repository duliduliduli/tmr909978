"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-teal-500"></div>
              <h1 className="text-xl font-bold text-gray-900">Mobile Detailer</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/customer/home"
                className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 transition-colors"
              >
                Launch App
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Mobile Car Detailing
            <span className="block text-teal-500">Made Simple</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Find, book, and pay vetted mobile detailers in 60 seconds. Professional car detailing 
            that comes to you, whenever and wherever you need it.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/customer/home"
              className="rounded-lg bg-teal-500 px-8 py-3 text-base font-medium text-white hover:bg-teal-600 transition-colors transform hover:scale-105 inline-block text-center"
            >
              Book a Detail
            </Link>
            <Link 
              href="/detailer/home"
              className="rounded-lg border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors inline-block text-center"
            >
              Become a Detailer
            </Link>
          </div>
        </div>

        {/* App Preview */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Experience the App</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 max-w-sm">
              <div className="h-8 w-8 bg-blue-500 rounded-lg mb-4 mx-auto"></div>
              <h3 className="font-bold text-gray-900 mb-2">Customer Experience</h3>
              <p className="text-gray-600 text-sm mb-4">Browse detailers, track coins, book services</p>
              <Link 
                href="/customer/home"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors inline-block"
              >
                Try Customer App
              </Link>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 max-w-sm">
              <div className="h-8 w-8 bg-purple-500 rounded-lg mb-4 mx-auto"></div>
              <h3 className="font-bold text-gray-900 mb-2">Detailer Dashboard</h3>
              <p className="text-gray-600 text-sm mb-4">Manage services, coin rewards, bookings</p>
              <Link 
                href="/detailer/home"
                className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors inline-block"
              >
                Try Detailer App
              </Link>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-teal-50 rounded-xl border border-teal-200">
            <h4 className="font-semibold text-teal-800 mb-2">✨ Live Demo Features</h4>
            <ul className="text-sm text-teal-700 space-y-1">
              <li>• Switch between Customer and Detailer modes instantly</li>
              <li>• Interactive map with detailer pins</li>
              <li>• Coin wallet system with rewards tracking</li>
              <li>• Responsive design (mobile + desktop)</li>
              <li>• Seeded demo data - always looks alive!</li>
            </ul>
          </div>

          {/* NEW: Enterprise Booking System */}
          <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="text-center mb-6">
              <div className="h-12 w-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl mb-4 mx-auto flex items-center justify-center">
                <span className="text-white text-xl">🚀</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise Booking System</h3>
              <p className="text-gray-600">Production-ready booking platform with Stripe Connect, real-time scheduling, and state machine workflows</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-teal-600 mb-1">14</div>
                <div className="text-sm text-gray-600">Booking States</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">8.5%</div>
                <div className="text-sm text-gray-600">Platform Fee</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">100%</div>
                <div className="text-sm text-gray-600">TypeScript</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">✅ System Components</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                <div>• State Machine with Validation</div>
                <div>• Stripe Connect Marketplace</div>
                <div>• Smart Conflict Prevention</div>
                <div>• Real-time Notifications</div>
                <div>• GPS Service Area Validation</div>
                <div>• Comprehensive Analytics</div>
                <div>• Webhook Event Processing</div>
                <div>• Mobile-responsive UI</div>
              </div>
            </div>

            <div className="text-center">
              <a 
                href="/test-booking"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-medium rounded-lg hover:from-teal-600 hover:to-blue-600 transition-all transform hover:scale-105"
              >
                🧪 Test Booking System
              </a>
              <p className="text-xs text-gray-500 mt-2">Experience the full enterprise booking workflow</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}