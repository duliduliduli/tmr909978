"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogIn, Settings, LogOut, Shield } from 'lucide-react';

interface AccountDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock authentication state - would be replaced with real auth
const mockUser = {
  isAuthenticated: false, // Set to true to test authenticated state
  name: "John Doe",
  email: "john@example.com",
  avatar: null
};

export function AccountDropdown({ isOpen, onClose }: AccountDropdownProps) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    
    // Mock sign-in process
    setTimeout(() => {
      setIsSigningIn(false);
      onClose();
      // Here you would actually authenticate the user
    }, 1500);
  };

  const handleSignOut = () => {
    // Mock sign out
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute top-16 right-8 w-80 bg-brand-900 border border-brand-800 rounded-2xl shadow-2xl z-50"
        >
          {mockUser.isAuthenticated ? (
            // Authenticated user view
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-accent-DEFAULT/20 border border-accent-DEFAULT/30 flex items-center justify-center">
                  <User className="h-6 w-6 text-accent-DEFAULT" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{mockUser.name}</h3>
                  <p className="text-sm text-brand-400">{mockUser.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-brand-800 transition-colors text-brand-200 hover:text-white">
                  <Settings className="h-5 w-5" />
                  Account Settings
                </button>
                
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-brand-800 transition-colors text-brand-200 hover:text-white">
                  <Shield className="h-5 w-5" />
                  Privacy & Security
                </button>
                
                <hr className="border-brand-800 my-3" />
                
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            // Sign-in form for non-authenticated users
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-accent-DEFAULT/20 border border-accent-DEFAULT/30 flex items-center justify-center mx-auto mb-3">
                  <LogIn className="h-6 w-6 text-accent-DEFAULT" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Welcome Back</h3>
                <p className="text-sm text-brand-400">Sign in to your Tumaro account</p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-brand-950 border border-brand-700 rounded-lg px-4 py-3 text-white placeholder:text-brand-400 focus:border-accent-DEFAULT focus:ring-2 focus:ring-accent-DEFAULT/20 transition-colors"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-brand-950 border border-brand-700 rounded-lg px-4 py-3 text-white placeholder:text-brand-400 focus:border-accent-DEFAULT focus:ring-2 focus:ring-accent-DEFAULT/20 transition-colors"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full bg-accent-DEFAULT text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSigningIn ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-brand-800 text-center">
                <p className="text-sm text-brand-400">
                  Don't have an account?{' '}
                  <button className="text-accent-DEFAULT hover:text-accent-hover transition-colors font-medium">
                    Sign up
                  </button>
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}