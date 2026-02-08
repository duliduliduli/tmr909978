"use client";

import Link from "next/link";
import { ChevronRight, Star, Shield, Zap } from "lucide-react";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useTranslation } from "@/lib/i18n";

export default function HomePage() {
  const { t } = useTranslation();

  const features = [
    { titleKey: "landing.instantBooking", descKey: "landing.instantBookingDesc", icon: Zap, color: "text-amber-400" },
    { titleKey: "landing.vettedPros", descKey: "landing.vettedProsDesc", icon: Shield, color: "text-accent-DEFAULT" },
    { titleKey: "landing.topQuality", descKey: "landing.topQualityDesc", icon: Star, color: "text-purple-400" },
  ];

  return (
    <div className="min-h-screen bg-brand-950 overflow-hidden relative selection:bg-accent-DEFAULT/30">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-accent-DEFAULT/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-brand-800/50 bg-brand-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center">
              {/* Language Switch - Only on landing page */}
              <LanguageSwitch />
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/sign-in"
                className="text-sm font-medium text-brand-300 hover:text-white transition-colors"
              >
                {t('landing.signIn')}
              </Link>
              <Link
                href="/sign-up?role=business"
                className="text-sm font-medium text-brand-300 hover:text-white transition-colors border border-brand-700 rounded-xl px-5 py-2.5 hover:border-brand-500"
              >
                For Business
              </Link>
              <Link
                href="/sign-up?role=customer"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-accent-DEFAULT px-6 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(56,189,248,0.5)]"
              >
                <span className="z-10">Sign Up</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">

            <div className="mb-8 flex flex-col items-center gap-6">
              <img
                src="/tumaro-logo.png"
                alt="Tumaro"
                className="h-12 sm:h-16 object-contain"
              />
              <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-DEFAULT to-blue-500 sm:text-6xl leading-tight">
                {t('landing.tagline')}
              </h1>
            </div>

            <p className="mx-auto max-w-2xl text-lg text-brand-400 mb-10 leading-relaxed">
              {t('landing.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/sign-up?role=customer"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-brand-950 font-bold text-lg shadow-xl shadow-white/10 hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {t('landing.customerPortal')}
                <ChevronRight className="h-5 w-5" />
              </Link>
              <Link
                href="/sign-up?role=business"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-900 border border-brand-700 text-white font-semibold text-lg hover:bg-brand-800 transition-all duration-300 flex items-center justify-center"
              >
                {t('landing.businessPortal')}
              </Link>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="group p-6 rounded-3xl bg-brand-900/50 border border-brand-800 hover:bg-brand-800/80 hover:border-brand-700 transition-all duration-300 backdrop-blur-sm">
                <div className={`h-12 w-12 rounded-2xl bg-brand-950 border border-brand-800 flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t(feature.titleKey)}</h3>
                <p className="text-brand-400">{t(feature.descKey)}</p>
              </div>
            ))}
          </div>

          {/* App Preview Section */}
          <div className="mt-32 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-transparent to-transparent z-10" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="relative z-10 pl-4 lg:pl-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  {t('landing.enterprisePower')}<br />
                  <span className="text-brand-400">{t('landing.consumerSimplicity')}</span>
                </h2>
                <p className="text-brand-400 text-lg mb-8 max-w-md">
                  {t('landing.platformDesc')}
                </p>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-brand-900/50 border border-brand-800/50">
                    <div className="h-10 w-10 text-2xl flex items-center justify-center bg-brand-800 rounded-xl">🚀</div>
                    <div>
                      <div className="text-white font-semibold">{t('landing.productionReady')}</div>
                      <div className="text-sm text-brand-500">{t('landing.productionReadyDesc')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-brand-900/50 border border-brand-800/50">
                    <div className="h-10 w-10 text-2xl flex items-center justify-center bg-brand-800 rounded-xl">💎</div>
                    <div>
                      <div className="text-white font-semibold">{t('landing.premiumUX')}</div>
                      <div className="text-sm text-brand-500">{t('landing.premiumUXDesc')}</div>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <Link
                    href="/test-booking"
                    className="inline-flex items-center gap-2 text-accent-DEFAULT font-medium hover:text-accent-hover transition-colors"
                  >
                    {t('landing.exploreBooking')} <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="relative h-[600px] w-full bg-brand-900/30 rounded-[3rem] border border-brand-800/50 p-8 flex items-center justify-center overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-800/20 to-transparent opacity-50" />

                {/* Mockup Card */}
                <div className="relative w-80 bg-brand-900 rounded-3xl p-6 border border-brand-700 shadow-2xl transform transition-transform duration-700 group-hover:-translate-y-4 group-hover:scale-105">
                  {/* Mockup Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-8 w-8 rounded-full bg-brand-800" />
                    <div className="h-2 w-20 rounded-full bg-brand-800" />
                  </div>
                  {/* Mockup Map */}
                  <div className="h-40 rounded-2xl bg-brand-800 mb-6 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="h-3 w-3 bg-accent-DEFAULT rounded-full shadow-[0_0_15px_rgba(56,189,248,0.8)] animate-pulse" />
                    </div>
                  </div>
                  {/* Mockup List */}
                  <div className="space-y-3">
                    <div className="h-16 rounded-xl bg-brand-800/50 border border-brand-800/50 p-3 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-brand-800" />
                      <div className="space-y-1">
                        <div className="h-2 w-24 rounded-full bg-brand-700" />
                        <div className="h-2 w-16 rounded-full bg-brand-800" />
                      </div>
                    </div>
                    <div className="h-16 rounded-xl bg-brand-800/50 border border-brand-800/50 p-3 flex items-center gap-3 opacity-50">
                      <div className="h-10 w-10 rounded-lg bg-brand-800" />
                      <div className="space-y-1">
                        <div className="h-2 w-24 rounded-full bg-brand-700" />
                        <div className="h-2 w-16 rounded-full bg-brand-800" />
                      </div>
                    </div>
                  </div>

                  {/* Floating Badge */}
                  <div className="absolute -right-4 top-10 bg-accent-DEFAULT text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-12">
                    {t('landing.liveDemo')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
