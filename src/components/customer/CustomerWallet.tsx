"use client";

import { useState, useEffect } from "react";
import { CreditCard, History, Coins, ChevronLeft, Building, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { useTranslation } from "@/lib/i18n";

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

// Map detailer IDs to their profile images
const detailerImages: Record<string, string> = {
  'det_1': '/images/detailers/detailer-1.webp',
  'det_2': '/images/detailers/detailer-3.jpg',
  'det_3': '/images/detailers/detailer-4.jpg',
  'det_4': '/images/detailers/detailer-6.jpg',
  'det_5': '/images/detailers/detailer-5.jpg',
  'det_6': '/images/detailers/detailer-7.jpg',
};

// Map coin IDs to detailer IDs
const coinToDetailer: Record<string, string> = {
  'coin_det_1': 'det_1',
  'coin_det_2': 'det_2',
  'coin_det_3': 'det_3',
  'coin_det_4': 'det_4',
  'coin_det_5': 'det_5',
  'coin_det_6': 'det_6',
};

export function CustomerWallet() {
  const { t } = useTranslation();
  const [coinBalances, setCoinBalances] = useState<CoinBalance[]>([]);
  const [totalCoinValue, setTotalCoinValue] = useState("0.00");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<CoinBalance | null>(null);
  const [currentView, setCurrentView] = useState<'main' | 'payment-methods' | 'transaction-history'>('main');
  const [showBookingModal, setShowBookingModal] = useState(false);

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
      title: t('customerWallet.paymentMethods'),
      description: t('customerWallet.paymentMethodsDesc'),
      icon: CreditCard,
      color: "bg-blue-600",
      action: () => setCurrentView("payment-methods"),
    },
    {
      title: t('customerWallet.transactionHistory'),
      description: t('customerWallet.transactionHistoryDesc'),
      icon: History,
      color: "bg-purple-600",
      action: () => setCurrentView("transaction-history"),
    },
  ];

  const handleRedeemClick = (coinBalance: CoinBalance) => {
    setSelectedCoin(coinBalance);
    setShowBookingModal(true);
  };

  const getDetailerIdFromCoin = (coinBalance: CoinBalance): string => {
    return coinToDetailer[coinBalance.coinId] || 'det_1';
  };

  const getDetailerImage = (coinBalance: CoinBalance): string => {
    const detailerId = getDetailerIdFromCoin(coinBalance);
    return detailerImages[detailerId] || '/images/detailers/detailer-1.webp';
  };

  // Payment Methods View
  const renderPaymentMethodsView = () => (
    <div className="p-6 space-y-6 pb-24 lg:pb-6">
      {/* Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentView('main')}
          className="p-2 hover:bg-brand-800 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-brand-400" />
        </button>
        <h1 className="text-2xl font-bold text-white">{t('customerWallet.paymentMethods')}</h1>
      </div>

      {/* Existing Payment Methods */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">{t('customerWallet.savedCards')}</h2>
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
                    {t('customerWallet.default')}
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
        <h2 className="text-lg font-semibold text-white">{t('customerWallet.addNewCard')}</h2>
        <div className="p-4 rounded-xl bg-brand-900/50 border border-brand-800">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-200 mb-2">{t('customerWallet.cardNumber')}</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-200 mb-2">{t('customerWallet.expiryDate')}</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-200 mb-2">{t('customerWallet.cvv')}</label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full px-4 py-3 bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-200 mb-2">{t('customerWallet.nameOnCard')}</label>
              <input
                type="text"
                placeholder="John Smith"
                className="w-full px-4 py-3 bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
              />
            </div>
            <button className="w-full px-4 py-3 bg-accent-DEFAULT hover:bg-accent-hover text-white rounded-lg transition-colors font-medium">
              {t('customerWallet.addCard')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Transaction History View
  const renderTransactionHistoryView = () => (
    <div className="p-6 space-y-6 pb-24 lg:pb-6">
      {/* Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentView('main')}
          className="p-2 hover:bg-brand-800 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-brand-400" />
        </button>
        <h1 className="text-2xl font-bold text-white">{t('customerWallet.transactionHistory')}</h1>
      </div>

      {/* Filter Options */}
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-accent-DEFAULT text-white rounded-lg text-sm font-medium">
          {t('customerWallet.all')}
        </button>
        <button className="px-4 py-2 bg-brand-800 text-brand-300 hover:bg-brand-700 rounded-lg text-sm font-medium transition-colors">
          {t('customerWallet.coinsEarned')}
        </button>
        <button className="px-4 py-2 bg-brand-800 text-brand-300 hover:bg-brand-700 rounded-lg text-sm font-medium transition-colors">
          {t('customerWallet.coinsRedeemed')}
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
    <div className="p-6 space-y-6 pb-24 lg:pb-6">
      {/* Coin Summary Card - Compact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-100 text-xs">{t('customerWallet.totalRewardCoins')}</p>
            <p className="text-2xl font-bold">${totalCoinValue}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
            <Coins className="h-5 w-5" />
          </div>
        </div>
      </motion.div>

      {/* Quick Actions - Now at top */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">{t('customerWallet.quickActions')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-xl bg-brand-900/50 border border-brand-800 hover:bg-brand-800/80 transition-all duration-300 group text-left"
              onClick={action.action}
            >
              <div className={`h-8 w-8 rounded-lg ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                <action.icon className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-medium text-white text-sm group-hover:text-accent-DEFAULT transition-colors">
                {action.title}
              </h3>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Promotional Coins - Stacked vertically */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">{t('customerWallet.promotionalCoins')}</h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-xl bg-brand-900/50 border border-brand-800 animate-pulse">
                <div className="h-4 bg-brand-800 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : coinBalances.length > 0 ? (
          <div className="space-y-2">
            {coinBalances.map((coinBalance, index) => (
              <motion.div
                key={coinBalance.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 rounded-xl bg-brand-900/50 border border-brand-800"
                style={{ borderColor: coinBalance.coin.primaryColor + '30' }}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Coin Icon & Name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {coinBalance.coin.iconUrl ? (
                      <img
                        src={coinBalance.coin.iconUrl}
                        alt={coinBalance.coin.displayName}
                        className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: coinBalance.coin.primaryColor + '20' }}
                      >
                        <Building className="h-4 w-4" style={{ color: coinBalance.coin.primaryColor }} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-white text-sm truncate">
                        {coinBalance.coin.provider.businessName}
                      </p>
                      <p className="text-xs text-brand-500 truncate">{coinBalance.coin.displayName}</p>
                    </div>
                  </div>

                  {/* Coin Amount */}
                  <div className="text-center px-3">
                    <p className="font-semibold text-white text-sm">{coinBalance.balance}</p>
                    <p className="text-xs text-brand-500">{t('customerWallet.coins')}</p>
                  </div>

                  {/* Dollar Value */}
                  <div className="text-center px-3">
                    <p className="font-semibold text-accent-DEFAULT text-sm">${coinBalance.dollarValue}</p>
                    <p className="text-xs text-brand-500">{t('customerWallet.value')}</p>
                  </div>

                  {/* Redeem Button */}
                  <button
                    onClick={() => handleRedeemClick(coinBalance)}
                    className="px-3 py-1.5 bg-accent-DEFAULT hover:bg-accent-hover text-white text-xs font-medium rounded-lg transition-colors flex-shrink-0"
                  >
                    {t('customerWallet.redeem')}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 space-y-2">
            <div className="h-12 w-12 rounded-full bg-brand-800 flex items-center justify-center mx-auto">
              <Coins className="h-6 w-6 text-brand-600" />
            </div>
            <p className="text-brand-400 text-sm">{t('customerWallet.noPromotionalCoins')}</p>
            <p className="text-xs text-brand-500">{t('customerWallet.completeFirstBooking')}</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedCoin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header with Detailer Profile */}
              <div className="p-4 border-b border-gray-200 flex items-center gap-4">
                <img
                  src={getDetailerImage(selectedCoin)}
                  alt={selectedCoin.coin.provider.businessName}
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{selectedCoin.coin.provider.businessName}</h3>
                  <p className="text-sm text-gray-500">
                    Redeem {selectedCoin.balance} coins (${selectedCoin.dollarValue} value)
                  </p>
                </div>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Booking Wizard */}
              <div className="flex-1 overflow-y-auto p-4">
                <BookingWizard
                  providerId={getDetailerIdFromCoin(selectedCoin)}
                  onComplete={(bookingId) => {
                    setShowBookingModal(false);
                    setSelectedCoin(null);
                  }}
                  compact
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
