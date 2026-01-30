"use client";

import { useState } from "react";
import { CreditCard, Plus, History, Gift, Coins, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export function CustomerWallet() {
  const [balance] = useState(125.50);
  const [coins] = useState(2450);

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
      type: "refund",
      description: "Service Cancellation",
      amount: +35.00,
      date: "Dec 10, 2023",
      status: "completed",
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
      title: "Add Money",
      description: "Top up your wallet balance",
      icon: Plus,
      color: "bg-green-600",
    },
    {
      title: "Payment Methods",
      description: "Manage cards and payment options",
      icon: CreditCard,
      color: "bg-blue-600",
    },
    {
      title: "Transaction History",
      description: "View all payment history",
      icon: History,
      color: "bg-purple-600",
    },
    {
      title: "Redeem Coins",
      description: "Use coins for discounts",
      icon: Gift,
      color: "bg-accent-DEFAULT",
    },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Wallet Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-accent-DEFAULT to-blue-600 text-white"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-accent-100 text-sm">Wallet Balance</p>
              <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>
          <button className="w-full py-2 px-4 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors">
            Add Money
          </button>
        </motion.div>

        {/* Coin Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-brand-900/50 border border-brand-800"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-brand-400 text-sm">Tumaro Coins</p>
              <p className="text-3xl font-bold text-white">{coins.toLocaleString()}</p>
              <p className="text-xs text-brand-500 mt-1">≈ ${(coins * 0.01).toFixed(2)} value</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Coins className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
          <button className="w-full py-2 px-4 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-xl font-medium transition-colors">
            Redeem Coins
          </button>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-brand-900/50 border border-brand-800 hover:bg-brand-800/80 transition-all duration-300 group text-left"
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

      {/* Payment Methods */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Payment Methods</h2>
          <button className="text-accent-DEFAULT text-sm font-medium hover:text-accent-hover transition-colors">
            Add New
          </button>
        </div>

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
                <ChevronRight className="h-4 w-4 text-brand-600" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
        
        <div className="space-y-3">
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl bg-brand-900/50 border border-brand-800"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-white font-medium">{transaction.description}</p>
                  <p className="text-xs text-brand-500">{transaction.date}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-400' : 'text-white'}`}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                  <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                    {transaction.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <button className="w-full py-3 text-accent-DEFAULT font-medium hover:text-accent-hover transition-colors">
          View All Transactions
        </button>
      </div>
    </div>
  );
}