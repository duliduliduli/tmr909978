"use client";

import { mockDetailers } from "@/lib/mockData";
import { Star, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export function CustomerHome() {
  const featuredDetailers = mockDetailers.slice(0, 3);
  
  // Filter for detailers with promotions
  const detailersWithPromotions = mockDetailers
    .filter(d => d.promotions.length > 0)
    .slice(0, 2);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="space-y-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      {/* Hero Section */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-8 text-white text-center shadow-lg"
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          Tumaro — Book it today. Done by Tumaro.
        </h1>
        <button className="bg-white text-teal-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors transform hover:scale-105 shadow-md">
          Book Now
        </button>
      </motion.div>

      {/* Promotions Section - Moved to top */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>🔥</span> Today's Promotions
        </h2>
        <div className="space-y-4">
          {detailersWithPromotions.map((detailer) => (
            <motion.div 
              key={detailer.id} 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{detailer.businessName}</h3>
                  <p className="text-sm text-orange-700 font-bold mb-1">{detailer.promotions[0]?.title}</p>
                  <p className="text-sm text-gray-600">{detailer.promotions[0]?.description}</p>
                </div>
                <div className="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
                  {detailer.promotions[0]?.discount}% OFF
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Featured Businesses Section - Renamed and moved bottom */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Featured Businesses</h2>
          <button className="text-teal-600 text-sm font-medium hover:text-teal-700">View All</button>
        </div>
        <div className="space-y-4">
          {featuredDetailers.map((detailer) => (
            <motion.div 
              key={detailer.id} 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{detailer.businessName}</h3>
                  <p className="text-sm text-gray-600">{detailer.name}</p>
                </div>
                <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{detailer.rating}</span>
                  <span className="text-xs text-gray-500">({detailer.reviewCount})</span>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>Mobile Service</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{detailer.hours}</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="text-sm">
                  <span className="text-gray-500">Starting at</span>
                  <span className="font-bold text-gray-900 ml-1 text-lg">${detailer.services[0]?.price}</span>
                </div>
                <button className="bg-teal-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors shadow-sm">
                  Book Service
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
