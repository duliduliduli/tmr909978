"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Map, Wallet, User, HelpCircle, ChevronRight } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { key: "home", label: "Home", icon: Home, href: "/home" },
  { key: "map", label: "Map", icon: Map, href: "/map" },
  { key: "wallet", label: "Wallet", icon: Wallet, href: "/wallet" },
  { key: "account", label: "Account", icon: User, href: "/account" },
  { key: "help", label: "Help", icon: HelpCircle, href: "/help" },
];

function cx(...c: Array<string | false | undefined>) {
  return c.filter(Boolean).join(" ");
}

export function AppShell({ children, title }: { children: React.ReactNode; title: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, setRole } = useAppStore();

  const base = role === "detailer" ? "/detailer" : "/customer";

  function switchRole(nextRole: "customer" | "detailer") {
    setRole(nextRole);
    const nextBase = nextRole === "detailer" ? "/detailer" : "/customer";
    const tab = pathname.split("/").slice(-1)[0] || "home";
    router.push(`${nextBase}/${tab}`);
  }

  const isActive = (tabHref: string) => pathname.includes(tabHref);

  return (
    <div className="min-h-screen bg-brand-950 text-brand-50 font-sans">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <aside className="fixed left-0 top-0 h-screen w-72 bg-brand-900 border-r border-brand-800 shadow-2xl z-20">
          <div className="h-20 px-6 flex items-center gap-4 border-b border-brand-800/50">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent-DEFAULT to-blue-600 shadow-lg shadow-accent/20 flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <div className="font-bold text-lg tracking-tight text-white">Mobile Detailer</div>
          </div>

          <nav className="p-4 space-y-2 mt-4">
            {navItems.map((it) => {
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
                    <span>{it.label}</span>
                    {active && <motion.div layoutId="activeGlow" className="absolute right-3 w-1.5 h-1.5 rounded-full bg-accent-DEFAULT shadow-[0_0_8px_rgba(56,189,248,0.8)]" />}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-brand-800/50 bg-brand-900">
            <div className="text-xs uppercase tracking-wider text-brand-500 font-semibold mb-3">Switch Mode</div>
            <div className="flex bg-brand-950 p-1 rounded-xl border border-brand-800">
              <button
                onClick={() => switchRole("customer")}
                className={cx(
                  "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300",
                  role === "customer"
                    ? "bg-brand-800 text-white shadow-lg shadow-black/20"
                    : "text-brand-500 hover:text-brand-300"
                )}
              >
                Customer
              </button>
              <button
                onClick={() => switchRole("detailer")}
                className={cx(
                  "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300",
                  role === "detailer"
                    ? "bg-brand-800 text-white shadow-lg shadow-black/20"
                    : "text-brand-500 hover:text-brand-300"
                )}
              >
                Detailer
              </button>
            </div>
          </div>
        </aside>

        <main className="ml-72 w-full min-h-screen bg-brand-950 relative">
          {/* Header */}
          <header className="sticky top-0 z-10 h-20 px-8 flex items-center justify-between bg-brand-950/80 backdrop-blur-md border-b border-brand-800/50">
            <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
            <div className="flex items-center gap-4">
              <div className="bg-brand-900 border border-brand-800 rounded-full px-4 py-1.5 flex items-center gap-2">
                <div className={cx(
                  "w-2 h-2 rounded-full",
                  role === "customer" ? "bg-accent-DEFAULT shadow-[0_0_8px_rgba(56,189,248,0.5)]" : "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                )} />
                <span className="text-xs font-semibold text-brand-300 uppercase tracking-wide">
                  {role === "customer" ? "Customer Mode" : "Detailer Mode"}
                </span>
              </div>
              <div className="h-10 w-10 rounded-full bg-brand-800 border border-brand-700 flex items-center justify-center text-brand-300 hover:border-brand-600 transition-colors cursor-pointer">
                <User className="h-5 w-5" />
              </div>
            </div>
          </header>

          <div className="p-8 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 h-16 px-4 flex items-center justify-between bg-brand-950/90 backdrop-blur-md border-b border-brand-800">
          <div className="font-bold text-lg text-white">{title}</div>
          <button
            onClick={() => switchRole(role === "customer" ? "detailer" : "customer")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-900 border border-brand-800 text-xs font-medium text-brand-300"
          >
            <div className={cx("w-2 h-2 rounded-full", role === 'customer' ? 'bg-accent-DEFAULT' : 'bg-purple-500')} />
            {role === "customer" ? "Customer" : "Detailer"}
          </button>
        </header>

        <div className="flex-1 p-4 pb-24 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-brand-900/90 backdrop-blur-lg border-t border-brand-800 z-50 pb-safe">
          <div className="grid grid-cols-5 h-full relative">
            {navItems.map((it) => {
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
                  <Icon className={cx("h-6 w-6 transition-colors", active ? "text-accent-DEFAULT" : "text-brand-500")} />
                  <span className={cx("text-[10px] font-medium transition-colors", active ? "text-brand-100" : "text-brand-600")}>
                    {it.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}