"use client";

import { useState, useRef, useEffect } from "react";
import { User, LogOut, ArrowRightLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, useClerk } from "@clerk/nextjs";
import { useAppStore } from "@/lib/store";
import { useRouter, usePathname } from "next/navigation";

export function UserMenu({ compact = false }: { compact?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();

  const { role, setRole, authUser } = useAppStore();

  const hasProviderProfile = !!authUser?.providerProfileId;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRoleToggle = () => {
    const nextRole = role === "customer" ? "detailer" : "customer";
    setRole(nextRole);
    const nextBase = nextRole === "detailer" ? "/detailer" : "/customer";
    const tab = pathname.split("/").slice(-1)[0] || "home";
    router.push(`${nextBase}/${tab}`);
    setIsOpen(false);
  };

  const handleSignOut = () => {
    setIsOpen(false);
    signOut({ redirectUrl: "/" });
  };

  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User"
    : "User";
  const avatarUrl = user?.imageUrl;

  if (compact) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-900 border border-brand-800 text-xs font-medium text-brand-300 hover:border-brand-700 transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-brand-800 overflow-hidden flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-3 h-3 text-brand-400" />
            )}
          </div>
          <span className="max-w-[80px] truncate">{displayName}</span>
          <div
            className={`w-2 h-2 rounded-full ${
              role === "customer" ? "bg-accent-DEFAULT" : "bg-purple-500"
            }`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-56 bg-brand-900 border border-brand-800 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <MenuContent
                displayName={displayName}
                avatarUrl={avatarUrl}
                role={role}
                hasProviderProfile={hasProviderProfile}
                onRoleToggle={handleRoleToggle}
                onSignOut={handleSignOut}
              />
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
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-brand-400" />
          )}
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="font-medium text-brand-200 truncate">
            {displayName}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-brand-500">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                role === "customer" ? "bg-accent-DEFAULT" : "bg-purple-500"
              }`}
            />
            {role === "customer" ? "Customer" : "Detailer"}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-brand-900 border border-brand-800 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <MenuContent
              displayName={displayName}
              avatarUrl={avatarUrl}
              role={role}
              hasProviderProfile={hasProviderProfile}
              onRoleToggle={handleRoleToggle}
              onSignOut={handleSignOut}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuContent({
  displayName,
  avatarUrl,
  role,
  hasProviderProfile,
  onRoleToggle,
  onSignOut,
}: {
  displayName: string;
  avatarUrl: string | undefined;
  role: string;
  hasProviderProfile: boolean;
  onRoleToggle: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="py-2">
      {/* User info */}
      <div className="px-4 py-3 border-b border-brand-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-800 overflow-hidden flex items-center justify-center flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-brand-400" />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-brand-200 truncate">
              {displayName}
            </div>
            <span
              className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                role === "customer"
                  ? "bg-accent-DEFAULT/20 text-accent-DEFAULT"
                  : "bg-purple-500/20 text-purple-400"
              }`}
            >
              {role === "customer" ? "Customer" : "Detailer"}
            </span>
          </div>
        </div>
      </div>

      {/* Role toggle (only if user has both profiles) */}
      {hasProviderProfile && (
        <button
          onClick={onRoleToggle}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-brand-300 hover:bg-brand-800/50 transition-colors"
        >
          <ArrowRightLeft className="w-4 h-4" />
          Switch to {role === "customer" ? "Detailer" : "Customer"}
        </button>
      )}

      {/* Sign out */}
      <button
        onClick={onSignOut}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-brand-800/50 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}
