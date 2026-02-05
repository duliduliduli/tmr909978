"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Edit3, Trash2, Plus, Home, Briefcase, Star, Car, X, HelpCircle, MessageCircle, FileText, Mail, Check } from "lucide-react";
import { mockCustomers, type Vehicle } from "@/lib/mockData";
import { useAppStore } from "@/lib/store";

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  postalCode?: string;
}

// Mock detailers data that matches the bottom sheet
const mockDetailers = [
  {
    id: '1',
    name: 'Alex\'s Premium Detailing',
    rating: 4.9,
    reviewCount: 234,
    distance: 2.3,
    profileImage: '/api/placeholder/60/60',
    specialties: ['Premium Wash', 'Ceramic Coating'],
    price: '$$$',
    availability: 'available' as const
  },
  {
    id: '2',
    name: 'Maria\'s Mobile Detail',
    rating: 4.7,
    reviewCount: 189,
    distance: 1.8,
    profileImage: '/api/placeholder/60/60',
    specialties: ['Interior Deep Clean', 'Paint Protection'],
    price: '$$',
    availability: 'available' as const
  },
  {
    id: '3',
    name: 'Elite Auto Spa',
    rating: 4.8,
    reviewCount: 156,
    distance: 3.2,
    profileImage: '/api/placeholder/60/60',
    specialties: ['Full Service', 'Wax & Polish'],
    price: '$$',
    availability: 'busy' as const
  },
  {
    id: '4',
    name: 'Quick Shine Mobile',
    rating: 4.5,
    reviewCount: 98,
    distance: 4.1,
    profileImage: '/api/placeholder/60/60',
    specialties: ['Express Wash', 'Interior Vacuum'],
    price: '$',
    availability: 'available' as const
  },
  {
    id: '5',
    name: 'Luxury Detail Co.',
    rating: 4.9,
    reviewCount: 287,
    distance: 5.2,
    profileImage: '/api/placeholder/60/60',
    specialties: ['Luxury Vehicles', 'Leather Treatment'],
    price: '$$$$',
    availability: 'offline' as const
  },
];

type EditingField = 'name' | 'email' | 'phone' | null;

