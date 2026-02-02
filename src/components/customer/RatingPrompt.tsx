"use client";

import { useState } from 'react';
import { X, Star, Send, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { StarRating } from '@/components/shared/StarRating';

interface RatingPromptProps {
  appointmentId: string;
  businessName: string;
  serviceName: string;
  detailerName: string;
  onClose?: () => void;
}

export function RatingPrompt({
  appointmentId,
  businessName,
  serviceName,
  detailerName,
  onClose
}: RatingPromptProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { addRating, dismissRatingPrompt } = useAppStore();

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    
    // Add rating to store
    addRating(appointmentId, rating, comment || undefined);
    
    // Show success state
    setTimeout(() => {
      setIsSubmitted(true);
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    }, 500);
  };

  const handleSkip = () => {
    dismissRatingPrompt(appointmentId);
    if (onClose) onClose();
  };

  const quickResponses = [
    "Great service!",
    "Very professional",
    "On time and efficient",
    "Excellent work",
    "Highly recommend"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="rating-form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Star className="h-6 w-6 fill-white" />
                    <h3 className="text-xl font-bold">Rate Your Service</h3>
                  </div>
                  <button
                    onClick={handleSkip}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-yellow-50">
                  How was your experience with {businessName}?
                </p>
              </div>

              {/* Service Info */}
              <div className="px-6 py-4 bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{serviceName}</p>
                    <p className="text-sm text-gray-600">by {detailerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Completed</p>
                    <p className="text-sm font-medium text-gray-700">Today</p>
                  </div>
                </div>
              </div>

              {/* Rating Section */}
              <div className="p-6 space-y-6">
                {/* Star Rating */}
                <div>
                  <p className="text-sm text-gray-600 mb-3 text-center">
                    Tap to rate your experience
                  </p>
                  <div className="flex justify-center">
                    <StarRating
                      rating={rating}
                      size="lg"
                      interactive
                      onRatingChange={setRating}
                    />
                  </div>
                  {rating > 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mt-2 text-sm font-medium text-gray-700"
                    >
                      {rating === 5 && "Excellent!"}
                      {rating === 4 && "Very Good!"}
                      {rating === 3 && "Good"}
                      {rating === 2 && "Fair"}
                      {rating === 1 && "Poor"}
                    </motion.p>
                  )}
                </div>

                {/* Comment Section */}
                {rating > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add a comment (optional)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                    />
                    
                    {/* Quick Responses */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {quickResponses.map((response) => (
                        <button
                          key={response}
                          onClick={() => setComment(response)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          {response}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSkip}
                    className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={rating === 0 || isSubmitting}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      rating === 0 || isSubmitting
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Rating
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <ThumbsUp className="h-10 w-10 text-green-600" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Thank You!
              </h3>
              <p className="text-gray-600">
                Your feedback helps us improve our service
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}