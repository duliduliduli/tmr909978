"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ChevronUp, ChevronDown, Star, Heart, MessageCircle, Phone, MapPin, Filter, SlidersHorizontal, ArrowLeft, Send } from 'lucide-react';
import { useAppStore, calculateAdjustedPrice, type BodyType, type Service } from '@/lib/store';
import { StarRating } from '@/components/shared/StarRating';
import { VehicleSelectionStep } from '@/components/booking/steps/VehicleInfoStep';
import { type BookingData, type BookingVehicle } from '@/components/booking/BookingWizard';

interface Detailer {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  distance: number;
  profileImage: string;
  specialties: string[];
  price: string;
  availability: 'available' | 'busy' | 'offline';
  phone?: string;
  isFavorite: boolean;
  popularity: number;
  latitude: number;
  longitude: number;
}

interface DetailerBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  userLocation: [number, number] | null;
  selectedDetailerFromMap?: Detailer | null;
  onClearMapSelection?: () => void;
}

type SheetState = 'collapsed' | 'expanded';
type ViewState = 'list' | 'profile' | 'chat' | 'reviews' | 'single' | 'booking' | 'booking-success';
type SortOption = 'distance' | 'rating' | 'popularity';

const getSheetHeights = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  // The sheet lives inside the map container which already stops at the nav bar
  // (on mobile, the nav is part of the flex layout, not overlapping).
  // We just need some top clearance so the expanded sheet doesn't cover the header.
  const topOffset = isMobile ? 80 : 160;

  return {
    collapsed: isMobile ? 80 : 120,
    expanded: typeof window !== 'undefined'
      ? (isMobile
          // On mobile: map container height ≈ viewport - header(64) - nav(80).
          // We subtract topOffset from that for header clearance when expanded.
          ? window.innerHeight - 64 - 80 - 20
          // On desktop: viewport - desktop header offset
          : window.innerHeight - topOffset)
      : 600,
  };
};

