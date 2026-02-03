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
      <div className="flex gap-2 mb-6 border-b border-brand-700">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'profile'
              ? 'text-white border-white'
              : 'text-gray-400 border-transparent hover:text-gray-200'
          }`}
        >
          Business Profile
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'services'
              ? 'text-white border-white'
              : 'text-gray-400 border-transparent hover:text-gray-200'
          }`}
        >
          <Package className="h-4 w-4" />
          Services & Pricing
        </button>
        <button
          onClick={() => setActiveTab('qrcode')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'qrcode'
              ? 'text-white border-white'
              : 'text-gray-400 border-transparent hover:text-gray-200'
          }`}
        >
          <QrCode className="h-4 w-4" />
          QR Code
        </button>
      </div>

      {activeTab === 'profile' ? (
        <div className="space-y-6">
        <div className="bg-brand-900 rounded-xl p-6 border border-brand-700">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Business Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Business Name</label>
              <input type="text" value="Premium Auto Spa" className="w-full px-3 py-2 border border-brand-700 rounded-lg bg-brand-800 text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
              <input type="text" value="(323) 555-0101" className="w-full px-3 py-2 border border-brand-700 rounded-lg bg-brand-800 text-gray-100" />
            </div>
          </div>
        </div>

        <div className="bg-brand-900 rounded-xl p-6 border border-brand-700">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-5 w-5 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-100">Working Hours</h2>
          </div>
          <div className="text-gray-300">Mon-Sat 8AM-6PM</div>
          <button className="mt-3 text-teal-400 text-sm font-medium">Edit Hours</button>
        </div>

        <div className="bg-brand-900 rounded-xl p-6 border border-brand-700">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="h-5 w-5 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-100">Service Area</h2>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Location Privacy (Scatter)</span>
              <button className="bg-teal-500 w-12 h-6 rounded-full relative">
                <div className="bg-white w-5 h-5 rounded-full absolute right-0.5 top-0.5"></div>
              </button>
            </div>
            <p className="text-sm text-gray-400">Your exact location will be scattered for privacy</p>
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