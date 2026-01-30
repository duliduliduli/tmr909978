"use client";

import { useState, useEffect } from "react";
import { Coins, Upload, Palette, Settings, TrendingUp, Users, Gift, Plus, Edit, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BusinessCoin {
  id: string;
  providerId: string;
  name: string;
  displayName: string;
  description: string | null;
  iconUrl: string | null;
  primaryColor: string;
  earnRate: number;
  minimumEarnAmount: number;
  redemptionValue: number;
  minimumRedemption: number;
  maxRedemptionPerBooking: number | null;
  isActive: boolean;
  analytics: {
    totalCustomers: number;
    totalTransactions: number;
    totalCoinsIssued: number;
    totalCoinsRedeemed: number;
    activePromotions: number;
  };
  promotions: CoinPromotion[];
}

interface CoinPromotion {
  id: string;
  title: string;
  description: string | null;
  requiredCoins: number;
  discountAmount: number;
  maxRedemptions: number | null;
  usedCount: number;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
}

export function DetailerCoinManager() {
  // Mock provider ID - in real app, get from auth context
  const providerId = "provider_123";
  
  const [businessCoin, setBusinessCoin] = useState<BusinessCoin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showPromotions, setShowPromotions] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    iconUrl: "",
    primaryColor: "#3B82F6",
    earnRate: 1.0,
    minimumEarnAmount: 0.0,
    redemptionValue: 0.01,
    minimumRedemption: 100,
    maxRedemptionPerBooking: 50.0,
  });

  const [newPromotion, setNewPromotion] = useState({
    title: "",
    description: "",
    requiredCoins: 100,
    discountAmount: 5.0,
    maxRedemptions: 100,
    validFrom: new Date().toISOString().slice(0, 16),
    validUntil: "",
  });

  useEffect(() => {
    fetchBusinessCoin();
  }, []);

  const fetchBusinessCoin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/coins/business?providerId=${providerId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          setBusinessCoin(data.coin);
          setFormData({
            name: data.coin.name,
            displayName: data.coin.displayName,
            description: data.coin.description || "",
            iconUrl: data.coin.iconUrl || "",
            primaryColor: data.coin.primaryColor,
            earnRate: data.coin.earnRate,
            minimumEarnAmount: data.coin.minimumEarnAmount,
            redemptionValue: data.coin.redemptionValue,
            minimumRedemption: data.coin.minimumRedemption,
            maxRedemptionPerBooking: data.coin.maxRedemptionPerBooking || 50.0,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching business coin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCoin = async () => {
    try {
      const response = await fetch('/api/coins/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          ...formData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBusinessCoin(data.coin);
        setIsEditing(false);
        setIsCreating(false);
        await fetchBusinessCoin(); // Refresh to get analytics
      }
    } catch (error) {
      console.error('Error saving business coin:', error);
    }
  };

  const handleCreatePromotion = async () => {
    // This would call a promotions API endpoint
    console.log('Creating promotion:', newPromotion);
    // Reset form
    setNewPromotion({
      title: "",
      description: "",
      requiredCoins: 100,
      discountAmount: 5.0,
      maxRedemptions: 100,
      validFrom: new Date().toISOString().slice(0, 16),
      validUntil: "",
    });
  };

  const colorOptions = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", 
    "#8B5CF6", "#F97316", "#06B6D4", "#84CC16",
    "#EC4899", "#6366F1", "#14B8A6", "#F472B6"
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-brand-800 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-brand-800 rounded mb-6"></div>
          <div className="h-48 bg-brand-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!businessCoin && !isCreating) {
    return (
      <div className="p-6">
        <div className="text-center py-16 space-y-6">
          <div className="h-24 w-24 rounded-full bg-brand-800 flex items-center justify-center mx-auto">
            <Coins className="h-12 w-12 text-brand-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Create Your Business Coin</h2>
            <p className="text-brand-400 max-w-md mx-auto">
              Build customer loyalty with your own branded coin system. Customers earn coins with every purchase and redeem them for discounts.
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent-DEFAULT hover:bg-accent-hover text-white rounded-xl font-semibold transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Business Coin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Business Coin Manager</h1>
        {businessCoin && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-800 hover:bg-brand-700 text-white rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit Coin
          </button>
        )}
      </div>

      {/* Coin Overview */}
      {businessCoin && !isEditing && !isCreating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border"
          style={{ 
            backgroundColor: businessCoin.primaryColor + '10',
            borderColor: businessCoin.primaryColor + '30'
          }}
        >
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              {businessCoin.iconUrl ? (
                <img 
                  src={businessCoin.iconUrl} 
                  alt={businessCoin.displayName}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div 
                  className="h-16 w-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: businessCoin.primaryColor }}
                >
                  <Coins className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{businessCoin.displayName}</h2>
              <p className="text-brand-400 mb-4">{businessCoin.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-brand-500">Earn Rate</p>
                  <p className="text-lg font-semibold text-white">{businessCoin.earnRate} coins/$1</p>
                </div>
                <div>
                  <p className="text-sm text-brand-500">Coin Value</p>
                  <p className="text-lg font-semibold text-white">${businessCoin.redemptionValue}</p>
                </div>
                <div>
                  <p className="text-sm text-brand-500">Min Redemption</p>
                  <p className="text-lg font-semibold text-white">{businessCoin.minimumRedemption} coins</p>
                </div>
                <div>
                  <p className="text-sm text-brand-500">Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    businessCoin.isActive 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {businessCoin.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Analytics */}
      {businessCoin && businessCoin.analytics && !isEditing && !isCreating && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-xl bg-brand-900/50 border border-brand-800"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{businessCoin.analytics.totalCustomers}</p>
                <p className="text-sm text-brand-500">Customers</p>
              </div>
            </div>
            <p className="text-xs text-brand-600">Have earned coins</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl bg-brand-900/50 border border-brand-800"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Coins className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{businessCoin.analytics.totalCoinsIssued.toLocaleString()}</p>
                <p className="text-sm text-brand-500">Coins Issued</p>
              </div>
            </div>
            <p className="text-xs text-brand-600">Total distributed</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-xl bg-brand-900/50 border border-brand-800"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{businessCoin.analytics.totalCoinsRedeemed.toLocaleString()}</p>
                <p className="text-sm text-brand-500">Coins Redeemed</p>
              </div>
            </div>
            <p className="text-xs text-brand-600">Customer engagement</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-xl bg-brand-900/50 border border-brand-800"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Gift className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{businessCoin.analytics.activePromotions}</p>
                <p className="text-sm text-brand-500">Active Promotions</p>
              </div>
            </div>
            <p className="text-xs text-brand-600">Special offers</p>
          </motion.div>
        </div>
      )}

      {/* Coin Editor */}
      {(isEditing || isCreating) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-brand-900/50 border border-brand-800 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {isCreating ? 'Create Business Coin' : 'Edit Business Coin'}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setIsCreating(false);
                }}
                className="p-2 text-brand-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-brand-300 mb-2">
                  Coin Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Alex's AutoCoins"
                  className="w-full px-4 py-2 bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="AutoCoins"
                  className="w-full px-4 py-2 bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Earn coins with every car detail and redeem for discounts!"
                  rows={3}
                  className="w-full px-4 py-2 bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-300 mb-2">
                  Coin Icon URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.iconUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, iconUrl: e.target.value }))}
                    placeholder="https://your-domain.com/coin-icon.png"
                    className="flex-1 px-4 py-2 bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
                  />
                  <button className="px-4 py-2 bg-brand-700 hover:bg-brand-600 text-white rounded-lg transition-colors">
                    <Upload className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-300 mb-2">
                  Primary Color
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormData(prev => ({ ...prev, primaryColor: color }))}
                      className={`h-8 w-8 rounded-full border-2 transition-all ${
                        formData.primaryColor === color
                          ? 'border-white scale-110'
                          : 'border-brand-600 hover:border-brand-400'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="h-8 w-16 rounded border border-brand-700 bg-brand-800"
                />
              </div>
            </div>

            {/* Coin Economics */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white">Coin Economics</h3>
              
              <div>
                <label className="block text-sm font-medium text-brand-300 mb-2">
                  Earn Rate (coins per $1 spent)
                </label>
                <input
                  type="number"
                  value={formData.earnRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, earnRate: parseFloat(e.target.value) || 0 }))}
                  step="0.1"
                  min="0.1"
                  max="10"
                  className="w-full px-4 py-2 bg-brand-800 border border-brand-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
                />
                <p className="text-xs text-brand-500 mt-1">
                  Higher rates = more coins earned per purchase
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-300 mb-2">
                  Coin Value ($ per coin)
                </label>
                <input
                  type="number"
                  value={formData.redemptionValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, redemptionValue: parseFloat(e.target.value) || 0 }))}
                  step="0.001"
                  min="0.001"
                  max="1"
                  className="w-full px-4 py-2 bg-brand-800 border border-brand-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
                />
                <p className="text-xs text-brand-500 mt-1">
                  How much each coin is worth in dollars
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-300 mb-2">
                  Minimum Redemption (coins)
                </label>
                <input
                  type="number"
                  value={formData.minimumRedemption}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimumRedemption: parseInt(e.target.value) || 0 }))}
                  min="1"
                  className="w-full px-4 py-2 bg-brand-800 border border-brand-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
                />
                <p className="text-xs text-brand-500 mt-1">
                  Minimum coins needed to redeem
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-300 mb-2">
                  Max Redemption Per Booking ($)
                </label>
                <input
                  type="number"
                  value={formData.maxRedemptionPerBooking || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxRedemptionPerBooking: parseFloat(e.target.value) || null }))}
                  step="1"
                  min="1"
                  className="w-full px-4 py-2 bg-brand-800 border border-brand-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
                />
                <p className="text-xs text-brand-500 mt-1">
                  Maximum discount per booking (optional)
                </p>
              </div>

              {/* Preview */}
              <div className="mt-6 p-4 rounded-lg bg-brand-800/50 border border-brand-700">
                <h4 className="text-sm font-medium text-brand-300 mb-2">Preview</h4>
                <div className="flex items-center gap-3">
                  <div 
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    {formData.iconUrl ? (
                      <img 
                        src={formData.iconUrl} 
                        alt="Preview"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <Coins className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{formData.displayName || 'Coin Name'}</p>
                    <p className="text-xs text-brand-400">
                      {formData.earnRate} coins/$1 • ${formData.redemptionValue}/coin
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsEditing(false);
                setIsCreating(false);
              }}
              className="px-6 py-2 text-brand-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCoin}
              className="inline-flex items-center gap-2 px-6 py-2 bg-accent-DEFAULT hover:bg-accent-hover text-white rounded-lg transition-colors"
            >
              <Save className="h-4 w-4" />
              {isCreating ? 'Create Coin' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Promotions Section */}
      {businessCoin && !isEditing && !isCreating && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Coin Promotions</h2>
            <button
              onClick={() => setShowPromotions(!showPromotions)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-800 hover:bg-brand-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Promotion
            </button>
          </div>

          {/* Promotion Creation Form */}
          <AnimatePresence>
            {showPromotions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-6 rounded-xl bg-brand-900/50 border border-brand-800 space-y-4"
              >
                <h3 className="font-semibold text-white">Create New Promotion</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-300 mb-2">
                      Promotion Title
                    </label>
                    <input
                      type="text"
                      value={newPromotion.title}
                      onChange={(e) => setNewPromotion(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Holiday Special"
                      className="w-full px-4 py-2 bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-300 mb-2">
                      Required Coins
                    </label>
                    <input
                      type="number"
                      value={newPromotion.requiredCoins}
                      onChange={(e) => setNewPromotion(prev => ({ ...prev, requiredCoins: parseInt(e.target.value) || 0 }))}
                      min="1"
                      className="w-full px-4 py-2 bg-brand-800 border border-brand-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-300 mb-2">
                      Discount Amount ($)
                    </label>
                    <input
                      type="number"
                      value={newPromotion.discountAmount}
                      onChange={(e) => setNewPromotion(prev => ({ ...prev, discountAmount: parseFloat(e.target.value) || 0 }))}
                      step="0.01"
                      min="0.01"
                      className="w-full px-4 py-2 bg-brand-800 border border-brand-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-300 mb-2">
                      Max Redemptions
                    </label>
                    <input
                      type="number"
                      value={newPromotion.maxRedemptions || ''}
                      onChange={(e) => setNewPromotion(prev => ({ ...prev, maxRedemptions: parseInt(e.target.value) || 100 }))}
                      min="1"
                      placeholder="Unlimited"
                      className="w-full px-4 py-2 bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newPromotion.description}
                    onChange={(e) => setNewPromotion(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Special holiday offer for loyal customers"
                    rows={2}
                    className="w-full px-4 py-2 bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowPromotions(false)}
                    className="px-4 py-2 text-brand-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePromotion}
                    className="px-6 py-2 bg-accent-DEFAULT hover:bg-accent-hover text-white rounded-lg transition-colors"
                  >
                    Create Promotion
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Existing Promotions */}
          {businessCoin.promotions && businessCoin.promotions.length > 0 && (
            <div className="space-y-3">
              {businessCoin.promotions.map((promotion, index) => (
                <motion.div
                  key={promotion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-brand-900/50 border border-brand-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-medium text-white">{promotion.title}</h4>
                    <p className="text-sm text-brand-400">{promotion.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-brand-500">
                        {promotion.requiredCoins} coins → ${promotion.discountAmount}
                      </span>
                      <span className="text-xs text-brand-500">
                        Used: {promotion.usedCount}/{promotion.maxRedemptions || '∞'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      promotion.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {promotion.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}