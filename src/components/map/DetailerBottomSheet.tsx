"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ChevronUp, ChevronDown, Star, Heart, MessageCircle, Phone, MapPin, Filter, SlidersHorizontal, ArrowLeft, Send } from 'lucide-react';
import { useAppStore, type ChatMessage } from '@/lib/store';
import { StarRating } from '@/components/shared/StarRating';
import { BookingWizard } from '@/components/booking/BookingWizard';
import { mockDetailers as mockDetailersData } from '@/lib/mockData';
import { useTranslation } from '@/lib/i18n';

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
type ViewState = 'list' | 'profile' | 'chat' | 'reviews' | 'single' | 'booking';
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
  const { t } = useTranslation();
  const [sheetState, setSheetState] = useState<SheetState>('collapsed');
  const [detailers, setDetailers] = useState<Detailer[]>([]);
  const [filteredDetailers, setFilteredDetailers] = useState<Detailer[]>([]);
  const [radiusMiles, setRadiusMiles] = useState(25);
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [selectedDetailer, setSelectedDetailer] = useState<Detailer | null>(null);
  const [viewState, setViewState] = useState<ViewState>('list');
  const { favoriteDetailers, toggleFavoriteDetailer, isFavoriteDetailer, getActiveServicesByDetailer, sendMessage: storeSendMessage, startConversation, bidirectionalChatLogs, activeCustomerId } = useAppStore();
  const [sheetHeights, setSheetHeights] = useState(getSheetHeights());
  const [chatMessage, setChatMessage] = useState('');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

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

  // Transform mockDetailers from mockData.ts to match our Detailer interface
  useEffect(() => {
    const detailerImages = [
      '/images/detailers/detailer-1.webp',
      '/images/detailers/detailer-3.jpg',
      '/images/detailers/detailer-4.jpg',
      '/images/detailers/detailer-6.jpg',
      '/images/detailers/detailer-5.jpg',
      '/images/detailers/detailer-7.jpg',
    ];

    const priceLevel = (services: { price: number }[]) => {
      const avgPrice = services.reduce((sum, s) => sum + s.price, 0) / services.length;
      if (avgPrice < 40) return '$';
      if (avgPrice < 80) return '$$';
      if (avgPrice < 150) return '$$$';
      return '$$$$';
    };

    const transformed: Detailer[] = mockDetailersData.map((d, index) => ({
      id: d.id,
      name: d.businessName,
      rating: d.rating,
      reviewCount: d.reviewCount,
      distance: Math.round((index + 1) * 1.5 * 10) / 10, // Mock distance based on index
      profileImage: detailerImages[index] || detailerImages[0],
      specialties: d.services.slice(0, 2).map(s => s.name),
      price: priceLevel(d.services),
      availability: index === 2 ? 'busy' : index === 4 ? 'offline' : 'available' as const,
      phone: d.phone,
      isFavorite: false,
      popularity: Math.round(d.rating * 20),
      latitude: d.location.lat,
      longitude: d.location.lng,
    }));

    setDetailers(transformed);
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
    setSlideDirection('left');
    setSelectedDetailer(detailer);
    setViewState('chat');
    if (sheetState !== 'expanded') setSheetState('expanded');
  };

  const handleProfileClick = (detailer: Detailer) => {
    setSlideDirection('left');
    setSelectedDetailer(detailer);
    setViewState('profile');
    if (sheetState === 'collapsed') setSheetState('expanded');
  };

  const handleBackToList = () => {
    setSlideDirection('right');
    setViewState('list');
    setSelectedDetailer(null);
    // Clear map selection if we're coming back from a map-selected detailer
    if (selectedDetailerFromMap && onClearMapSelection) {
      onClearMapSelection();
    }
  };

  const handleShowReviews = (detailer: Detailer) => {
    setSlideDirection('left');
    setSelectedDetailer(detailer);
    setViewState('reviews');
  };

  const handleBookService = () => {
    if (!selectedDetailer) return;
    setSlideDirection('left');
    setViewState('booking');
  };

  const handleBackFromBooking = () => {
    setSlideDirection('right');
    if (selectedDetailerFromMap) {
      setViewState('single');
    } else {
      setViewState('profile');
    }
  };

  const handleBackFromChat = () => {
    setSlideDirection('right');
    if (selectedDetailerFromMap) {
      setViewState('single');
    } else {
      setViewState('profile');
    }
  };

  const handleBookingDone = (_bookingId: string) => {
    // ConfirmationStep already creates appointments in the store
    // Return to the detailer profile after a short delay
    setTimeout(() => {
      handleBackFromBooking();
    }, 3000);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !selectedDetailer) return;

    // Start or get conversation and send message using bidirectional system
    const conversationId = startConversation(selectedDetailer.id);
    storeSendMessage(conversationId, chatMessage.trim());
    setChatMessage('');
  };

  // Get chat messages from bidirectional store
  const conversationId = selectedDetailer ? `${selectedDetailer.id}_${activeCustomerId}` : '';
  const currentChatMessages = conversationId
    ? (bidirectionalChatLogs[conversationId] || []).map(msg => ({
        ...msg,
        fromMe: msg.senderId === activeCustomerId
      }))
    : [];

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
                  {t('detailerBottomSheet.detailersNearYou')}
                </h2>
                <p className="text-sm text-gray-600">
                  {filteredDetailers.length} {t('detailerBottomSheet.detailersWithin')} {radiusMiles} {t('detailerBottomSheet.miles')}
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
                  onClick={() => {
                    if (viewState === 'booking') {
                      handleBackFromBooking();
                    } else if (viewState === 'chat') {
                      handleBackFromChat();
                    } else if (viewState === 'reviews') {
                      setSlideDirection('right');
                      if (selectedDetailerFromMap) {
                        setViewState('single');
                      } else {
                        setViewState('profile');
                      }
                    } else {
                      handleBackToList();
                    }
                  }}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {viewState === 'profile' ? selectedDetailer?.name :
                     viewState === 'chat' ? `${t('detailerBottomSheet.chatWith')} ${selectedDetailer?.name}` :
                     viewState === 'reviews' ? `${selectedDetailer?.name} ${t('detailerBottomSheet.reviews')}` :
                     viewState === 'booking' ? t('detailerBottomSheet.bookService') : ''}
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
                  <span className="text-xs font-medium text-gray-700">{t('detailerBottomSheet.searchRadius')}</span>
                  <span className="text-xs font-bold text-gray-900">{radiusMiles} {t('detailerBottomSheet.miles')}</span>
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
                  { value: 'distance', label: t('detailerBottomSheet.closest'), icon: MapPin },
                  { value: 'rating', label: t('detailerBottomSheet.highestRated'), icon: Star },
                  { value: 'popularity', label: t('detailerBottomSheet.mostPopular'), icon: Filter },
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
          <AnimatePresence mode="wait" initial={false}>
          {viewState === 'list' && sheetState === 'collapsed' && (
            // Collapsed view - horizontal scroll
            <motion.div
              key="collapsed-list"
              initial={{ opacity: 0, x: slideDirection === 'left' ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: slideDirection === 'left' ? -100 : 100 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex gap-4 overflow-x-auto pb-2"
            >
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
            </motion.div>
          )}

          {viewState === 'list' && sheetState === 'expanded' && (
            // Expanded view - vertical list with scroll
            <motion.div
              key="expanded-list"
              initial={{ opacity: 0, x: slideDirection === 'left' ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: slideDirection === 'left' ? -100 : 100 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
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
                      className="w-16 h-16 rounded-xl object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleProfileClick(detailer)}
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
                              ({detailer.reviewCount} {t('detailerBottomSheet.reviews')})
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
                          {t('detailerBottomSheet.viewProfile')}
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
            </motion.div>
          )}

          {viewState === 'profile' && selectedDetailer && (
            // Profile View - Same as Single View with booking
            <motion.div
              key="profile-view"
              initial={{ opacity: 0, x: slideDirection === 'left' ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: slideDirection === 'left' ? -100 : 100 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="space-y-6 flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y pb-20"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {/* Business Header */}
              <div className="space-y-3">
                {/* Top Row: Profile Picture + Name */}
                <div className="flex items-start gap-4">
                  <img
                    src={selectedDetailer.profileImage}
                    alt={selectedDetailer.name}
                    className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 pt-1">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold text-gray-900">{selectedDetailer.name}</h3>
                      <button
                        onClick={() => toggleFavorite(selectedDetailer.id)}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
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
                  </div>
                </div>

                {/* Bottom Row: Rating + Work Hours */}
                <div className="flex items-center gap-4">
                  {/* Rating on the left */}
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={selectedDetailer.rating} size="md" showNumber />
                    <span
                      className="text-gray-500 text-sm cursor-pointer hover:text-blue-600"
                      onClick={() => handleShowReviews(selectedDetailer)}
                    >
                      ({selectedDetailer.reviewCount})
                    </span>
                  </div>

                  <div className="w-px h-4 bg-gray-300" />

                  {/* Work Hours on the right */}
                  <div className="text-gray-600 text-sm">
                    <span className="font-medium">Mon-Fri 7AM-7PM</span>
                    <span className="text-gray-400 mx-1">•</span>
                    <span>Sat-Sun 8AM-5PM</span>
                  </div>
                </div>
              </div>

              {/* Services Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xl font-bold text-gray-900">{t('detailerBottomSheet.services')}</h4>
                  {/* Promotional Coins - small badge */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg px-2 py-1">
                    <span className="text-xs font-medium text-yellow-800">🪙 {t('detailerBottomSheet.promotionalCoins')}</span>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {(() => {
                    const services = getActiveServicesByDetailer(selectedDetailer.id);
                    if (services.length === 0) {
                      return (
                        <div className="text-center py-4 text-gray-500">
                          <p>{t('detailerBottomSheet.noServicesListed')}</p>
                        </div>
                      );
                    }
                    return services.map((service, index) => (
                      <div key={service.id} className="py-2.5">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold text-gray-900">{service.name}</h5>
                          <span className="text-base font-bold text-gray-900">${service.price}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 gap-2 mt-0.5">
                          <span>⏱️ {service.duration} {t('common.min')}</span>
                          {service.category && (
                            <span className="text-gray-400">• {service.category}</span>
                          )}
                          {index === 0 && (
                            <span className="text-green-600 font-medium">• {t('detailerBottomSheet.mostPopularService')}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{service.description}</p>
                      </div>
                    ));
                  })()}
                </div>

                {/* Single Book Service Button */}
                <button
                  onClick={() => handleBookService()}
                  className="w-full bg-blue-500 text-white py-4 px-6 rounded-xl text-lg font-bold hover:bg-blue-600 transition-colors mt-6 shadow-lg"
                >
                  {t('detailerBottomSheet.bookService')}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleChat(selectedDetailer)}
                  className="flex-1 bg-blue-100 text-blue-900 py-3 px-4 rounded-xl font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  {t('detailerBottomSheet.chatNow')}
                </button>
                {selectedDetailer.phone && (
                  <button
                    onClick={() => handleCall(selectedDetailer.phone!)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="h-5 w-5" />
                    {t('detailerBottomSheet.call')}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {viewState === 'chat' && selectedDetailer && (
            // Chat View
            <motion.div
              key="chat-view"
              initial={{ opacity: 0, x: slideDirection === 'left' ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: slideDirection === 'left' ? -100 : 100 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex flex-col flex-1 h-full relative"
            >
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto pb-20">
                {currentChatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <MessageCircle className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500">{t('detailerBottomSheet.startConversation')} {selectedDetailer.name}</p>
                  </div>
                ) : (
                  <div className="space-y-4 p-2">
                    {currentChatMessages.map((message: ChatMessage, idx: number) => (
                      <div
                        key={idx}
                        className={`flex ${message.fromMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                            message.fromMe
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chat Input - Fixed to bottom */}
              <div className="absolute bottom-4 left-0 right-0 flex gap-2 items-end bg-white/80 backdrop-blur-sm pt-2">
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
            </motion.div>
          )}

          {viewState === 'reviews' && selectedDetailer && (
            // Reviews View
            <motion.div
              key="reviews-view"
              initial={{ opacity: 0, x: slideDirection === 'left' ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: slideDirection === 'left' ? -100 : 100 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
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
                <p className="text-gray-600">{selectedDetailer.reviewCount} {t('detailerBottomSheet.totalReviews')}</p>
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
            </motion.div>
          )}

          {viewState === 'booking' && selectedDetailer && (
            // Inline Booking Wizard
            <motion.div
              key="booking-view"
              initial={{ opacity: 0, x: slideDirection === 'left' ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: slideDirection === 'left' ? -100 : 100 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain touch-pan-y pb-20"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              style={{ overflowX: 'hidden' }}
            >
              <BookingWizard
                providerId={selectedDetailer.id}
                onComplete={handleBookingDone}
                compact
              />
            </motion.div>
          )}

          {viewState === 'single' && selectedDetailer && (
            // Single Detailer View (from map marker click)
            <motion.div
              key="single-view"
              initial={{ opacity: 0, x: slideDirection === 'left' ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: slideDirection === 'left' ? -100 : 100 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="space-y-6 flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y pb-20"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {/* Business Header */}
              <div className="space-y-3">
                {/* Top Row: Profile Picture + Name */}
                <div className="flex items-start gap-4">
                  <img
                    src={selectedDetailer.profileImage}
                    alt={selectedDetailer.name}
                    className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 pt-1">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold text-gray-900">{selectedDetailer.name}</h3>
                      <button
                        onClick={() => toggleFavorite(selectedDetailer.id)}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
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
                  </div>
                </div>

                {/* Bottom Row: Rating + Work Hours */}
                <div className="flex items-center gap-4">
                  {/* Rating on the left */}
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={selectedDetailer.rating} size="md" showNumber />
                    <span
                      className="text-gray-500 text-sm cursor-pointer hover:text-blue-600"
                      onClick={() => handleShowReviews(selectedDetailer)}
                    >
                      ({selectedDetailer.reviewCount})
                    </span>
                  </div>

                  <div className="w-px h-4 bg-gray-300" />

                  {/* Work Hours on the right */}
                  <div className="text-gray-600 text-sm">
                    <span className="font-medium">Mon-Fri 7AM-7PM</span>
                    <span className="text-gray-400 mx-1">•</span>
                    <span>Sat-Sun 8AM-5PM</span>
                  </div>
                </div>
              </div>

              {/* Services Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xl font-bold text-gray-900">{t('detailerBottomSheet.services')}</h4>
                  {/* Promotional Coins - small badge */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg px-2 py-1">
                    <span className="text-xs font-medium text-yellow-800">🪙 {t('detailerBottomSheet.promotionalCoins')}</span>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {(() => {
                    const services = getActiveServicesByDetailer(selectedDetailer.id);
                    if (services.length === 0) {
                      return (
                        <div className="text-center py-4 text-gray-500">
                          <p>{t('detailerBottomSheet.noServicesListed')}</p>
                        </div>
                      );
                    }
                    return services.map((service, index) => (
                      <div key={service.id} className="py-2.5">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold text-gray-900">{service.name}</h5>
                          <span className="text-base font-bold text-gray-900">${service.price}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 gap-2 mt-0.5">
                          <span>⏱️ {service.duration} {t('common.min')}</span>
                          {service.category && (
                            <span className="text-gray-400">• {service.category}</span>
                          )}
                          {index === 0 && (
                            <span className="text-green-600 font-medium">• {t('detailerBottomSheet.mostPopularService')}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{service.description}</p>
                      </div>
                    ));
                  })()}
                </div>

                {/* Single Book Service Button */}
                <button
                  onClick={() => handleBookService()}
                  className="w-full bg-blue-500 text-white py-4 px-6 rounded-xl text-lg font-bold hover:bg-blue-600 transition-colors mt-6 shadow-lg"
                >
                  {t('detailerBottomSheet.bookService')}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleChat(selectedDetailer)}
                  className="flex-1 bg-blue-100 text-blue-900 py-3 px-4 rounded-xl font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  {t('detailerBottomSheet.chatNow')}
                </button>
                {selectedDetailer.phone && (
                  <button
                    onClick={() => handleCall(selectedDetailer.phone!)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="h-5 w-5" />
                    {t('detailerBottomSheet.call')}
                  </button>
                )}
              </div>
            </motion.div>
          )}
          </AnimatePresence>
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