"use client";

import { mockDetailers, mockCustomers } from "@/lib/mockData";
import { Coins, Gift, Star } from "lucide-react";

export function CustomerWallet() {
  const customer = mockCustomers[0];
  const walletDetailers = mockDetailers.filter(d => customer.walletBalances[d.id]);

  const totalValue = walletDetailers.reduce((sum, detailer) => {
    const balance = customer.walletBalances[detailer.id] || 0;
    return sum + (balance * detailer.coin.redemptionValue);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Wallet Summary */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">My Wallet</h1>
          <div className="bg-white/20 p-2 rounded-lg">
            <Coins className="h-6 w-6" />
          </div>
        </div>
        <div className="text-3xl font-bold mb-2">${totalValue.toFixed(2)}</div>
        <p className="text-teal-100">Total coin value across all detailers</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow text-left">
          <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
            <Gift className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Redeem Coins</h3>
          <p className="text-sm text-gray-600">Use your coins for discounts</p>
        </button>
        <button className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow text-left">
          <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
            <Star className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Earn More</h3>
          <p className="text-sm text-gray-600">Book services to earn coins</p>
        </button>
      </div>

      {/* Coin Balances by Detailer */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Your Coins</h2>
        <div className="space-y-3">
          {walletDetailers.map((detailer) => {
            const balance = customer.walletBalances[detailer.id];
            const value = balance * detailer.coin.redemptionValue;
            
            return (
              <div key={detailer.id} className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${detailer.coin.iconColor}20` }}
                    >
                      <Coins 
                        className="h-5 w-5" 
                        style={{ color: detailer.coin.iconColor }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{detailer.coin.name}</h3>
                      <p className="text-sm text-gray-600">{detailer.businessName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{balance}</div>
                    <div className="text-sm text-gray-600">${value.toFixed(2)} value</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    Earn rate: {detailer.coin.earnRate} coin per $1 spent
                  </div>
                  <button className="bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors">
                    Redeem
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {[
            { type: "earned", amount: 12, detailer: "Premium Auto Spa", date: "Today" },
            { type: "redeemed", amount: -5, detailer: "Elite Mobile Detail", date: "Yesterday" },
            { type: "earned", amount: 8, detailer: "Shine Kings", date: "3 days ago" }
          ].map((activity, index) => (
            <div key={index} className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`h-2 w-2 rounded-full ${
                      activity.type === "earned" ? "bg-green-500" : "bg-red-500"
                    }`}></div>
                    <span className="font-medium text-gray-900">
                      {activity.type === "earned" ? "Earned" : "Redeemed"}
                    </span>
                    <span className={`font-bold ${
                      activity.type === "earned" ? "text-green-600" : "text-red-600"
                    }`}>
                      {activity.amount > 0 ? "+" : ""}{activity.amount} coins
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{activity.detailer}</p>
                </div>
                <div className="text-sm text-gray-500">{activity.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}