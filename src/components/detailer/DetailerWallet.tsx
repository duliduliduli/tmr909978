"use client";

import { mockDetailers } from "@/lib/mockData";
import { Coins, Settings, Palette, TrendingUp } from "lucide-react";
import { useState } from "react";

export function DetailerWallet() {
  const detailer = mockDetailers[0]; // Current detailer
  const [coinName, setCoinName] = useState(detailer.coin.name);
  const [earnRate, setEarnRate] = useState(detailer.coin.earnRate);
  const [redemptionValue, setRedemptionValue] = useState(detailer.coin.redemptionValue);

  return (
    <div className="space-y-6">
      {/* Coin Overview */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Rewards & Coin</h1>
          <div className="bg-white/20 p-2 rounded-lg">
            <Coins className="h-6 w-6" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-3xl font-bold mb-1">1,247</div>
            <div className="text-teal-100">Coins distributed</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">89%</div>
            <div className="text-teal-100">Customer return rate</div>
          </div>
        </div>
      </div>

      {/* Coin Settings */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-teal-100 rounded-lg flex items-center justify-center">
            <Settings className="h-5 w-5 text-teal-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Coin Configuration</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Coin Name</label>
            <input
              type="text"
              value={coinName}
              onChange={(e) => setCoinName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="e.g., Premium Coins"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Coin Color</label>
            <div className="flex items-center gap-3">
              <div 
                className="h-10 w-10 rounded-lg border-2 border-gray-200"
                style={{ backgroundColor: detailer.coin.iconColor }}
              ></div>
              <input
                type="color"
                value={detailer.coin.iconColor}
                className="w-20 h-10 rounded-lg border border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Earn Rate (coins per $1 spent)
            </label>
            <input
              type="number"
              value={earnRate}
              onChange={(e) => setEarnRate(Number(e.target.value))}
              min="0.1"
              max="5"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Redemption Value ($1 = ? coins)
            </label>
            <input
              type="number"
              value={1 / redemptionValue}
              onChange={(e) => setRedemptionValue(1 / Number(e.target.value))}
              min="1"
              max="20"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Current: 1 coin = ${redemptionValue.toFixed(2)}
            </p>
          </div>
        </div>

        <button className="w-full bg-teal-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-600 transition-colors mt-6">
          Save Changes
        </button>
      </div>

      {/* Promotion Boosts */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Promotion Boosts</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Weekend Bonus</div>
              <div className="text-sm text-gray-600">2x coins on weekends</div>
            </div>
            <button className="bg-white border border-gray-300 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Edit
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">First-Timer Bonus</div>
              <div className="text-sm text-gray-600">5 bonus coins for new customers</div>
            </div>
            <button className="bg-white border border-gray-300 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Edit
            </button>
          </div>
        </div>

        <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors mt-4">
          + Add New Boost
        </button>
      </div>

      {/* Analytics */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Coin Analytics</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">342</div>
            <div className="text-sm text-gray-600">Coins earned this month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">89</div>
            <div className="text-sm text-gray-600">Coins redeemed</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Customer retention rate</span>
            <span className="font-medium text-gray-900">89%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Avg. coins per booking</span>
            <span className="font-medium text-gray-900">12.5</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Most active day</span>
            <span className="font-medium text-gray-900">Saturday</span>
          </div>
        </div>
      </div>
    </div>
  );
}