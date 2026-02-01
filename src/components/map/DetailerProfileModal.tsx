"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Heart, MessageCircle, Phone, MapPin, Clock, Award, Camera } from 'lucide-react';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
}

interface Detailer {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  distance: number;
  profileImage: string;
  coverImage?: string;
  specialties: string[];
  price: string;
  availability: 'available' | 'busy' | 'offline';
  phone?: string;
  isFavorite: boolean;
  popularity: number;
  latitude: number;
  longitude: number;
  bio?: string;
  yearsExperience?: number;
  servicesOffered?: string[];
  workingHours?: string;
  certifications?: string[];
}

interface DetailerProfileModalProps {
  detailer: Detailer | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: (detailerId: string) => void;
  onChat: (detailer: Detailer) => void;
  onCall: (phone: string) => void;
  favorites: string[];
}

export function DetailerProfileModal({
  detailer,
  isOpen,
  onClose,
  onToggleFavorite,
  onChat,
  onCall,
  favorites
}: DetailerProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'gallery'>('overview');
  const [showAllReviews, setShowAllReviews] = useState(false);

  if (!detailer) return null;

  // Mock reviews data
  const reviews: Review[] = [
    {
      id: '1',
      customerName: 'Sarah M.',
      rating: 5,
      comment: 'Amazing attention to detail! My car looks brand new. Alex was professional and thorough.',
      date: '2 days ago',
      images: ['/api/placeholder/200/150', '/api/placeholder/200/150']
    },
    {
      id: '2', 
      customerName: 'Mike R.',
      rating: 5,
      comment: 'Best detailing service I\'ve used. The ceramic coating is incredible!',
      date: '1 week ago'
    },
    {
      id: '3',
      customerName: 'Jennifer L.',
      rating: 4,
      comment: 'Great work, very punctual. Minor issue with scheduling but overall excellent service.',
      date: '2 weeks ago',
      images: ['/api/placeholder/200/150']
    }
  ];

  const galleryImages = [
    '/api/placeholder/300/200',
    '/api/placeholder/300/200', 
    '/api/placeholder/300/200',
    '/api/placeholder/300/200',
    '/api/placeholder/300/200',
    '/api/placeholder/300/200'
  ];

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-8 bg-white rounded-2xl overflow-hidden z-50 flex flex-col max-h-[calc(100vh-2rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with cover image */}
            <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
              {detailer.coverImage && (
                <img
                  src={detailer.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>

              {/* Profile info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <div className="flex items-end gap-4">
                  <img
                    src={detailer.profileImage}
                    alt={detailer.name}
                    className="w-20 h-20 rounded-xl border-4 border-white object-cover"
                  />
                  <div className="flex-1 pb-2">
                    <h1 className="text-2xl font-bold text-white">{detailer.name}</h1>
                    <div className="flex items-center gap-2 text-white/90">
                      <div className="flex items-center gap-1">
                        {renderStars(detailer.rating, 'md')}
                        <span className="font-medium ml-1">{detailer.rating}</span>
                        <span>({detailer.reviewCount} reviews)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-white/80 text-sm mt-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {detailer.distance} miles away
                      </div>
                      <div className={`flex items-center gap-1 ${
                        detailer.availability === 'available' ? 'text-green-300' :
                        detailer.availability === 'busy' ? 'text-yellow-300' : 'text-gray-300'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          detailer.availability === 'available' ? 'bg-green-300' :
                          detailer.availability === 'busy' ? 'bg-yellow-300' : 'bg-gray-300'
                        }`} />
                        {detailer.availability === 'available' ? 'Available' :
                         detailer.availability === 'busy' ? 'Busy' : 'Offline'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleFavorite(detailer.id)}
                    className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                  >
                    <Heart
                      className={`h-6 w-6 ${
                        favorites.includes(detailer.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex gap-3">
                <button
                  onClick={() => onChat(detailer)}
                  className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  Chat Now
                </button>
                {detailer.phone && (
                  <button
                    onClick={() => onCall(detailer.phone!)}
                    className="flex-1 bg-gray-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="h-5 w-5" />
                    Call
                  </button>
                )}
                <button className="bg-green-500 text-white py-3 px-6 rounded-xl font-medium hover:bg-green-600 transition-colors">
                  Book Now
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex gap-6">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'reviews', label: 'Reviews' },
                  { id: 'gallery', label: 'Gallery' }
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`pb-2 px-1 border-b-2 font-medium transition-colors ${
                      activeTab === id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Bio */}
                  {detailer.bio && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                      <p className="text-gray-600 leading-relaxed">{detailer.bio}</p>
                    </div>
                  )}

                  {/* Specialties */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {detailer.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="h-5 w-5 text-blue-500" />
                        <span className="font-medium text-gray-900">Experience</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{detailer.yearsExperience || 5}+ years</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-gray-900">Availability</span>
                      </div>
                      <p className="text-sm text-gray-600">{detailer.workingHours || '9 AM - 6 PM'}</p>
                    </div>
                  </div>

                  {/* Services */}
                  {detailer.servicesOffered && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Services Offered</h3>
                      <div className="space-y-2">
                        {detailer.servicesOffered.map((service) => (
                          <div key={service} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span className="text-gray-700">{service}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Rating summary */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900 mb-2">{detailer.rating}</div>
                      {renderStars(detailer.rating, 'md')}
                      <p className="text-gray-600 mt-2">{detailer.reviewCount} reviews</p>
                    </div>
                  </div>

                  {/* Reviews list */}
                  <div className="space-y-4">
                    {reviews.slice(0, showAllReviews ? reviews.length : 3).map((review) => (
                      <div key={review.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{review.customerName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              {renderStars(review.rating)}
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{review.comment}</p>
                        {review.images && (
                          <div className="flex gap-2">
                            {review.images.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt="Review"
                                className="w-20 h-20 rounded-lg object-cover"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {reviews.length > 3 && !showAllReviews && (
                    <button
                      onClick={() => setShowAllReviews(true)}
                      className="w-full py-3 text-blue-600 font-medium hover:text-blue-700 transition-colors"
                    >
                      Show all {reviews.length} reviews
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'gallery' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryImages.map((image, index) => (
                    <div key={index} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={image}
                        alt={`Work ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}