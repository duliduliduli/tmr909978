"use client";

import { AppShell } from "@/components/AppShell";
import { Settings, Clock, MapPin, Package, QrCode, X, Camera } from "lucide-react";
import { ServiceManager } from "@/components/detailer/ServiceManager";
import { QRCodeManager } from "@/components/detailer/QRCodeManager";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const defaultHours = {
  monday: { open: '08:00', close: '18:00', closed: false },
  tuesday: { open: '08:00', close: '18:00', closed: false },
  wednesday: { open: '08:00', close: '18:00', closed: false },
  thursday: { open: '08:00', close: '18:00', closed: false },
  friday: { open: '08:00', close: '18:00', closed: false },
  saturday: { open: '09:00', close: '17:00', closed: false },
  sunday: { open: '10:00', close: '16:00', closed: true },
};

type DayKey = keyof typeof defaultHours;

export default function DetailerAccountPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'services' | 'qrcode'>('profile');
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [workingHours, setWorkingHours] = useState(defaultHours);
  const [tempHours, setTempHours] = useState(defaultHours);
  const [businessName, setBusinessName] = useState('Premium Auto Spa');
  const [phone, setPhone] = useState('(323) 555-0101');
  const [description, setDescription] = useState('Professional mobile auto detailing service. We come to you!');
  const [profileImage, setProfileImage] = useState('/images/detailers/detailer-1.webp');

  const formatHoursDisplay = () => {
    const days = Object.entries(workingHours);
    const openDays = days.filter(([_, h]) => !h.closed);
    if (openDays.length === 0) return 'Closed';

    // Check if all open days have same hours
    const firstOpen = openDays[0][1];
    const allSame = openDays.every(([_, h]) => h.open === firstOpen.open && h.close === firstOpen.close);

    if (allSame) {
      const dayNames = openDays.map(([d]) => d.charAt(0).toUpperCase() + d.slice(1, 3));
      return `${dayNames[0]}-${dayNames[dayNames.length - 1]} ${firstOpen.open.replace(':00', 'AM').replace(':', ':')}-${firstOpen.close.replace(':00', 'PM').replace(':', ':')}`;
    }
    return 'Custom hours set';
  };

  const handleSaveHours = () => {
    setWorkingHours(tempHours);
    setShowHoursModal(false);
  };

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
        {/* Business Profile */}
        <div className="bg-brand-900 rounded-xl p-6 border border-brand-700">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Business Profile</h2>
          <div className="space-y-4">
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Profile Picture</label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={profileImage}
                    alt="Business profile"
                    className="w-20 h-20 rounded-xl object-cover border-2 border-brand-700"
                  />
                  <label className="absolute -bottom-2 -right-2 p-2 bg-accent-DEFAULT hover:bg-accent-hover rounded-full cursor-pointer transition-colors">
                    <Camera className="h-4 w-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProfileImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                <div className="text-sm text-gray-400">
                  Click the camera icon to upload a new profile picture
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 border border-brand-700 rounded-lg bg-brand-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-brand-700 rounded-lg bg-brand-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Business Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe your business and services..."
                className="w-full px-3 py-2 border border-brand-700 rounded-lg bg-brand-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{description.length}/300 characters</p>
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-brand-900 rounded-xl p-6 border border-brand-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <h2 className="text-xl font-bold text-gray-100">Working Hours</h2>
            </div>
            <button
              onClick={() => {
                setTempHours(workingHours);
                setShowHoursModal(true);
              }}
              className="text-teal-400 text-sm font-medium hover:text-teal-300 transition-colors"
            >
              Edit Hours
            </button>
          </div>
          <div className="space-y-2">
            {Object.entries(workingHours).map(([day, hours]) => (
              <div key={day} className="flex items-center justify-between text-sm">
                <span className="text-gray-300 capitalize w-24">{day}</span>
                <span className={hours.closed ? 'text-red-400' : 'text-gray-100'}>
                  {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Working Hours Modal */}
        <AnimatePresence>
          {showHoursModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => setShowHoursModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-brand-950 border border-brand-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-4 border-b border-brand-800 flex items-center justify-between">
                  <h3 className="font-bold text-white text-lg">Edit Working Hours</h3>
                  <button
                    onClick={() => setShowHoursModal(false)}
                    className="p-2 hover:bg-brand-800 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-brand-400" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-4 overflow-y-auto flex-1 space-y-3">
                  {(Object.keys(tempHours) as DayKey[]).map((day) => (
                    <div key={day} className="bg-brand-900 rounded-lg p-3 border border-brand-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white capitalize">{day}</span>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <span className="text-sm text-brand-400">Closed</span>
                          <input
                            type="checkbox"
                            checked={tempHours[day].closed}
                            onChange={(e) => setTempHours(prev => ({
                              ...prev,
                              [day]: { ...prev[day], closed: e.target.checked }
                            }))}
                            className="w-4 h-4 rounded border-brand-600 bg-brand-800 text-accent-DEFAULT focus:ring-accent-DEFAULT"
                          />
                        </label>
                      </div>
                      {!tempHours[day].closed && (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={tempHours[day].open}
                            onChange={(e) => setTempHours(prev => ({
                              ...prev,
                              [day]: { ...prev[day], open: e.target.value }
                            }))}
                            className="flex-1 px-2 py-1.5 bg-brand-800 border border-brand-700 rounded text-white text-sm"
                          />
                          <span className="text-brand-500">to</span>
                          <input
                            type="time"
                            value={tempHours[day].close}
                            onChange={(e) => setTempHours(prev => ({
                              ...prev,
                              [day]: { ...prev[day], close: e.target.value }
                            }))}
                            className="flex-1 px-2 py-1.5 bg-brand-800 border border-brand-700 rounded text-white text-sm"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-brand-800 flex gap-3">
                  <button
                    onClick={() => setShowHoursModal(false)}
                    className="flex-1 px-4 py-2 bg-brand-800 hover:bg-brand-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveHours}
                    className="flex-1 px-4 py-2 bg-accent-DEFAULT hover:bg-accent-hover text-white rounded-lg transition-colors"
                  >
                    Save Hours
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      ) : activeTab === 'services' ? (
        <ServiceManager />
      ) : (
        <QRCodeManager />
      )}
    </AppShell>
  );
}