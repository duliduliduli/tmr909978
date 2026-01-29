"use client";

import { Star, Clock, Phone, X } from 'lucide-react';

interface DetailerDrawerProps {
  detailer: {
    id: string;
    name: string;
    businessName: string;
    rating: number;
    reviewCount: number;
    distance?: number;
    coin: {
      name: string;
      iconColor: string;
      earnRate: number;
      redemptionValue: number;
    };
    phone: string;
    hours: string;
    services: Array<{
      id: string;
      name: string;
      description: string;
      price: number;
      duration: number;
      category: string;
    }>;
  };
  onClose: () => void;
  onBookService: () => void;
}

export function DetailerDrawer({ detailer, onClose, onBookService }: DetailerDrawerProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl border-t border-gray-200 p-4 z-40 max-h-[60vh] overflow-y-auto shadow-xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{detailer.businessName}</h3>
          <p className="text-gray-600">{detailer.name}</p>
          {detailer.distance && (
            <p className="text-sm text-teal-600 font-medium">{detailer.distance.toFixed(1)} miles away</p>
          )}
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Rating and Hours */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="font-medium">{detailer.rating}</span>
          <span className="text-sm text-gray-500">({detailer.reviewCount} reviews)</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{detailer.hours}</span>
        </div>
      </div>

      {/* Coin Info */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: detailer.coin.iconColor }}
          />
          <span className="font-medium text-gray-900">{detailer.coin.name}</span>
        </div>
        <div className="text-sm text-gray-600">
          Earn {detailer.coin.earnRate}x coins • ${detailer.coin.redemptionValue.toFixed(2)} per coin
        </div>
      </div>

      {/* Services */}
      <div className="space-y-3 mb-6">
        <h4 className="font-semibold text-gray-900">Popular Services</h4>
        {detailer.services.map((service) => (
          <div 
            key={service.id} 
            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
          >
            <div className="flex-1">
              <div className="font-medium text-gray-900">{service.name}</div>
              <div className="text-sm text-gray-600 mb-1">{service.description}</div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{service.duration} min</span>
                <span className="px-2 py-1 bg-gray-100 rounded-full">{service.category}</span>
              </div>
            </div>
            <div className="text-right ml-4">
              <div className="font-bold text-teal-600 text-lg">${service.price}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button 
          onClick={onBookService}
          className="flex-1 bg-teal-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-600 transition-colors"
        >
          Book Service
        </button>
        <button className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          <Phone className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}