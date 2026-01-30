"use client";

import { useState, useEffect } from "react";
import { CreditCard, Plus, History, Gift, Coins, ChevronRight, ChevronLeft, Star, Building, Trash2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CoinBalance {
  id: string;
  coinId: string;
  balance: number;
  totalEarned: number;
  totalRedeemed: number;
  dollarValue: string;
  lastEarnedAt: string | null;
  lastRedeemedAt: string | null;
  coin: {
    id: string;
    name: string;
    displayName: string;
    description: string | null;
    iconUrl: string | null;
    primaryColor: string;
    redemptionValue: number;
    minimumRedemption: number;
    provider: {
      businessName: string;
      providerName: string;
    };
  };
}

interface CoinBalanceResponse {
  balances: CoinBalance[];
  totalCoins: number;
  totalValue: string;
  businessCount: number;
}

export function CustomerWallet() {
  const [coinBalances, setCoinBalances] = useState<CoinBalance[]>([]);
  const [totalCoinValue, setTotalCoinValue] = useState("0.00");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<CoinBalance | null>(null);
  const [currentView, setCurrentView] = useState<'main' | 'payment-methods' | 'transaction-history'>('main');

  // Mock customer ID - in real app, get from auth context
  const customerId = "cust_1";

  useEffect(() => {
    fetchCoinBalances();
  }, []);

  const fetchCoinBalances = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/coins/balance?customerId=${customerId}`);
      if (response.ok) {
        const data: CoinBalanceResponse = await response.json();
        setCoinBalances(data.balances);
        setTotalCoinValue(data.totalValue);
      }
    } catch (error) {
      console.error('Error fetching coin balances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const transactions = [
    {
      id: "1",
      type: "payment",
      description: "Premium Wash & Wax",
      amount: -65.00,
      date: "Dec 15, 2023",
      status: "completed",
    },
    {
      id: "2",
      type: "coins",
      description: "Earned 65 AutoCoins from Alex's Detail Shop",
      amount: +65,
      date: "Dec 15, 2023",
      status: "completed",
      coinType: true,
    },
    {
      id: "3",
      type: "topup",
      description: "Wallet Top-up",
      amount: +100.00,
      date: "Dec 8, 2023",
      status: "completed",
    },
  ];

  const paymentMethods = [
    {
      id: "1",
      type: "visa",
      last4: "4242",
      isDefault: true,
    },
    {
      id: "2", 
      type: "mastercard",
      last4: "8888",
      isDefault: false,
    },
  ];

  const quickActions = [
    {
      title: "Payment Methods",
      description: "Manage cards and payment options",
      icon: CreditCard,
      color: "bg-blue-600",
      action: () => setCurrentView("payment-methods"),
    },
    {
      title: "Transaction History",
      description: "View all coin transactions",
      icon: History,
      color: "bg-purple-600",
      action: () => setCurrentView("transaction-history"),
    },
    {
      title: "Redeem Coins",
      description: "Use coins for discounts",
      icon: Gift,
      color: "bg-accent-DEFAULT",
      action: () => console.log("Redeem coins"),
    },
  ];

  // Payment Methods View
  const renderPaymentMethodsView = () => (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentView('main')}
          className="p-2 hover:bg-brand-800 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-brand-400" />
        </button>
        <h1 className="text-2xl font-bold text-white">Payment Methods</h1>
      </div>

      {/* Existing Payment Methods */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Saved Cards</h2>
        <div className="space-y-3">
          {paymentMethods.map((method, index) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-brand-900/50 border border-brand-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-brand-800 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-brand-400" />
                </div>
                <div>
                  <p className="text-white font-medium">•••• {method.last4}</p>
                  <p className="text-xs text-brand-500 capitalize">{method.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {method.isDefault && (
                  <span className="px-2 py-1 rounded-full bg-accent-DEFAULT/20 text-accent-DEFAULT text-xs">
                    Default
                  </span>
                )}
                <button className="p-2 hover:bg-brand-700 rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4 text-red-400 hover:text-red-300 transition-colors" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add New Card Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Add New Card</h2>
        <div className="p-4 rounded-xl bg-brand-900/50 border border-brand-800">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-200 mb-2">Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-200 mb-2">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-200 mb-2">CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full px-4 py-3 bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-200 mb-2">Name on Card</label>
              <input
                type="text"
                placeholder="John Smith"
                className="w-full px-4 py-3 bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
              />
            </div>
            <button className="w-full px-4 py-3 bg-accent-DEFAULT hover:bg-accent-hover text-white rounded-lg transition-colors font-medium">
              Add Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Transaction History View
  const renderTransactionHistoryView = () => (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentView('main')}
          className="p-2 hover:bg-brand-800 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-brand-400" />
        </button>
        <h1 className="text-2xl font-bold text-white">Transaction History</h1>
      </div>

      {/* Filter Options */}
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-accent-DEFAULT text-white rounded-lg text-sm font-medium">
          All
        </button>
        <button className="px-4 py-2 bg-brand-800 text-brand-300 hover:bg-brand-700 rounded-lg text-sm font-medium transition-colors">
          Coins Earned
        </button>
        <button className="px-4 py-2 bg-brand-800 text-brand-300 hover:bg-brand-700 rounded-lg text-sm font-medium transition-colors">
          Coins Redeemed
        </button>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-xl bg-brand-900/50 border border-brand-800"
          >
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                transaction.coinType ? 'bg-yellow-500/20' : 'bg-brand-800'
              }`}>
                {transaction.coinType ? (
                  <Coins className="h-5 w-5 text-yellow-400" />
                ) : (
                  <CreditCard className="h-5 w-5 text-brand-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{transaction.description}</p>
                <p className="text-xs text-brand-500">{transaction.date}</p>
              </div>
              <div className="text-right">
                <p className={`font-semibold text-sm ${
                  transaction.amount > 0 
                    ? transaction.coinType ? 'text-yellow-400' : 'text-green-400'
                    : 'text-white'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}
                  {transaction.coinType ? `${Math.abs(transaction.amount)} coins` : `$${Math.abs(transaction.amount).toFixed(2)}`}
                </p>
                <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                  {transaction.status}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // Main view
  if (currentView === 'payment-methods') {
    return renderPaymentMethodsView();
  }

  if (currentView === 'transaction-history') {
    return renderTransactionHistoryView();
  }

  return (
    <div className="p-6 space-y-8">
      {/* Coin Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 text-white"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-yellow-100 text-sm">Total Reward Coins</p>
            <p className="text-3xl font-bold">${totalCoinValue}</p>
            <p className="text-xs text-yellow-200 mt-1">From {coinBalances.length} business{coinBalances.length !== 1 ? 'es' : ''}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
            <Coins className="h-6 w-6" />
          </div>
        </div>
        <p className="text-yellow-100 text-sm">
          Use your coins during booking for instant discounts!
        </p>
      </motion.div>

      {/* My Business Coins */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">My Business Coins</h2>
          {coinBalances.length > 3 && (
            <button className="text-accent-DEFAULT text-sm font-medium hover:text-accent-hover transition-colors">
              View All
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-brand-900/50 border border-brand-800 animate-pulse">
                <div className="h-4 bg-brand-800 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-brand-800 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-brand-800 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : coinBalances.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coinBalances.slice(0, 6).map((coinBalance, index) => (
              <motion.div
                key={coinBalance.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-brand-900/50 border border-brand-800 hover:bg-brand-800/50 transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedCoin(coinBalance)}
                style={{ borderColor: coinBalance.coin.primaryColor + '40' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {coinBalance.coin.iconUrl ? (
                      <img 
                        src={coinBalance.coin.iconUrl} 
                        alt={coinBalance.coin.displayName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div 
                        className="h-10 w-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: coinBalance.coin.primaryColor + '20' }}
                      >
                        <Building className="h-5 w-5" style={{ color: coinBalance.coin.primaryColor }} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-white text-sm group-hover:text-accent-DEFAULT transition-colors">
                        {coinBalance.coin.displayName}
                      </h3>
                      <p className="text-xs text-brand-500">{coinBalance.coin.provider.businessName}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-brand-600 group-hover:text-accent-DEFAULT group-hover:translate-x-1 transition-all" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-brand-400 text-sm">Balance:</span>
                    <span className="text-white font-semibold">{coinBalance.balance} coins</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-400 text-sm">Value:</span>
                    <span className="text-accent-DEFAULT font-semibold">${coinBalance.dollarValue}</span>
                  </div>
                  {coinBalance.balance >= coinBalance.coin.minimumRedemption && (
                    <div className="mt-2 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full text-center">
                      Ready to redeem
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <div className="h-16 w-16 rounded-full bg-brand-800 flex items-center justify-center mx-auto">
              <Coins className="h-8 w-8 text-brand-600" />
            </div>
            <p className="text-brand-400">No business coins yet</p>
            <p className="text-sm text-brand-500">Complete your first booking to start earning coins!</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-brand-900/50 border border-brand-800 hover:bg-brand-800/80 transition-all duration-300 group text-left"
              onClick={action.action}
            >
              <div className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-medium text-white text-sm group-hover:text-accent-DEFAULT transition-colors">
                {action.title}
              </h3>
              <p className="text-xs text-brand-500 mt-1">{action.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Coin Detail Modal/Sheet (you can implement this later) */}
      <AnimatePresence>
        {selectedCoin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50"
            onClick={() => setSelectedCoin(null)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="bg-brand-950 rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md mx-4 mb-0 sm:mb-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{selectedCoin.coin.displayName}</h3>
                <button 
                  onClick={() => setSelectedCoin(null)}
                  className="text-brand-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{selectedCoin.balance}</p>
                  <p className="text-brand-400">Available Coins</p>
                  <p className="text-accent-DEFAULT font-semibold">${selectedCoin.dollarValue} value</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-xl font-semibold text-white">{selectedCoin.totalEarned}</p>
                    <p className="text-xs text-brand-500">Total Earned</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-white">{selectedCoin.totalRedeemed}</p>
                    <p className="text-xs text-brand-500">Total Redeemed</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <p className="text-sm text-brand-400 mb-2">From: {selectedCoin.coin.provider.businessName}</p>
                  <p className="text-xs text-brand-500">Minimum redemption: {selectedCoin.coin.minimumRedemption} coins</p>
                  <p className="text-xs text-brand-500">Coin value: ${selectedCoin.coin.redemptionValue.toFixed(3)} each</p>
                </div>
                
                {selectedCoin.balance >= selectedCoin.coin.minimumRedemption && (
                  <button className="w-full py-3 bg-accent-DEFAULT hover:bg-accent-hover text-white rounded-xl font-semibold transition-colors">
                    Redeem Coins
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}