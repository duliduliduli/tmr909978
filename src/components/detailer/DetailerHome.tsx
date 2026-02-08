"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { QrCode, DollarSign, Clock, X, Download, Share2, Copy, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/i18n";

export function DetailerHome() {
  const { t } = useTranslation();
  const { activeDetailerId, getQRCodeByDetailer, authUser } = useAppStore();
  const todaysAppointments = useAppStore.getState().getTodaysAppointments(activeDetailerId);
  const [showOnMap, setShowOnMap] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const qrCode = getQRCodeByDetailer(activeDetailerId);

  // Compute real stats from today's appointments
  const projectedEarnings = todaysAppointments.reduce((sum, apt) => sum + apt.price, 0);
  const totalMinutes = todaysAppointments.reduce((sum, apt) => sum + apt.duration, 0);
  const workloadHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-600 to-blue-700 p-8 shadow-2xl shadow-accent/10"
      >
        <div className="relative z-10 text-white">
          <h1 className="text-3xl font-bold mb-2">{t('detailerHome.goodMorning')}, {authUser?.firstName || 'there'}!</h1>
          <p className="text-blue-100 mb-8 max-w-md text-lg">
            {todaysAppointments.length} {todaysAppointments.length !== 1 ? t('detailerHome.appointmentsRemainingPlural') : t('detailerHome.appointmentsRemaining')} {t('detailerHome.remainingToday')}.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10">
              <div className="p-2 bg-white/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-blue-100">{t('detailerHome.projected')}</div>
                <div className="font-bold text-xl">${projectedEarnings}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10">
              <div className="p-2 bg-white/20 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-blue-100">{t('detailerHome.workload')}</div>
                <div className="font-bold text-xl">{workloadHours} {t('detailerHome.hrs')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      </motion.div>

      {/* Quick Actions - Just Share QR */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={() => setShowQRModal(true)}
        className="w-full bg-brand-900 rounded-2xl p-6 border border-brand-800 hover:border-brand-700 hover:bg-brand-800 transition-all text-left group"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <QrCode className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white mb-1">{t('detailerHome.shareQRCode')}</h3>
            <p className="text-sm text-brand-400">{t('detailerHome.qrCodeDesc')}</p>
          </div>
        </div>
      </motion.button>

      {/* Show on Map Toggle */}
      <div className="bg-brand-900 rounded-2xl p-5 border border-brand-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${showOnMap ? 'bg-emerald-500/10' : 'bg-brand-800'}`}>
            <div className={`h-3 w-3 rounded-full ${showOnMap ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-brand-600'}`} />
          </div>
          <div>
            <h3 className="font-bold text-white">{t('detailerHome.showOnMap')}</h3>
            <p className="text-sm text-brand-400">
              {showOnMap ? t('detailerHome.customersCanFind') : t('detailerHome.hiddenFromMap')}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={() => setShowOnMap(!showOnMap)}
          className={`w-14 h-8 rounded-full relative transition-colors ${
            showOnMap
              ? 'bg-emerald-500/20 border border-emerald-500/30'
              : 'bg-brand-800 border border-brand-700'
          }`}
        >
          <div className={`absolute top-1 w-6 h-6 rounded-full shadow-lg transition-all ${
            showOnMap
              ? 'right-1 bg-emerald-400'
              : 'left-1 bg-brand-500'
          }`} />
        </button>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-lg">{t('detailerHome.shareQRCode')}</h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {qrCode ? (
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-xl inline-block shadow-lg border border-gray-200 mb-4">
                      <img
                        src={qrCode.qrCodeData}
                        alt="Business QR Code"
                        className="w-48 h-48"
                      />
                    </div>

                    <p className="text-gray-600 text-sm mb-4">
                      {t('detailerHome.customersScan')}
                    </p>

                    {/* Booking URL */}
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="text"
                        value={qrCode.businessUrl}
                        readOnly
                        className="flex-1 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(qrCode.businessUrl);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="p-2 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-600" />
                        )}
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.download = `tumaro-qr-${activeDetailerId}.png`;
                          link.href = qrCode.qrCodeData;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        {t('detailerHome.download')}
                      </button>

                      <button
                        onClick={async () => {
                          if (navigator.share) {
                            try {
                              await navigator.share({
                                title: t('detailerHome.bookWithUs'),
                                text: t('detailerHome.bookDetailingService'),
                                url: qrCode.businessUrl,
                              });
                            } catch (error) {
                              console.error('Error sharing:', error);
                            }
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Share2 className="h-4 w-4" />
                        {t('detailerHome.share')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="h-8 w-8 text-amber-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{t('detailerHome.noQRCodeYet')}</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      {t('detailerHome.createQRCode')}
                    </p>
                    <button
                      onClick={() => {
                        setShowQRModal(false);
                        // Could navigate to QR code page here
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t('detailerHome.goToQRSettings')}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}