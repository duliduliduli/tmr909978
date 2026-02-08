"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Wallet, User, HelpCircle, Calendar, MessageCircle } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { MessagesInbox } from "@/components/messages/MessagesInbox";
import { UserMenu } from "@/components/UserMenu";

const navItemKeys = [
  { key: "home", labelKey: "nav.home", icon: Home, href: "/home" },
  { key: "map", labelKey: "nav.map", icon: Map, href: "/map" },
  { key: "appointments", labelKey: "nav.appointments", icon: Calendar, href: "/appointments" },
  { key: "wallet", labelKey: "nav.wallet", icon: Wallet, href: "/wallet" },
  { key: "account", labelKey: "nav.account", icon: User, href: "/account" },
  { key: "help", labelKey: "nav.help", icon: HelpCircle, href: "/help" },
];

// Bottom nav items exclude help to prevent overcrowding
const bottomNavItemKeys = navItemKeys.filter(item => item.key !== "help");

function cx(...c: Array<string | false | undefined>) {
  return c.filter(Boolean).join(" ");
}

export function AppShell({ children, title, fullWidth = false }: { children: React.ReactNode; title: string; fullWidth?: boolean }) {
  const pathname = usePathname();
  const { role, showMessages, setShowMessages, getUnreadCount } = useAppStore();
  const unreadCount = getUnreadCount();
  const { t } = useTranslation();

  const base = role === "detailer" ? "/detailer" : "/customer";

  const isActive = (tabHref: string) => pathname.includes(tabHref);

  return (
    <div className={cx("bg-brand-950 text-brand-50 font-sans", fullWidth ? "h-screen overflow-hidden" : "min-h-screen")}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <aside className="fixed left-0 top-0 h-screen w-72 bg-brand-900 border-r border-brand-800 shadow-2xl z-20">
          <div className="h-20 px-6 flex items-center justify-center border-b border-brand-800/50">
            <img
              src="/tumaro-logo.png"
              alt="Tumaro"
              className="h-8 object-contain"
            />
          </div>

          <nav className="p-4 space-y-2 mt-4">
            {navItemKeys.map((it) => {
              const Icon = it.icon;
              const href = `${base}${it.href}`;
              const active = isActive(it.href.split("/").pop() || "");

              return (
                <Link
                  key={it.key}
                  href={href}
                  className="relative group block"
                >
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-brand-800 rounded-xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className={cx(
                    "relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors z-10",
                    active ? "text-accent-DEFAULT" : "text-brand-400 group-hover:text-brand-200"
                  )}>
                    <Icon className={cx("h-5 w-5", active && "text-accent-DEFAULT")} />
                    <span>{t(it.labelKey)}</span>
                    {active && <motion.div layoutId="activeGlow" className="absolute right-3 w-1.5 h-1.5 rounded-full bg-accent-DEFAULT shadow-[0_0_8px_rgba(56,189,248,0.8)]" />}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-brand-800/50 bg-brand-900">
            <div className="text-xs uppercase tracking-wider text-brand-500 font-semibold mb-3">Account</div>
            <UserMenu />
          </div>
        </aside>

        <main className={`ml-72 w-full bg-brand-950 relative ${fullWidth ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
          {/* Header */}
          <header className="sticky top-0 z-10 h-20 px-8 flex items-center justify-between bg-brand-950/80 backdrop-blur-md border-b border-brand-800/50">
            {/* No logo in desktop header - it's already in sidebar */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowMessages(true)}
                className="relative p-2.5 rounded-full bg-brand-900 border border-brand-800 hover:border-brand-700 transition-colors"
              >
                <MessageCircle className="h-5 w-5 text-brand-300" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-brand-950">
                    <span className="text-xs text-white font-bold">{unreadCount}</span>
                  </div>
                )}
              </button>
              <div className="bg-brand-900 border border-brand-800 rounded-full px-4 py-1.5 flex items-center gap-2">
                <div className={cx(
                  "w-2 h-2 rounded-full",
                  role === "customer" ? "bg-accent-DEFAULT shadow-[0_0_8px_rgba(56,189,248,0.5)]" : "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                )} />
                <span className="text-xs font-semibold text-brand-300 uppercase tracking-wide">
                  {role === "customer" ? t('appShell.customerMode') : t('appShell.detailerMode')}
                </span>
              </div>
              <div className="h-10 w-10 rounded-full bg-brand-800 border border-brand-700 flex items-center justify-center text-brand-300 hover:border-brand-600 transition-colors cursor-pointer">
                <User className="h-5 w-5" />
              </div>
            </div>
          </header>

          <div className={fullWidth ? "h-[calc(100vh-5rem)]" : "p-8 max-w-7xl mx-auto"}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={fullWidth ? "w-full h-full" : ""}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Mobile layout */}
      <div
        className={cx(
          "lg:hidden flex flex-col",
          fullWidth ? "fixed inset-0 z-0" : "min-h-screen"
        )}
        style={fullWidth ? { touchAction: 'none', overscrollBehavior: 'none' } : undefined}
      >
        <header className="flex-shrink-0 z-20 h-16 px-4 flex items-center justify-between bg-brand-950/90 backdrop-blur-md border-b border-brand-800">
          <img
            src="/tumaro-logo.png"
            alt="Tumaro"
            className="h-5 object-contain"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMessages(true)}
              className="relative p-2 rounded-full bg-brand-900 border border-brand-800"
            >
              <MessageCircle className="h-4 w-4 text-brand-300" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border-2 border-brand-950">
                  <span className="text-[10px] text-white font-bold">{unreadCount}</span>
                </div>
              )}
            </button>
            <UserMenu compact />
          </div>
        </header>

        <div className={cx(
          "flex-1 min-h-0",
          fullWidth ? "overflow-hidden relative" : "pb-20 overflow-y-auto"
        )}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={fullWidth ? "w-full h-full" : "min-h-full p-4 pb-24"}
          >
            {children}
          </motion.div>
        </div>

        {/* For fullWidth (map) pages: nav is part of flex layout so content ends at nav top.
            For normal pages: nav is fixed overlay with pb-20 padding on content. */}
        <nav className={cx(
          "h-20 bg-brand-900/90 backdrop-blur-lg border-t border-brand-800 pb-safe",
          fullWidth ? "flex-shrink-0 z-20" : "fixed bottom-0 left-0 right-0 z-50"
        )}>
          <div className="grid grid-cols-5 h-full relative">
            {bottomNavItemKeys.map((it) => {
              const Icon = it.icon;
              const href = `${base}${it.href}`;
              const active = isActive(it.href.split("/").pop() || "");

              return (
                <Link key={it.key} href={href} className="relative flex flex-col items-center justify-center gap-1 h-full">
                  {active && (
                    <motion.div
                      layoutId="mobileActiveTab"
                      className="absolute inset-x-2 top-2 bottom-2 bg-brand-800 rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={cx("h-6 w-6 transition-colors", active ? "text-accent-DEFAULT" : "text-brand-300")} />
                  <span className={cx("text-[10px] font-medium transition-colors", active ? "text-brand-100" : "text-brand-400")}>
                    {t(it.labelKey)}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Messages Inbox Overlay */}
      <AnimatePresence>
        {showMessages && <MessagesInbox />}
      </AnimatePresence>
    </div>
  );
}
