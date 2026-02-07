"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, Car, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';

export function AccountSwitcher({ compact = false }: { compact?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const {
    accounts,
    role,
    setRole,
    activeCustomerId,
    activeDetailerId,
    setActiveCustomerId,
    setActiveDetailerId,
    getCurrentAccount,
  } = useAppStore();

  const currentAccount = getCurrentAccount();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAccountSelect = (account: typeof accounts[0]) => {
    const newRole = account.type;
    const currentTab = pathname.split("/").slice(-1)[0] || "home";

    // Update role and active ID
    setRole(newRole);
    if (newRole === 'customer') {
      setActiveCustomerId(account.id);
    } else {
      setActiveDetailerId(account.id);
    }

    // Navigate to appropriate route
    const nextBase = newRole === "detailer" ? "/detailer" : "/customer";
    router.push(`${nextBase}/${currentTab}`);

    setIsOpen(false);
  };

  const customerAccounts = accounts.filter(a => a.type === 'customer');
  const detailerAccounts = accounts.filter(a => a.type === 'detailer');

  const currentId = role === 'customer' ? activeCustomerId : activeDetailerId;

  if (compact) {
    // Mobile compact version
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-900 border border-brand-800 text-xs font-medium text-brand-300 hover:border-brand-700 transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-brand-800 overflow-hidden flex items-center justify-center">
            {currentAccount?.profileImage ? (
              <img
                src={currentAccount.profileImage}
                alt={currentAccount.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-3 h-3 text-brand-400" />
            )}
          </div>
          <span className="max-w-[80px] truncate">
            {currentAccount?.type === 'detailer'
              ? currentAccount?.businessName || currentAccount?.name
              : currentAccount?.name}
          </span>
          <div className={`w-2 h-2 rounded-full ${role === 'customer' ? 'bg-accent-DEFAULT' : 'bg-purple-500'}`} />
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-64 bg-brand-900 border border-brand-800 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Customers */}
              <div className="px-3 pt-3 pb-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-500 uppercase tracking-wider">
                  <User className="w-3 h-3" />
                  Customers
                </div>
              </div>
              {customerAccounts.map(account => (
                <AccountOption
                  key={account.id}
                  account={account}
                  isSelected={account.id === currentId}
                  onClick={() => handleAccountSelect(account)}
                />
              ))}

              <div className="h-px bg-brand-800 my-1" />

              {/* Detailers */}
              <div className="px-3 pt-2 pb-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-500 uppercase tracking-wider">
                  <Car className="w-3 h-3" />
                  Detailers
                </div>
              </div>
              {detailerAccounts.map(account => (
                <AccountOption
                  key={account.id}
                  account={account}
                  isSelected={account.id === currentId}
                  onClick={() => handleAccountSelect(account)}
                />
              ))}
              <div className="h-2" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop full version
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-brand-950 border border-brand-800 hover:border-brand-700 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-brand-800 overflow-hidden flex items-center justify-center flex-shrink-0">
          {currentAccount?.profileImage ? (
            <img
              src={currentAccount.profileImage}
              alt={currentAccount.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-brand-400" />
          )}
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="font-medium text-brand-200 truncate">
            {currentAccount?.type === 'detailer'
              ? currentAccount?.businessName || currentAccount?.name
              : currentAccount?.name}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-brand-500">
            <div className={`w-1.5 h-1.5 rounded-full ${role === 'customer' ? 'bg-accent-DEFAULT' : 'bg-purple-500'}`} />
            {role === 'customer' ? 'Customer' : 'Detailer'}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-brand-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-brand-900 border border-brand-800 rounded-xl shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto"
          >
            {/* Customers */}
            <div className="px-3 pt-3 pb-1 sticky top-0 bg-brand-900">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-500 uppercase tracking-wider">
                <User className="w-3 h-3" />
                Customers
              </div>
            </div>
            {customerAccounts.map(account => (
              <AccountOption
                key={account.id}
                account={account}
                isSelected={account.id === currentId}
                onClick={() => handleAccountSelect(account)}
              />
            ))}

            <div className="h-px bg-brand-800 my-1" />

            {/* Detailers */}
            <div className="px-3 pt-2 pb-1 sticky top-0 bg-brand-900">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-500 uppercase tracking-wider">
                <Car className="w-3 h-3" />
                Detailers
              </div>
            </div>
            {detailerAccounts.map(account => (
              <AccountOption
                key={account.id}
                account={account}
                isSelected={account.id === currentId}
                onClick={() => handleAccountSelect(account)}
              />
            ))}
            <div className="h-2" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AccountOption({
  account,
  isSelected,
  onClick,
}: {
  account: { id: string; type: 'customer' | 'detailer'; name: string; businessName?: string; profileImage?: string };
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-brand-800/50 transition-colors ${
        isSelected ? 'bg-brand-800/30' : ''
      }`}
    >
      <div className="w-8 h-8 rounded-full bg-brand-800 overflow-hidden flex items-center justify-center flex-shrink-0">
        {account.profileImage ? (
          <img
            src={account.profileImage}
            alt={account.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-4 h-4 text-brand-400" />
        )}
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="text-sm font-medium text-brand-200 truncate">
          {account.type === 'detailer' ? account.businessName || account.name : account.name}
        </div>
        {account.type === 'detailer' && account.businessName && (
          <div className="text-xs text-brand-500 truncate">{account.name}</div>
        )}
      </div>
      {isSelected && (
        <Check className="w-4 h-4 text-accent-DEFAULT flex-shrink-0" />
      )}
    </button>
  );
}