export function DetailerBottomSheet({ isVisible, onClose, userLocation, selectedDetailerFromMap, onClearMapSelection }: DetailerBottomSheetProps) {
  const [sheetState, setSheetState] = useState<SheetState>('collapsed');
  const [detailers, setDetailers] = useState<Detailer[]>([]);
  const [filteredDetailers, setFilteredDetailers] = useState<Detailer[]>([]);
  const [radiusMiles, setRadiusMiles] = useState(25);
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [selectedDetailer, setSelectedDetailer] = useState<Detailer | null>(null);
  const [viewState, setViewState] = useState<ViewState>('list');
  const { favoriteDetailers, toggleFavoriteDetailer, isFavoriteDetailer, getActiveServicesByDetailer, addAppointment, activeCustomerId } = useAppStore();
  const [sheetHeights, setSheetHeights] = useState(getSheetHeights());
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{id: string; text: string; sender: 'user' | 'detailer'; timestamp: Date}>>([]);
  const [bookingData, setBookingData] = useState<BookingData>({
    providerId: '',
    vehicles: [],
  });
  const [bookingError, setBookingError] = useState<string | null>(null);

  const y = useMotionValue(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Update heights on window resize
  useEffect(() => {
    const updateHeights = () => {
      const newHeights = getSheetHeights();
      setSheetHeights(newHeights);
      // If expanded and height changed significantly, adjust to new height
      if (sheetState === 'expanded' && Math.abs(newHeights.expanded - sheetHeights.expanded) > 50) {
        // Force re-render with new height
        setSheetState('collapsed');
        setTimeout(() => setSheetState('expanded'), 10);
      }
    };
    window.addEventListener('resize', updateHeights);
    updateHeights(); // Call immediately to set correct initial heights
    return () => window.removeEventListener('resize', updateHeights);
  }, [sheetState, sheetHeights.expanded]);

  // Handle map selection - switch to single detailer view
  useEffect(() => {
    if (selectedDetailerFromMap) {
      setSelectedDetailer(selectedDetailerFromMap);
      setViewState('single');
      setSheetState('expanded'); // Auto-expand to full state
    }
  }, [selectedDetailerFromMap]);

  // Mock detailer data
  useEffect(() => {
    const mockDetailers: Detailer[] = [
      {
        id: 'det_1',
        name: 'Alex\'s Premium Detailing',
        rating: 4.9,
        reviewCount: 234,
        distance: 2.3,
        profileImage: '/api/placeholder/60/60',
        specialties: ['Premium Wash', 'Ceramic Coating'],
        price: '$$$',
        availability: 'available',
        phone: '+1234567890',
        isFavorite: false,
        popularity: 95,
        latitude: 34.0522,
        longitude: -118.2437,
      },
      {
        id: 'det_2',
        name: 'Maria\'s Mobile Detail',
        rating: 4.7,
        reviewCount: 189,
        distance: 1.8,
        profileImage: '/api/placeholder/60/60',
        specialties: ['Interior Deep Clean', 'Paint Protection'],
        price: '$$',
        availability: 'available',
        phone: '+1234567891',
        isFavorite: false,
        popularity: 88,
        latitude: 34.0623,
        longitude: -118.2537,
      },
      {
        id: 'det_3',
        name: 'Elite Auto Spa',
        rating: 4.8,
        reviewCount: 156,
        distance: 3.2,
        profileImage: '/api/placeholder/60/60',
        specialties: ['Full Service', 'Wax & Polish'],
        price: '$$',
        availability: 'busy',
        phone: '+1234567892',
        isFavorite: false,
        popularity: 82,
        latitude: 34.0422,
        longitude: -118.2637,
      },
      {
        id: 'det_4',
        name: 'Quick Shine Mobile',
        rating: 4.5,
        reviewCount: 98,
        distance: 4.1,
        profileImage: '/api/placeholder/60/60',
        specialties: ['Express Wash', 'Interior Vacuum'],
        price: '$',
        availability: 'available',
        phone: '+1234567893',
        isFavorite: false,
        popularity: 75,
        latitude: 34.0722,
        longitude: -118.2337,
      },
      {
        id: 'det_5',
        name: 'Luxury Detail Co.',
        rating: 4.9,
        reviewCount: 287,
        distance: 5.2,
        profileImage: '/api/placeholder/60/60',
        specialties: ['Luxury Vehicles', 'Leather Treatment'],
        price: '$$$$',
        availability: 'offline',
        phone: '+1234567894',
        isFavorite: false,
        popularity: 98,
        latitude: 34.0322,
        longitude: -118.2737,
      },
    ];
    setDetailers(mockDetailers);
  }, []);

  // Sync favorites with global store
  useEffect(() => {
    setDetailers(prev => prev.map(detailer => ({
      ...detailer,
      isFavorite: favoriteDetailers.includes(detailer.id)
    })));
  }, [favoriteDetailers]);

  // Filter and sort detailers
  useEffect(() => {
    let filtered = [...detailers];

    // Filter by radius if userLocation exists
    if (userLocation) {
      filtered = filtered.filter(detailer => detailer.distance <= radiusMiles);
    }

    // Sort detailers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'rating':
          return b.rating - a.rating;
        case 'popularity':
          return b.popularity - a.popularity;
        default:
          return 0;
      }
    });
    
    setFilteredDetailers(filtered);
  }, [detailers, radiusMiles, sortBy, userLocation]);

  // Collapse the sheet and always reset to the list view
  const collapseSheet = () => {
    setSheetState('collapsed');
    setViewState('list');
    setSelectedDetailer(null);
    if (selectedDetailerFromMap && onClearMapSelection) {
      onClearMapSelection();
    }
  };

  // Handle drag gesture
  const handleDragEnd = (event: any, info: PanInfo) => {
    const offset = info.offset.y;
    const velocity = info.velocity.y;

    if (velocity > 500) {
      // Fast swipe down
      if (sheetState === 'expanded') collapseSheet();
    } else if (velocity < -500) {
      // Fast swipe up
      if (sheetState === 'collapsed') setSheetState('expanded');
    } else {
      // Slow drag - snap to nearest state
      if (offset > 50 && sheetState === 'expanded') {
        collapseSheet();
      } else if (offset < -50 && sheetState === 'collapsed') {
        setSheetState('expanded');
      }
    }
  };

  const toggleFavorite = (detailerId: string) => {
    toggleFavoriteDetailer(detailerId);
    
    // Update detailer's favorite status
    setDetailers(prev => prev.map(d => 
      d.id === detailerId ? { ...d, isFavorite: favoriteDetailers.includes(detailerId) } : d
    ));
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleChat = (detailer: Detailer) => {
    setSelectedDetailer(detailer);
    setViewState('chat');
    if (sheetState !== 'expanded') setSheetState('expanded');
  };

  const handleProfileClick = (detailer: Detailer) => {
    setSelectedDetailer(detailer);
    setViewState('profile');
    if (sheetState === 'collapsed') setSheetState('expanded');
  };
  
  const handleBackToList = () => {
    setViewState('list');
    setSelectedDetailer(null);
    // Clear map selection if we're coming back from a map-selected detailer
    if (selectedDetailerFromMap && onClearMapSelection) {
      onClearMapSelection();
    }
  };
  
  const handleShowReviews = (detailer: Detailer) => {
    setSelectedDetailer(detailer);
    setViewState('reviews');
  };
  
  const handleBookService = () => {
    if (!selectedDetailer) return;
    setBookingData({
      providerId: selectedDetailer.id,
      vehicles: [],
    });
    setBookingError(null);
    setViewState('booking');
  };

  const updateBookingData = (updates: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...updates }));
  };

  const handleBackFromBooking = () => {
    // Go back to whichever view the user came from (profile or single)
    if (selectedDetailerFromMap) {
      setViewState('single');
    } else {
      setViewState('profile');
    }
  };

  const handleBookingComplete = () => {
    // Create appointments for each vehicle
    const mockBookingId = `TUM${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    bookingData.vehicles.forEach((vehicle, index) => {
      const vehicleLabel = vehicle.make && vehicle.model
        ? `${vehicle.make} ${vehicle.model}`
        : `${vehicle.bodyType.charAt(0).toUpperCase() + vehicle.bodyType.slice(1)} #${index + 1}`;

      const appointment = {
        id: `${mockBookingId}_v${index}`,
        customerId: activeCustomerId,
        customerName: 'Customer',
        detailerId: bookingData.providerId!,
        detailerName: selectedDetailer?.name || '',
        businessName: selectedDetailer?.name || '',
        serviceId: vehicle.serviceId,
        serviceName: vehicle.serviceName,
        serviceDescription: `${vehicle.serviceName} for ${vehicleLabel}${vehicle.luxuryCare ? ' (Luxury Care)' : ''}`,
        price: vehicle.adjustedPrice,
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '12:00 PM',
        duration: 60,
        address: 'Address not specified',
        latitude: selectedDetailer?.latitude || 34.0522,
        longitude: selectedDetailer?.longitude || -118.2437,
        phone: selectedDetailer?.phone || '',
        status: 'scheduled' as const,
        bookedAt: new Date().toISOString(),
      };
      addAppointment(appointment);
    });

    // Show success and go back to profile
    setViewState('booking-success');
    setTimeout(() => {
      if (selectedDetailerFromMap) {
        setViewState('single');
      } else {
        setViewState('profile');
      }
    }, 2500);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !selectedDetailer) return;
    
    const newMessage = {
      id: Date.now().toString(),
      text: chatMessage,
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setChatMessage('');
    
    // Simulate detailer response after 1-2 seconds
    setTimeout(() => {
      const responses = [
        "Thanks for reaching out! I'll get back to you shortly.",
        "Hi! I'm available for service. What can I help you with?",
        "Hello! I'd be happy to detail your vehicle. When would work best?",
        "Great to hear from you! Let me know what services you're interested in."
      ];
      const response = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'detailer' as const,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, response]);
    }, 1000 + Math.random() * 1000);
  };

  if (!isVisible) return null;

  return (
    <>
      <motion.div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl rounded-t-3xl shadow-2xl z-40 flex flex-col"
        initial={{ y: `calc(100% - ${sheetHeights.collapsed}px)` }}
        animate={{ y: `calc(100% - ${sheetHeights[sheetState]}px)` }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        style={{
          height: sheetHeights[sheetState],
          y: y,
        }}
      >
        {/* Drag Handle + Header zone - only this area responds to swipe/drag */}
        <motion.div
          className="flex flex-col cursor-grab active:cursor-grabbing"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          dragPropagation={false}
          style={{ touchAction: 'none' }}
        >
        <div
          className="flex justify-center py-2"
          onMouseDown={(e) => {
            const startY = e.clientY;
            const handleMouseMove = (moveEvent: MouseEvent) => {
              const deltaY = moveEvent.clientY - startY;
              if (deltaY > 50 && sheetState === 'expanded') {
                if (viewState === 'single') {
                  // Go back to detailers list but keep expanded
                  handleBackToList();
                } else {
                  setSheetState('collapsed');
                }
              } else if (deltaY < -50 && sheetState === 'collapsed') {
                setSheetState('expanded');
              }
            };
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            {viewState === 'list' ? (
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Detailers near you
                </h2>
                <p className="text-sm text-gray-600">
                  {filteredDetailers.length} detailers within {radiusMiles} miles
                </p>
              </div>
            ) : viewState === 'single' ? (
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedDetailer?.name}
                </h2>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={viewState === 'booking' || viewState === 'booking-success' ? handleBackFromBooking : handleBackToList}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {viewState === 'profile' ? selectedDetailer?.name :
                     viewState === 'chat' ? `Chat with ${selectedDetailer?.name}` :
                     viewState === 'reviews' ? `${selectedDetailer?.name} Reviews` :
                     viewState === 'booking' ? 'Book Service' :
                     viewState === 'booking-success' ? 'Booking Confirmed' : ''}
                  </h2>
                </div>
              </div>
            )}
            <button
              onClick={() => {
                if (sheetState === 'expanded') {
                  collapseSheet();
                } else {
                  setSheetState('expanded');
                }
              }}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {sheetState === 'expanded' ?
                <ChevronDown className="h-5 w-5 text-gray-600" /> :
                <ChevronUp className="h-5 w-5 text-gray-600" />
              }
            </button>
          </div>

          {/* Controls - only show when expanded and in list view */}
          {sheetState === 'expanded' && viewState === 'list' && (
            <div className="space-y-2">
              {/* Radius Slider */}
              <div className="bg-gray-50 rounded-xl px-3 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">Search radius</span>
                  <span className="text-xs font-bold text-gray-900">{radiusMiles} miles</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="65"
                  value={radiusMiles}
                  onChange={(e) => setRadiusMiles(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Sort Options */}
              <div className="flex gap-2">
                {[
                  { value: 'distance', label: 'Closest', icon: MapPin },
                  { value: 'rating', label: 'Highest Rated', icon: Star },
                  { value: 'popularity', label: 'Most Popular', icon: Filter },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setSortBy(value as SortOption)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      sortBy === value
                        ? 'bg-blue-200 text-blue-900'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        </motion.div>

        {/* Content Area - Added pb-20 for mobile to account for bottom nav */}
        <div className="flex-1 min-h-0 overflow-hidden px-6 pb-6 md:pb-6 flex flex-col">
          {viewState === 'list' && sheetState === 'collapsed' && (
            // Collapsed view - horizontal scroll
            <div className="flex gap-4 overflow-x-auto pb-2">
              {filteredDetailers.slice(0, 3).map((detailer) => (
                <motion.div
                  key={detailer.id}
                  onClick={() => handleProfileClick(detailer)}
                  className="flex-shrink-0 w-64 bg-white/60 backdrop-blur-md border border-white/40 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={detailer.profileImage}
                      alt={detailer.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{detailer.name}</h3>
                      <div className="flex items-center gap-2">
                        <StarRating rating={detailer.rating} size="sm" showNumber />
                        <span className="text-xs text-gray-600">• {detailer.distance}mi</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {detailer.specialties.slice(0, 2).map((specialty) => (
                      <span
                        key={specialty}
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {viewState === 'list' && sheetState === 'expanded' && (
            // Expanded view - vertical list with scroll
            <div 
              className="space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y pb-20" 
              onMouseDown={(e) => e.stopPropagation()} 
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {filteredDetailers.map((detailer) => (
                <motion.div
                  key={detailer.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={detailer.profileImage}
                      alt={detailer.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 
                            className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                            onClick={() => handleProfileClick(detailer)}
                          >
                            {detailer.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-1">
                            <StarRating rating={detailer.rating} size="md" showNumber />
                            <span 
                              className="text-sm text-gray-500 cursor-pointer hover:text-blue-600"
                              onClick={() => handleShowReviews(detailer)}
                            >
                              ({detailer.reviewCount} reviews)
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{detailer.distance} miles • {detailer.price}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => toggleFavorite(detailer.id)}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            <Heart
                              className={`h-4 w-4 ${
                                favoriteDetailers.includes(detailer.id)
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-gray-400'
                              }`}
                            />
                          </button>
                          <div className={`w-3 h-3 rounded-full ${
                            detailer.availability === 'available' ? 'bg-green-500' :
                            detailer.availability === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`} />
                        </div>
                      </div>
                      
                      {/* Specialties */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {detailer.specialties.map((specialty) => (
                          <span
                            key={specialty}
                            className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleProfileClick(detailer)}
                          className="flex-1 bg-blue-100 text-blue-900 py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => handleChat(detailer)}
                          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <MessageCircle className="h-4 w-4 text-gray-600" />
                        </button>
                        {detailer.phone && (
                          <button
                            onClick={() => handleCall(detailer.phone!)}
                            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <Phone className="h-4 w-4 text-gray-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {viewState === 'profile' && selectedDetailer && (
            // Profile View - Same as Single View with booking
            <div
              className="space-y-6 flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y pb-20"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {/* Business Header */}
              <div className="text-center">
                <img
                  src={selectedDetailer.profileImage}
                  alt={selectedDetailer.name}
                  className="w-24 h-24 rounded-2xl mx-auto mb-4 object-cover"
                />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedDetailer.name}</h3>

                {/* Rating and Favorite */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <StarRating rating={selectedDetailer.rating} size="lg" showNumber />
                  <span
                    className="text-gray-500 cursor-pointer hover:text-blue-600"
                    onClick={() => handleShowReviews(selectedDetailer)}
                  >
                    ({selectedDetailer.reviewCount})
                  </span>
                  <button
                    onClick={() => toggleFavorite(selectedDetailer.id)}
                    className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        isFavoriteDetailer(selectedDetailer.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                </div>

                {/* Business Hours */}
                <div className="text-gray-600 mb-4">
                  <p className="font-medium">Mon-Fri 7AM-7PM</p>
                  <p className="text-sm">Sat 8AM-6PM • Sun 9AM-5PM</p>
                </div>

                {/* Premium Coins */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-4">
                  <h4 className="font-semibold text-yellow-800 mb-1">Premium Coins</h4>
                  <p className="text-sm text-yellow-700">Earn 1.5x coins • $0.12 per coin</p>
                </div>
              </div>

              {/* Services Section */}
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">Services</h4>
                <div className="space-y-3">
                  {(() => {
                    const services = getActiveServicesByDetailer(selectedDetailer.id);
                    if (services.length === 0) {
                      return (
                        <div className="text-center py-6 text-gray-500">
                          <p>No services listed yet.</p>
                        </div>
                      );
                    }
                    return services.map((service, index) => {
                      const isPremium = service.category === 'Premium' || service.price > 50;
                      return (
                        <div
                          key={service.id}
                          className={`border rounded-xl p-4 hover:bg-gray-50 transition-colors ${
                            isPremium ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className={`font-semibold ${
                              isPremium ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {service.name}
                            </h5>
                            <span className={`text-lg font-bold ${
                              isPremium ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              ${service.price}
                            </span>
                          </div>
                          <div className={`flex items-center text-sm mb-2 gap-3 ${
                            isPremium ? 'text-blue-700' : 'text-gray-600'
                          }`}>
                            <span>⏱️ {service.duration} min</span>
                            {service.category && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isPremium ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'
                              }`}>
                                {service.category}
                              </span>
                            )}
                            {index === 0 && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                Most Popular
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${
                            isPremium ? 'text-blue-700' : 'text-gray-600'
                          }`}>
                            {service.description}
                          </p>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Single Book Service Button */}
                <button
                  onClick={() => handleBookService()}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors mt-4"
                >
                  Book Service
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleChat(selectedDetailer)}
                  className="flex-1 bg-blue-100 text-blue-900 py-3 px-4 rounded-xl font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  Chat Now
                </button>
                {selectedDetailer.phone && (
                  <button
                    onClick={() => handleCall(selectedDetailer.phone!)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="h-5 w-5" />
                    Call
                  </button>
                )}
              </div>
            </div>
          )}

          {viewState === 'chat' && selectedDetailer && (
            // Chat View
            <div className="flex flex-col flex-1 pb-16">
              {/* Chat Messages */}
              <div className="flex-1 space-y-4 overflow-y-auto mb-4">
                {chatMessages.length === 0 && (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Start a conversation with {selectedDetailer.name}</p>
                  </div>
                )}
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={`Message ${selectedDetailer.name}...`}
                    className="w-full bg-gray-100 border-0 rounded-2xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim()}
                  className="bg-blue-200 text-blue-900 p-3 rounded-2xl hover:bg-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {viewState === 'reviews' && selectedDetailer && (
            // Reviews View
            <div 
              className="space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y pb-20" 
              onMouseDown={(e) => e.stopPropagation()} 
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {/* Reviews Header */}
              <div className="text-center pb-4 border-b border-gray-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <StarRating rating={selectedDetailer.rating} size="lg" showNumber />
                </div>
                <p className="text-gray-600">{selectedDetailer.reviewCount} total reviews</p>
              </div>

              {/* Sample Reviews */}
              {[
                {
                  id: 1,
                  name: 'Sarah M.',
                  rating: 5,
                  date: '2 days ago',
                  text: 'Absolutely amazing service! My car looks brand new. Will definitely book again.'
                },
                {
                  id: 2,
                  name: 'Mike T.',
                  rating: 4,
                  date: '1 week ago',
                  text: 'Great attention to detail and very professional. Arrived on time and did excellent work.'
                },
                {
                  id: 3,
                  name: 'Jessica L.',
                  rating: 5,
                  date: '2 weeks ago',
                  text: 'Best mobile detailing service I\'ve used. The interior cleaning was particularly impressive.'
                }
              ].map((review) => (
                <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.name}</h4>
                      <StarRating rating={review.rating} size="md" />
                    </div>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{review.text}</p>
                </div>
              ))}
            </div>
          )}

          {viewState === 'booking' && selectedDetailer && (
            // Inline Booking View
            <div
              className="space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y pb-20"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <div className="text-sm text-gray-600 mb-2">
                Booking with <span className="font-semibold text-gray-900">{selectedDetailer.name}</span>
              </div>
              {bookingError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
                  {bookingError}
                </div>
              )}
              <VehicleSelectionStep
                bookingData={bookingData}
                updateBookingData={updateBookingData}
                onNext={handleBookingComplete}
                onPrev={handleBackFromBooking}
                isLoading={false}
                setIsLoading={() => {}}
                setError={setBookingError}
              />
            </div>
          )}

          {viewState === 'booking-success' && selectedDetailer && (
            // Booking Success View
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-8">
                <div className="rounded-full bg-green-100 p-4 inline-block mb-4">
                  <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                <p className="text-gray-600 text-sm">
                  {bookingData.vehicles.length} vehicle{bookingData.vehicles.length !== 1 ? 's' : ''} booked with {selectedDetailer.name}
                </p>
                <p className="text-gray-500 text-xs mt-2">Returning to profile...</p>
              </div>
            </div>
          )}

          {viewState === 'single' && selectedDetailer && (
            // Single Detailer View (from map marker click)
            <div
              className="space-y-6 flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y pb-20"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {/* Business Header */}
              <div className="text-center">
                <img
                  src={selectedDetailer.profileImage}
                  alt={selectedDetailer.name}
                  className="w-24 h-24 rounded-2xl mx-auto mb-4 object-cover"
                />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedDetailer.name}</h3>

                {/* Rating and Favorite */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <StarRating rating={selectedDetailer.rating} size="lg" showNumber />
                  <span
                    className="text-gray-500 cursor-pointer hover:text-blue-600"
                    onClick={() => handleShowReviews(selectedDetailer)}
                  >
                    ({selectedDetailer.reviewCount})
                  </span>
                  <button
                    onClick={() => toggleFavorite(selectedDetailer.id)}
                    className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        isFavoriteDetailer(selectedDetailer.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                </div>

                {/* Business Hours */}
                <div className="text-gray-600 mb-4">
                  <p className="font-medium">Mon-Fri 7AM-7PM</p>
                  <p className="text-sm">Sat 8AM-6PM • Sun 9AM-5PM</p>
                </div>

                {/* Premium Coins */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-4">
                  <h4 className="font-semibold text-yellow-800 mb-1">Premium Coins</h4>
                  <p className="text-sm text-yellow-700">Earn 1.5x coins • $0.12 per coin</p>
                </div>
              </div>

              {/* Services Section */}
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">Services</h4>
                <div className="space-y-3">
                  {(() => {
                    const services = getActiveServicesByDetailer(selectedDetailer.id);
                    if (services.length === 0) {
                      return (
                        <div className="text-center py-6 text-gray-500">
                          <p>No services listed yet.</p>
                        </div>
                      );
                    }
                    return services.map((service, index) => {
                      const isPremium = service.category === 'Premium' || service.price > 50;
                      return (
                        <div
                          key={service.id}
                          className={`border rounded-xl p-4 hover:bg-gray-50 transition-colors ${
                            isPremium ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className={`font-semibold ${
                              isPremium ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {service.name}
                            </h5>
                            <span className={`text-lg font-bold ${
                              isPremium ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              ${service.price}
                            </span>
                          </div>
                          <div className={`flex items-center text-sm mb-2 gap-3 ${
                            isPremium ? 'text-blue-700' : 'text-gray-600'
                          }`}>
                            <span>⏱️ {service.duration} min</span>
                            {service.category && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isPremium ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'
                              }`}>
                                {service.category}
                              </span>
                            )}
                            {index === 0 && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                Most Popular
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${
                            isPremium ? 'text-blue-700' : 'text-gray-600'
                          }`}>
                            {service.description}
                          </p>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Single Book Service Button */}
                <button
                  onClick={() => handleBookService()}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors mt-4"
                >
                  Book Service
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleChat(selectedDetailer)}
                  className="flex-1 bg-blue-100 text-blue-900 py-3 px-4 rounded-xl font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  Chat Now
                </button>
                {selectedDetailer.phone && (
                  <button
                    onClick={() => handleCall(selectedDetailer.phone!)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="h-5 w-5" />
                    Call
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Custom CSS for slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </>
  );
}