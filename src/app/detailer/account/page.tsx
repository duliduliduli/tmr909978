"use client";

import { AppShell } from "@/components/AppShell";
import { Settings, Clock, MapPin, Package, QrCode } from "lucide-react";
import { ServiceManager } from "@/components/detailer/ServiceManager";
import { QRCodeManager } from "@/components/detailer/QRCodeManager";
import { useState } from "react";

export default function DetailerAccountPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'services' | 'qrcode'>('profile');

  return (
    <AppShell title="Business Settings">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'profile'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          Business Profile
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'services'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          <Package className="h-4 w-4" />
          Services & Pricing
        </button>
        <button
          onClick={() => setActiveTab('qrcode')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'qrcode'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          <QrCode className="h-4 w-4" />
          QR Code
        </button>
      </div>

      {activeTab === 'profile' ? (
        <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Business Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input type="text" value="Premium Auto Spa" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value="(323) 555-0101" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Working Hours</h2>
          </div>
          <div className="text-gray-600">Mon-Sat 8AM-6PM</div>
          <button className="mt-3 text-teal-600 text-sm font-medium">Edit Hours</button>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Service Area</h2>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Location Privacy (Scatter)</span>
              <button className="bg-teal-500 w-12 h-6 rounded-full relative">
                <div className="bg-white w-5 h-5 rounded-full absolute right-0.5 top-0.5"></div>
              </button>
            </div>
            <p className="text-sm text-gray-600">Your exact location will be scattered for privacy</p>
          </div>
        </div>
      </div>
      ) : activeTab === 'services' ? (
        <ServiceManager />
      ) : (
        <QRCodeManager />
      )}
    </AppShell>
  );
}