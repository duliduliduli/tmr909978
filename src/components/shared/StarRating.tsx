"use client";

import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0-5
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({ 
  rating, 
  maxRating = 5,
  size = 'md',
  showNumber = false,
  interactive = false,
  onRatingChange,
  className = ''
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleStarClick = (starIndex: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex);
    }
  };

  const renderStar = (index: number) => {
    const fillPercentage = Math.min(Math.max(rating - index, 0), 1);
    const isFullStar = fillPercentage >= 0.75;
    const isHalfStar = fillPercentage >= 0.25 && fillPercentage < 0.75;
    const isEmpty = fillPercentage < 0.25;

    return (
      <button
        key={index}
        onClick={() => handleStarClick(index + 1)}
        disabled={!interactive}
        className={`relative ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        type="button"
      >
        {isEmpty ? (
          <Star className={`${sizeClasses[size]} text-gray-300`} />
        ) : isFullStar ? (
          <Star className={`${sizeClasses[size]} text-yellow-400 fill-yellow-400`} />
        ) : (
          <div className="relative">
            <Star className={`${sizeClasses[size]} text-gray-300`} />
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercentage * 100}%` }}>
              <Star className={`${sizeClasses[size]} text-yellow-400 fill-yellow-400`} />
            </div>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => renderStar(i))}
      </div>
      {showNumber && (
        <span className="ml-2 text-sm text-gray-600 font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}