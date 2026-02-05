"use client";

import { AppShell } from "@/components/AppShell";
import { Settings, Clock, MapPin, Package, QrCode, X, Camera, Edit3, Check } from "lucide-react";
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
type EditingField = 'name' | 'phone' | 'description' | null;

export default function DetailerAccountPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'services' | 'qrcode'>('profile');
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [workingHours, setWorkingHours] = useState(defaultHours);
  const [tempHours, setTempHours] = useState(defaultHours);
  const [businessName, setBusinessName] = useState('Premium Auto Spa');
  const [phone, setPhone] = useState('(323) 555-0101');
  const [description, setDescription] = useState('Professional mobile auto detailing service. We come to you!');
  const [profileImage, setProfileImage] = useState('/images/detailers/detailer-1.webp');

  // Editing states
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [tempValue, setTempValue] = useState('');

  const startEditing = (field: EditingField, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const saveField = () => {
    if (editingField === 'name') setBusinessName(tempValue);
    if (editingField === 'phone') setPhone(tempValue);
    if (editingField === 'description') setDescription(tempValue);
    setEditingField(null);
    setTempValue('');
  };

  const cancelEditing = () => {
    setEditingField(null);
    setTempValue('');
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
          Profile
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
          Pricing
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
        {/* Profile */}
        <div className="bg-brand-900 rounded-xl p-6 border border-brand-700">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Profile</h2>
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

            {/* Business Name */}
            <div className="border border-brand-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">Business Name</label>
                {editingField !== 'name' && (
                  <button
                    onClick={() => startEditing('name', businessName)}
                    className="flex items-center gap-1 text-sm text-accent-DEFAULT hover:text-accent-hover transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Change
                  </button>
                )}
              </div>
              {editingField === 'name' ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    autoFocus
                    className="w-full px-3 py-2 border border-accent-DEFAULT rounded-lg bg-brand-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={cancelEditing}
                      className="flex-1 px-3 py-1.5 bg-brand-800 hover:bg-brand-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveField}
                      className="flex-1 px-3 py-1.5 bg-accent-DEFAULT hover:bg-accent-hover text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Check className="h-4 w-4" />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-100 text-lg">{businessName}</p>
              )}
            </div>

            {/* Phone */}
            <div className="border border-brand-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">Phone Number</label>
                {editingField !== 'phone' && (
                  <button
                    onClick={() => startEditing('phone', phone)}
                    className="flex items-center gap-1 text-sm text-accent-DEFAULT hover:text-accent-hover transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Change
                  </button>
                )}
              </div>
              {editingField === 'phone' ? (
                <div className="space-y-2">
                  <input
                    type="tel"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    autoFocus
                    className="w-full px-3 py-2 border border-accent-DEFAULT rounded-lg bg-brand-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={cancelEditing}
                      className="flex-1 px-3 py-1.5 bg-brand-800 hover:bg-brand-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveField}
                      className="flex-1 px-3 py-1.5 bg-accent-DEFAULT hover:bg-accent-hover text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Check className="h-4 w-4" />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-100 text-lg">{phone}</p>
              )}
            </div>

            {/* Description */}
            <div className="border border-brand-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">Business Description</label>
                {editingField !== 'description' && (
                  <button
                    onClick={() => startEditing('description', description)}
                    className="flex items-center gap-1 text-sm text-accent-DEFAULT hover:text-accent-hover transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Change
                  </button>
                )}
              </div>
              {editingField === 'description' ? (
                <div className="space-y-2">
                  <textarea
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    rows={3}
                    autoFocus
                    maxLength={300}
                    className="w-full px-3 py-2 border border-accent-DEFAULT rounded-lg bg-brand-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT resize-none"
                  />
                  <p className="text-xs text-gray-500">{tempValue.length}/300 characters</p>
                  <div className="flex gap-2">
                    <button
                      onClick={cancelEditing}
                      className="flex-1 px-3 py-1.5 bg-brand-800 hover:bg-brand-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveField}
                      className="flex-1 px-3 py-1.5 bg-accent-DEFAULT hover:bg-accent-hover text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Check className="h-4 w-4" />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-100">{description || <span className="text-gray-500 italic">No description set</span>}</p>
              )}
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