"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Map, Wallet, User, HelpCircle } from "lucide-react";
import { useAppStore } from "@/lib/store";

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
    // preserve tab (home/map/wallet/account/help) if possible
    const tab = pathname.split("/").slice(-1)[0] || "home";
    router.push(`${nextBase}/${tab}`);
  }

  const isActive = (tabHref: string) => pathname.includes(tabHref);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <aside className="fixed left-0 top-0 h-screen w-72 bg-white/80 backdrop-blur border-r border-gray-200">
          <div className="h-16 px-5 flex items-center gap-3 border-b border-gray-200">
            <div className="h-9 w-9 rounded-xl bg-teal-500" />
            <div className="font-bold text-gray-900">Mobile Detailer</div>
          </div>

          <nav className="p-3">
            {navItems.map((it) => {
              const Icon = it.icon;
              const href = `${base}${it.href}`;
              const active = isActive(it.href.split("/").pop() || "");
              return (
                <Link
                  key={it.key}
                  href={href}
                  className={cx(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors",
                    active ? "bg-teal-50 text-teal-700" : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className={cx("h-5 w-5", active && "text-teal-600")} />
                  {it.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-2">Mode</div>
            <div className="flex gap-2">
              <button
                onClick={() => switchRole("customer")}
                className={cx(
                  "flex-1 rounded-lg px-3 py-2 text-sm border transition-colors",
                  role === "customer" ? "bg-teal-500 text-white border-teal-500" : "bg-white border-gray-300 hover:bg-gray-50"
                )}
              >
                Customer
              </button>
              <button
                onClick={() => switchRole("detailer")}
                className={cx(
                  "flex-1 rounded-lg px-3 py-2 text-sm border transition-colors",
                  role === "detailer" ? "bg-teal-500 text-white border-teal-500" : "bg-white border-gray-300 hover:bg-gray-50"
                )}
              >
                Detailer
              </button>
            </div>
          </div>
        </aside>

        <main className="ml-72 w-full">
          <header className="sticky top-0 z-10 h-16 px-6 flex items-center justify-between bg-white/80 backdrop-blur border-b border-gray-200">
            <div className="text-lg font-semibold text-gray-900">{title}</div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700">Profile</div>
              <div className="px-2 py-1 rounded bg-teal-100 text-teal-700 text-xs font-medium">
                {role === "customer" ? "Customer" : "Detailer"}
              </div>
            </div>
          </header>
          <div className="p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden">
        <header className="sticky top-0 z-10 h-14 px-4 flex items-center justify-between bg-white/80 backdrop-blur border-b border-gray-200">
          <div className="font-semibold text-gray-900">{title}</div>
          <button
            onClick={() => switchRole(role === "customer" ? "detailer" : "customer")}
            className="text-sm px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100"
          >
            {role === "customer" ? "Customer" : "Detailer"}
          </button>
        </header>

        <div className="p-4 pb-24">{children}</div>

        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur border-t border-gray-200 z-50">
          <div className="grid grid-cols-5 h-full">
            {navItems.map((it) => {
              const Icon = it.icon;
              const href = `${base}${it.href}`;
              const active = isActive(it.href.split("/").pop() || "");
              return (
                <Link key={it.key} href={href} className="flex flex-col items-center justify-center gap-1">
                  <Icon className={cx("h-5 w-5", active ? "text-teal-600" : "text-gray-500")} />
                  <div className={cx("text-[11px]", active ? "text-teal-700 font-medium" : "text-gray-600")}>
                    {it.label}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}