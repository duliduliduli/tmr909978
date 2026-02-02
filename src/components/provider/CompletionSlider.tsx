"use client";

import { useState, useRef, useEffect } from 'react';
import { Check, X, ChevronRight, Clock } from 'lucide-react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useAppStore } from '@/lib/store';

interface CompletionSliderProps {
  appointmentId: string;
  customerName: string;
  serviceName: string;
  onComplete: () => void;
  onNotComplete: () => void;
  onDismiss: () => void;
}

export function CompletionSlider({
  appointmentId,
  customerName,
  serviceName,
  onComplete,
  onNotComplete,
  onDismiss
}: CompletionSliderProps) {
  const [isSliding, setIsSliding] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const controls = useAnimation();
  
  const { markAppointmentCompleted } = useAppStore();

  const sliderWidth = 280;
  const threshold = sliderWidth * 0.7; // 70% to trigger completion

  const handleDragEnd = () => {
    const currentX = x.get();
    
    if (currentX > threshold && !isCompleted) {
      // Complete the slider
      controls.start({ x: sliderWidth - 60 });
      setIsCompleted(true);
      
      // Mark as completed and trigger callback
      setTimeout(() => {
        markAppointmentCompleted(appointmentId);
        onComplete();
      }, 500);
    } else {
      // Snap back
      controls.start({ x: 0 });
    }
    
    setIsSliding(false);
  };

  const handleNotComplete = () => {
    onNotComplete();
  };

  // Background color interpolation
  const backgroundProgress = useTransform(x, [0, sliderWidth - 60], [0, 1]);
  const backgroundColor = useTransform(
    backgroundProgress,
    [0, 0.5, 1],
    ['rgb(239, 246, 255)', 'rgb(191, 219, 254)', 'rgb(34, 197, 94)']
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold">Job Completion</h3>
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-blue-100">
            Has the service been completed?
          </p>
        </div>

        {/* Service Details */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{serviceName}</p>
              <p className="text-sm text-gray-600">for {customerName}</p>
            </div>
          </div>
        </div>

        {/* Slider Section */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 text-center mb-4">
              Swipe to confirm completion
            </p>
            
            {/* Slider Container */}
            <div 
              ref={containerRef}
              className="relative h-14 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full overflow-hidden"
              style={{ width: `${sliderWidth}px` }}
            >
              {/* Progress Background */}
              <motion.div
                className="absolute inset-0 opacity-30"
                style={{ backgroundColor }}
              />
              
              {/* Slider Button */}
              <motion.div
                ref={sliderRef}
                drag="x"
                dragConstraints={{ left: 0, right: sliderWidth - 60 }}
                dragElastic={0}
                dragMomentum={false}
                onDragStart={() => setIsSliding(true)}
                onDragEnd={handleDragEnd}
                animate={controls}
                style={{ x }}
                className={`absolute left-2 top-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing ${
                  isCompleted ? 'bg-green-500' : 'bg-white'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 text-white" />
                ) : (
                  <ChevronRight className={`h-5 w-5 ${isSliding ? 'text-blue-600' : 'text-gray-400'}`} />
                )}
              </motion.div>
              
              {/* Text Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.span 
                  className="text-sm font-medium text-gray-600"
                  animate={{ opacity: isCompleted ? 0 : 1 }}
                >
                  {!isSliding && !isCompleted && 'Swipe to complete'}
                </motion.span>
              </div>
              
              {/* Completion Text */}
              {isCompleted && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span className="text-sm font-semibold text-green-600">
                    Completed! ✓
                  </span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Not Completed Button */}
          {!isCompleted && (
            <button
              onClick={handleNotComplete}
              className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Not completed yet
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}