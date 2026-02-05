"use client";

import { useState } from 'react';
import { Plus, Edit2, Trash2, DollarSign, Clock, ToggleLeft, ToggleRight, Save, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, Service, DEFAULT_BODY_TYPE_MULTIPLIERS } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';

export function ServiceManager() {
  const { t } = useTranslation();

  const BODY_TYPE_LABELS: Record<string, string> = {
    car: t('customerAccount.car'),
    van: t('customerAccount.van'),
    truck: t('customerAccount.truck'),
    suv: t('customerAccount.suv'),
  };

  const {
    activeDetailerId,
    services,
    addService,
    updateService,
    deleteService,
    toggleServiceActive,
    getServicesByDetailer
  } = useAppStore();

  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    duration: '30',
    category: 'Exterior',
    bodyTypeMultipliers: { ...DEFAULT_BODY_TYPE_MULTIPLIERS },
    luxuryCareSurchargePercent: 0,
  });
  const [editForm, setEditForm] = useState<Partial<Service>>({});

  const detailerServices = getServicesByDetailer(activeDetailerId);

  const categories = ['Exterior', 'Interior', 'Premium', 'Specialty', 'Add-on'];

  const handleAddService = () => {
    if (!newService.name || !newService.description || !newService.price) {
      alert('Please fill in all required fields');
      return;
    }

    addService({
      detailerId: activeDetailerId,
      name: newService.name,
      description: newService.description,
      price: parseFloat(newService.price),
      duration: parseInt(newService.duration),
      category: newService.category,
      isActive: true,
      bodyTypeMultipliers: newService.bodyTypeMultipliers,
      luxuryCareSurchargePercent: newService.luxuryCareSurchargePercent,
    });

    // Reset form
    setNewService({
      name: '',
      description: '',
      price: '',
      duration: '30',
      category: 'Exterior',
      bodyTypeMultipliers: { ...DEFAULT_BODY_TYPE_MULTIPLIERS },
      luxuryCareSurchargePercent: 0,
    });
    setIsAddingService(false);
  };

  const handleUpdateService = (serviceId: string) => {
    if (!editForm.name || !editForm.description || editForm.price === undefined) {
      alert('Please fill in all required fields');
      return;
    }

    updateService(serviceId, {
      name: editForm.name,
      description: editForm.description,
      price: editForm.price,
      duration: editForm.duration,
      category: editForm.category,
      bodyTypeMultipliers: editForm.bodyTypeMultipliers,
      luxuryCareSurchargePercent: editForm.luxuryCareSurchargePercent,
    });

    setEditingService(null);
    setEditForm({});
  };

  const handleDeleteService = (serviceId: string) => {
    if (confirm(t('serviceManager.deleteConfirm'))) {
      deleteService(serviceId);
    }
  };

  const startEditing = (service: Service) => {
    setEditingService(service.id);
    setEditForm({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category,
      bodyTypeMultipliers: service.bodyTypeMultipliers ? { ...service.bodyTypeMultipliers } : { ...DEFAULT_BODY_TYPE_MULTIPLIERS },
      luxuryCareSurchargePercent: service.luxuryCareSurchargePercent ?? 0,
    });
  };

  const BodyTypeMultiplierFields = ({
    multipliers,
    onChange,
  }: {
    multipliers: { car: number; van: number; truck: number; suv: number };
    onChange: (updated: { car: number; van: number; truck: number; suv: number }) => void;
  }) => (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-300 mb-1">
        {t('serviceManager.bodyTypeMultipliers')}
      </label>
      <p className="text-xs text-gray-500 mb-3">
        {t('serviceManager.multiplierDesc')}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(['car', 'van', 'truck', 'suv'] as const).map((type) => (
          <div key={type} className="bg-brand-800 border border-brand-600 rounded-lg p-3">
            <label className="block text-xs text-gray-400 mb-1">{BODY_TYPE_LABELS[type]}</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={multipliers[type]}
                onChange={(e) =>
                  onChange({
                    ...multipliers,
                    [type]: parseFloat(e.target.value) || 1.0,
                  })
                }
                step="0.05"
                min="0.5"
                max="3.0"
                className="w-full px-2 py-1.5 border border-brand-600 rounded bg-brand-900 text-gray-100 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <span className="text-xs text-gray-500">x</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const LuxuryCareField = ({
    value,
    onChange,
  }: {
    value: number;
    onChange: (v: number) => void;
  }) => (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-300 mb-1">
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-amber-400" />
          {t('serviceManager.luxuryCareSurcharge')}
        </span>
      </label>
      <p className="text-xs text-gray-500 mb-2">
        {t('serviceManager.luxuryCareDesc')}
      </p>
      <div className="relative w-32">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          min="0"
          max="100"
          className="w-full px-3 py-2 border border-brand-600 rounded-lg bg-brand-900 text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">{t('serviceManager.serviceManagement')}</h2>
          <p className="text-gray-400 mt-1">{t('serviceManager.addManageServices')}</p>
        </div>
        <button
          onClick={() => setIsAddingService(true)}
          className="bg-teal-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          {t('serviceManager.addService')}
        </button>
      </div>

      {/* Add Service Form */}
      <AnimatePresence>
        {isAddingService && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-brand-800 border border-brand-700 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-gray-100 mb-4">{t('serviceManager.addNewService')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {t('serviceManager.serviceName')} *
                </label>
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="e.g., Premium Wash"
                  className="w-full px-3 py-2 border border-brand-600 rounded-lg bg-brand-900 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {t('serviceManager.category')}
                </label>
                <select
                  value={newService.category}
                  onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                  className="w-full px-3 py-2 border border-brand-600 rounded-lg bg-brand-900 text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {t('serviceManager.price')} *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-10 pr-3 py-2 border border-brand-600 rounded-lg bg-brand-900 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {t('serviceManager.duration')}
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="number"
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                    placeholder="30"
                    min="15"
                    step="15"
                    className="w-full pl-10 pr-3 py-2 border border-brand-600 rounded-lg bg-brand-900 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {t('serviceManager.description')} *
                </label>
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  placeholder="Describe what this service includes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-brand-600 rounded-lg bg-brand-900 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Body Type Multipliers */}
              <BodyTypeMultiplierFields
                multipliers={newService.bodyTypeMultipliers}
                onChange={(updated) => setNewService({ ...newService, bodyTypeMultipliers: updated })}
              />

              {/* Luxury Care Surcharge */}
              <LuxuryCareField
                value={newService.luxuryCareSurchargePercent}
                onChange={(v) => setNewService({ ...newService, luxuryCareSurchargePercent: v })}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsAddingService(false)}
                className="px-4 py-2 text-gray-300 bg-brand-900 border border-brand-600 rounded-lg hover:bg-brand-800 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleAddService}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {t('serviceManager.addService')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Services List */}
      <div className="space-y-4">
        {detailerServices.length === 0 ? (
          <div className="text-center py-12 bg-brand-900 rounded-xl border border-brand-700">
            <div className="w-16 h-16 bg-brand-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-200 mb-2">{t('serviceManager.noServicesYet')}</h3>
            <p className="text-gray-400">{t('serviceManager.addFirstService')}</p>
          </div>
        ) : (
          detailerServices.map((service) => (
            <motion.div
              key={service.id}
              layout
              className={`bg-brand-900 border border-brand-700 rounded-xl p-6 ${
                !service.isActive ? 'opacity-60' : ''
              }`}
            >
              {editingService === service.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        {t('serviceManager.serviceName')}
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-brand-600 rounded-lg bg-brand-800 text-gray-100 focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        {t('serviceManager.category')}
                      </label>
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="w-full px-3 py-2 border border-brand-600 rounded-lg bg-brand-800 text-gray-100 focus:ring-2 focus:ring-teal-500"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        {t('serviceManager.price')}
                      </label>
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-brand-600 rounded-lg bg-brand-800 text-gray-100 focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        {t('serviceManager.duration')}
                      </label>
                      <input
                        type="number"
                        value={editForm.duration}
                        onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) })}
                        min="15"
                        step="15"
                        className="w-full px-3 py-2 border border-brand-600 rounded-lg bg-brand-800 text-gray-100 focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        {t('serviceManager.description')}
                      </label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-brand-600 rounded-lg bg-brand-800 text-gray-100 focus:ring-2 focus:ring-teal-500 resize-none"
                      />
                    </div>

                    {/* Body Type Multipliers - Edit Mode */}
                    <BodyTypeMultiplierFields
                      multipliers={editForm.bodyTypeMultipliers || { ...DEFAULT_BODY_TYPE_MULTIPLIERS }}
                      onChange={(updated) => setEditForm({ ...editForm, bodyTypeMultipliers: updated })}
                    />

                    {/* Luxury Care Surcharge - Edit Mode */}
                    <LuxuryCareField
                      value={editForm.luxuryCareSurchargePercent ?? 0}
                      onChange={(v) => setEditForm({ ...editForm, luxuryCareSurchargePercent: v })}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setEditingService(null);
                        setEditForm({});
                      }}
                      className="px-4 py-2 text-gray-300 bg-brand-900 border border-brand-600 rounded-lg hover:bg-brand-800"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={() => handleUpdateService(service.id)}
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {t('serviceManager.saveChanges')}
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                          {service.name}
                          {service.category && (
                            <span className="text-xs bg-brand-800 text-gray-300 px-2 py-1 rounded-full border border-brand-600">
                              {service.category}
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-400 mt-1">{service.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-xl font-bold text-gray-100">${service.price}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-300">{service.duration} min</span>
                      </div>
                      <button
                        onClick={() => toggleServiceActive(service.id)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          service.isActive
                            ? 'bg-green-900/40 text-green-400 hover:bg-green-900/60 border border-green-700/50'
                            : 'bg-brand-800 text-gray-400 hover:bg-brand-700 border border-brand-600'
                        }`}
                      >
                        {service.isActive ? (
                          <>
                            <ToggleRight className="h-4 w-4" />
                            {t('serviceManager.active')}
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-4 w-4" />
                            {t('serviceManager.inactive')}
                          </>
                        )}
                      </button>
                    </div>

                    {/* Body Type Multipliers & Luxury Care Display */}
                    {service.bodyTypeMultipliers && (
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {(['car', 'van', 'truck', 'suv'] as const).map((type) => (
                          <span key={type} className="text-xs text-gray-500 bg-brand-800 px-2 py-0.5 rounded border border-brand-700">
                            {BODY_TYPE_LABELS[type]}: {service.bodyTypeMultipliers[type]}x
                          </span>
                        ))}
                        {service.luxuryCareSurchargePercent > 0 && (
                          <span className="text-xs text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded border border-amber-700/50 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Luxury: +{service.luxuryCareSurchargePercent}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => startEditing(service)}
                      className="p-2 text-gray-400 hover:text-gray-200 hover:bg-brand-800 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {detailerServices.length > 0 && (
        <div className="bg-brand-900 border border-brand-700 rounded-xl p-6 grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-400">{t('serviceManager.totalServices')}</p>
            <p className="text-2xl font-bold text-gray-100">{detailerServices.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">{t('serviceManager.activeServices')}</p>
            <p className="text-2xl font-bold text-green-400">
              {detailerServices.filter(s => s.isActive).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">{t('serviceManager.averagePrice')}</p>
            <p className="text-2xl font-bold text-gray-100">
              ${(detailerServices.reduce((sum, s) => sum + s.price, 0) / detailerServices.length).toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
