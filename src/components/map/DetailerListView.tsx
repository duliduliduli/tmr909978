"use client";

import { Star, Clock, MapPin, Filter } from 'lucide-react';
import { useState } from 'react';

interface DetailerData {
  id: string;
  name: string;
  businessName: string;
  rating: number;
  reviewCount: number;
  distance: number;
  hours: string;
  services: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number;
    category: string;
  }>;
  coin: {
    name: string;
    iconColor: string;
    earnRate: number;
    redemptionValue: number;
  };
  estimatedArrival?: string;
  isAvailable: boolean;
}

interface DetailerListViewProps {
  detailers: DetailerData[];
  onDetailerSelect: (detailer: DetailerData) => void;
  onBookService: (detailer: DetailerData) => void;
  userLocation?: [number, number];
}

type SortOption = 'distance' | 'rating' | 'price' | 'availability';

export function DetailerListView({ 
  detailers, 
  onDetailerSelect, 
  onBookService,
  userLocation 
}: DetailerListViewProps) {
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique categories
  const categories = ['all', ...new Set(
    detailers.flatMap(d => d.services.map(s => s.category))
  )];

  // Filter and sort detailers
  const filteredDetailers = detailers
    .filter(detailer => {
      if (selectedCategory === 'all') return true;
      return detailer.services.some(service => service.category === selectedCategory);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          const aMinPrice = Math.min(...a.services.map(s => s.price));
          const bMinPrice = Math.min(...b.services.map(s => s.price));
          return aMinPrice - bMinPrice;
        case 'availability':
          if (a.isAvailable && !b.isAvailable) return -1;
          if (!a.isAvailable && b.isAvailable) return 1;
          return a.distance - b.distance;
        default:
          return 0;
      }
    });

  return (
    <div className="bg-white h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Nearby Detailers</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="distance">Distance</option>
                <option value="rating">Rating</option>
                <option value="price">Price (Low to High)</option>
                <option value="availability">Availability</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600 mt-2">
          Found {filteredDetailers.length} detailers within 25 miles
        </div>
      </div>

      {/* Detailer List */}
      <div className="flex-1 overflow-y-auto">
        {filteredDetailers.length === 0 ? (
          <div className="p-8 text-center">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No detailers found</h3>
            <p className="text-gray-600">Try adjusting your filters or expanding your search area.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredDetailers.map((detailer) => (
              <div 
                key={detailer.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onDetailerSelect(detailer)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{detailer.businessName}</h3>
                    <p className="text-sm text-gray-600">{detailer.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{detailer.rating}</span>
                      <span className="text-xs text-gray-500">({detailer.reviewCount})</span>
                    </div>
                    <div className="text-sm font-medium text-teal-600">
                      {detailer.distance.toFixed(1)} mi
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-4 mb-3">
                  <div className={`flex items-center gap-1 text-sm ${
                    detailer.isAvailable ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      detailer.isAvailable ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    {detailer.isAvailable ? 'Available' : 'Busy'}
                  </div>
                  
                  {detailer.estimatedArrival && detailer.isAvailable && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {detailer.estimatedArrival} arrival
                    </div>
                  )}
                </div>

                {/* Coin Info */}
                <div className="flex items-center gap-2 mb-3">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: detailer.coin.iconColor }}
                  />
                  <span className="text-xs text-gray-600">
                    Earn {detailer.coin.earnRate}x {detailer.coin.name} coins
                  </span>
                </div>

                {/* Popular Services */}
                <div className="mb-3">
                  <div className="text-sm text-gray-900 font-medium mb-2">Popular Services</div>
                  <div className="space-y-1">
                    {detailer.services.slice(0, 2).map((service) => (
                      <div key={service.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{service.name}</span>
                        <span className="font-medium text-teal-600">${service.price}</span>
                      </div>
                    ))}
                    {detailer.services.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{detailer.services.length - 2} more services
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookService(detailer);
                  }}
                  disabled={!detailer.isAvailable}
                  className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                    detailer.isAvailable
                      ? 'bg-teal-500 text-white hover:bg-teal-600'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {detailer.isAvailable ? 'Book Now' : 'Currently Unavailable'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}