export function CustomerAccount() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const { favoriteDetailers, removeFavoriteDetailer } = useAppStore();
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleFormData, setVehicleFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    plate: '',
    bodyType: 'car' as 'car' | 'suv' | 'truck' | 'van',
    isLuxury: false
  });

  // Profile fields
  const [customerName, setCustomerName] = useState('John Smith');
  const [customerEmail, setCustomerEmail] = useState('customer@test.com');
  const [customerPhone, setCustomerPhone] = useState('(555) 123-4567');

  // Editing states
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [tempValue, setTempValue] = useState('');

  const startEditing = (field: EditingField, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const saveField = () => {
    if (editingField === 'name') setCustomerName(tempValue);
    if (editingField === 'email') setCustomerEmail(tempValue);
    if (editingField === 'phone') setCustomerPhone(tempValue);
    setEditingField(null);
    setTempValue('');
  };

  const cancelEditing = () => {
    setEditingField(null);
    setTempValue('');
  };

  useEffect(() => {
    fetchAddresses();
    loadVehicles();
  }, []);

  const loadVehicles = () => {
    // Load mock vehicles for customer
    const customer = mockCustomers.find(c => c.id === "cust_1");
    if (customer) {
      setVehicles(customer.vehicles);
    }
    setLoading(false);
  };

  const openVehicleForm = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setVehicleFormData({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        plate: vehicle.plate,
        bodyType: vehicle.bodyType,
        isLuxury: vehicle.isLuxury
      });
    } else {
      setEditingVehicle(null);
      setVehicleFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        plate: '',
        bodyType: 'car',
        isLuxury: false
      });
    }
    setShowVehicleForm(true);
  };

  const closeVehicleForm = () => {
    setShowVehicleForm(false);
    setEditingVehicle(null);
  };

  const saveVehicle = async () => {
    if (!vehicleFormData.make || !vehicleFormData.model || !vehicleFormData.plate) {
      return;
    }

    if (editingVehicle) {
      // Update existing vehicle
      setVehicles(prev => prev.map(v => 
        v.id === editingVehicle.id 
          ? { ...editingVehicle, ...vehicleFormData }
          : v
      ));
    } else {
      // Add new vehicle
      const newVehicle: Vehicle = {
        id: `v_${Date.now()}`,
        ...vehicleFormData
      };
      setVehicles(prev => [...prev, newVehicle]);
    }

    closeVehicleForm();
  };

  const deleteVehicle = (vehicleId: string) => {
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
  };

  const fetchAddresses = async () => {
    try {
      const customerId = "cust_1"; // Mock customer ID
      const response = await fetch(`/api/customer/addresses?customerId=${customerId}`);
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const response = await fetch(`/api/customer/addresses/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setAddresses(prev => prev.filter(addr => addr.id !== id));
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const getAddressIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'home': return Home;
      case 'work': return Briefcase;
      default: return Star;
    }
  };

  const getAddressColor = (label: string) => {
    switch (label.toLowerCase()) {
      case 'home': return 'bg-green-600';
      case 'work': return 'bg-blue-600';
      default: return 'bg-purple-600';
    }
  };

  return (
    <div className="space-y-6 p-6 pb-24 lg:pb-6">
      {/* Profile Section */}
      <div className="bg-brand-900/50 border border-brand-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Profile</h2>
        <div className="space-y-4">
          {/* Name */}
          <div className="border border-brand-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-brand-200">Name</label>
              {editingField !== 'name' && (
                <button
                  onClick={() => startEditing('name', customerName)}
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
                  className="w-full px-3 py-2 border border-accent-DEFAULT rounded-lg bg-brand-800 text-white focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
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
              <p className="text-white text-lg">{customerName}</p>
            )}
          </div>

          {/* Email */}
          <div className="border border-brand-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-brand-200">Email</label>
              {editingField !== 'email' && (
                <button
                  onClick={() => startEditing('email', customerEmail)}
                  className="flex items-center gap-1 text-sm text-accent-DEFAULT hover:text-accent-hover transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Change
                </button>
              )}
            </div>
            {editingField === 'email' ? (
              <div className="space-y-2">
                <input
                  type="email"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-2 border border-accent-DEFAULT rounded-lg bg-brand-800 text-white focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
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
              <p className="text-white text-lg">{customerEmail}</p>
            )}
          </div>

          {/* Phone */}
          <div className="border border-brand-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-brand-200">Phone</label>
              {editingField !== 'phone' && (
                <button
                  onClick={() => startEditing('phone', customerPhone)}
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
                  className="w-full px-3 py-2 border border-accent-DEFAULT rounded-lg bg-brand-800 text-white focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
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
              <p className="text-white text-lg">{customerPhone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Vehicles Section */}
      <div className="bg-brand-900/50 border border-brand-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">My Vehicles</h2>
          <button 
            onClick={() => openVehicleForm()}
            className="flex items-center gap-2 px-4 py-2 bg-accent-DEFAULT hover:bg-accent-hover text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Vehicle
          </button>
        </div>
        
        {vehicles.length > 0 ? (
          <div className="space-y-3">
            {vehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-brand-800/50 rounded-lg border border-brand-700"
              >
                <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Car className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    {vehicle.isLuxury && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
                        Luxury
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-brand-400 mt-1">
                    <span>{vehicle.color}</span>
                    <span>•</span>
                    <span>{vehicle.plate}</span>
                    <span>•</span>
                    <span className="capitalize">{vehicle.bodyType}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => openVehicleForm(vehicle)}
                    className="p-2 hover:bg-brand-700 rounded-lg transition-colors"
                  >
                    <Edit3 className="h-4 w-4 text-brand-400 hover:text-white transition-colors" />
                  </button>
                  <button 
                    onClick={() => deleteVehicle(vehicle.id)}
                    className="p-2 hover:bg-brand-700 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-400 hover:text-red-300 transition-colors" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <div className="h-16 w-16 rounded-full bg-brand-800 flex items-center justify-center mx-auto">
              <Car className="h-8 w-8 text-brand-600" />
            </div>
            <p className="text-brand-400">No vehicles added yet</p>
            <button
              onClick={() => openVehicleForm()}
              className="text-sm text-accent-DEFAULT hover:text-accent-hover transition-colors"
            >
              Add your first vehicle
            </button>
          </div>
        )}
      </div>

      {/* Favorite Detailers Section */}
      <div className="bg-brand-900/50 border border-brand-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Favorite Detailers</h2>
          <span className="text-sm text-brand-400">{favoriteDetailers.length} saved</span>
        </div>
        
        {favoriteDetailers.length > 0 ? (
          <div className="space-y-3">
            {favoriteDetailers.map((detailerId, index) => {
              const detailer = mockDetailers.find(d => d.id === detailerId);
              if (!detailer) return null;
              
              return (
                <motion.div
                  key={detailer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-brand-800/50 rounded-lg border border-brand-700 hover:bg-brand-800/70 transition-colors"
                >
                  <img
                    src={detailer.profileImage}
                    alt={detailer.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{detailer.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-brand-400 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{detailer.rating}</span>
                      </div>
                      <span>•</span>
                      <span>({detailer.reviewCount})</span>
                      <span>•</span>
                      <span>{detailer.distance} mi</span>
                      <span>•</span>
                      <span className={`${
                        detailer.availability === 'available' ? 'text-green-400' :
                        detailer.availability === 'busy' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {detailer.availability === 'available' ? 'Available' :
                         detailer.availability === 'busy' ? 'Busy' : 'Offline'}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {detailer.specialties.slice(0, 2).map((specialty) => (
                        <span
                          key={specialty}
                          className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded-md"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFavoriteDetailer(detailer.id)}
                    className="p-2 hover:bg-brand-700 rounded-lg transition-colors"
                    title="Remove from favorites"
                  >
                    <Trash2 className="h-4 w-4 text-red-400 hover:text-red-300 transition-colors" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <div className="h-16 w-16 rounded-full bg-brand-800 flex items-center justify-center mx-auto">
              <Star className="h-8 w-8 text-brand-600" />
            </div>
            <p className="text-brand-400">No favorite detailers yet</p>
            <p className="text-sm text-brand-500">
              Heart detailers from the Map to add them to your favorites
            </p>
          </div>
        )}
      </div>

      {/* Saved Addresses Section */}
      <div className="bg-brand-900/50 border border-brand-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Saved Addresses</h2>
          <button className="text-accent-DEFAULT text-sm font-medium hover:text-accent-hover transition-colors">
            + Add New
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="text-brand-400">Loading addresses...</div>
          </div>
        ) : addresses.length > 0 ? (
          <div className="space-y-3">
            {addresses.map((address, index) => {
              const IconComponent = getAddressIcon(address.label);
              const colorClass = getAddressColor(address.label);
              
              return (
                <motion.div
                  key={address.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-brand-800/50 rounded-lg border border-brand-700"
                >
                  <div className={`h-10 w-10 rounded-lg ${colorClass} flex items-center justify-center text-white`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white capitalize">{address.label}</h3>
                    <p className="text-sm text-brand-400 mt-1">{address.address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-brand-700 rounded-lg transition-colors">
                      <Edit3 className="h-4 w-4 text-brand-400 hover:text-white transition-colors" />
                    </button>
                    <button 
                      onClick={() => deleteAddress(address.id)}
                      className="p-2 hover:bg-brand-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-400 hover:text-red-300 transition-colors" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <div className="h-16 w-16 rounded-full bg-brand-800 flex items-center justify-center mx-auto">
              <MapPin className="h-8 w-8 text-brand-600" />
            </div>
            <p className="text-brand-400">No saved addresses yet</p>
            <p className="text-sm text-brand-500">
              Add addresses from the Home screen for quick access
            </p>
          </div>
        )}
      </div>

      {/* Help & Support Section */}
      <div className="bg-brand-900/50 border border-brand-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center">
            <HelpCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Help & Support</h2>
            <p className="text-sm text-brand-400">Get assistance when you need it</p>
          </div>
        </div>

        <div className="space-y-2">
          <button className="w-full flex items-center gap-4 p-4 bg-brand-800/50 hover:bg-brand-800 rounded-lg border border-brand-700 transition-colors text-left">
            <div className="h-10 w-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white">FAQs</h3>
              <p className="text-sm text-brand-400">Find answers to common questions</p>
            </div>
          </button>

          <button className="w-full flex items-center gap-4 p-4 bg-brand-800/50 hover:bg-brand-800 rounded-lg border border-brand-700 transition-colors text-left">
            <div className="h-10 w-10 rounded-lg bg-green-600/20 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white">Live Chat Support</h3>
              <p className="text-sm text-brand-400">Chat with our support team</p>
            </div>
          </button>

          <button className="w-full flex items-center gap-4 p-4 bg-brand-800/50 hover:bg-brand-800 rounded-lg border border-brand-700 transition-colors text-left">
            <div className="h-10 w-10 rounded-lg bg-amber-600/20 flex items-center justify-center">
              <Mail className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white">Email Support</h3>
              <p className="text-sm text-brand-400">support@tumaro.com</p>
            </div>
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-brand-800">
          <p className="text-xs text-brand-500 text-center">
            Need urgent help? Call us at (555) 123-WASH
          </p>
        </div>
      </div>

      {/* Vehicle Form Modal */}
      <AnimatePresence>
        {showVehicleForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeVehicleForm}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
              className="bg-brand-950 border border-brand-800 rounded-2xl p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
                </h2>
                <button
                  onClick={closeVehicleForm}
                  className="p-2 hover:bg-brand-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-brand-400" />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-200 mb-2">
                      Year
                    </label>
                    <select
                      value={vehicleFormData.year}
                      onChange={(e) => setVehicleFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 bg-brand-900 border border-brand-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT focus:border-transparent"
                    >
                      {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-200 mb-2">
                      Make
                    </label>
                    <input
                      type="text"
                      value={vehicleFormData.make}
                      onChange={(e) => setVehicleFormData(prev => ({ ...prev, make: e.target.value }))}
                      placeholder="Toyota, BMW, etc."
                      className="w-full px-4 py-3 bg-brand-900 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-200 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    value={vehicleFormData.model}
                    onChange={(e) => setVehicleFormData(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="Camry, X5, Model 3, etc."
                    className="w-full px-4 py-3 bg-brand-900 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-200 mb-2">
                      Color
                    </label>
                    <input
                      type="text"
                      value={vehicleFormData.color}
                      onChange={(e) => setVehicleFormData(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="White, Black, etc."
                      className="w-full px-4 py-3 bg-brand-900 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-200 mb-2">
                      License Plate
                    </label>
                    <input
                      type="text"
                      value={vehicleFormData.plate}
                      onChange={(e) => setVehicleFormData(prev => ({ ...prev, plate: e.target.value.toUpperCase() }))}
                      placeholder="ABC123"
                      className="w-full px-4 py-3 bg-brand-900 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-200 mb-2">
                    Body Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['car', 'suv', 'truck', 'van'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setVehicleFormData(prev => ({ ...prev, bodyType: type }))}
                        className={`p-3 rounded-lg border text-left text-sm transition-all ${
                          vehicleFormData.bodyType === type
                            ? 'border-accent-DEFAULT bg-accent-DEFAULT/20 text-accent-DEFAULT'
                            : 'border-brand-700 hover:border-brand-600 text-brand-300'
                        }`}
                      >
                        <div className="font-medium capitalize">{type}</div>
                        <div className="text-xs text-brand-500">
                          {type === 'car' ? 'Standard' : 
                           type === 'suv' ? '+25%' :
                           type === 'truck' ? '+40%' : '+50%'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Luxury Vehicle Checkbox */}
                <div>
                  <label className="flex items-center gap-3 p-4 border border-brand-700 rounded-lg hover:bg-brand-900/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={vehicleFormData.isLuxury}
                      onChange={(e) => setVehicleFormData(prev => ({ ...prev, isLuxury: e.target.checked }))}
                      className="w-4 h-4 text-accent-DEFAULT border-brand-600 rounded focus:ring-accent-DEFAULT bg-brand-900"
                    />
                    <div>
                      <div className="text-sm font-medium text-white">Luxury Vehicle</div>
                      <div className="text-xs text-brand-500">
                        High-end, classic, or premium vehicles requiring special care
                      </div>
                    </div>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={closeVehicleForm}
                    className="flex-1 px-4 py-3 bg-brand-800 hover:bg-brand-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveVehicle}
                    disabled={!vehicleFormData.make || !vehicleFormData.model || !vehicleFormData.plate}
                    className="flex-1 px-4 py-3 bg-accent-DEFAULT hover:bg-accent-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingVehicle ? 'Update' : 'Add'} Vehicle
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}