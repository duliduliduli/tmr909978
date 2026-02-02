"use client";

import { useState, useEffect } from 'react';
import { QrCode, Download, Share2, Copy, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';

export function QRCodeManager() {
  const { activeDetailerId, generateQRCode, getQRCodeByDetailer } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState<any>(null);

  // Check if QR code already exists
  useEffect(() => {
    const existingQR = getQRCodeByDetailer(activeDetailerId);
    if (existingQR) {
      setQrCode(existingQR);
    }
  }, [activeDetailerId, getQRCodeByDetailer]);

  const handleGenerateQR = async () => {
    setIsGenerating(true);
    try {
      // Generate QR code with business name (you might want to get this from profile)
      await generateQRCode(activeDetailerId, 'Premium Auto Spa');
      const newQR = getQRCodeByDetailer(activeDetailerId);
      setQrCode(newQR);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.download = `tumaro-qr-${activeDetailerId}.png`;
    link.href = qrCode.qrCodeData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = () => {
    if (!qrCode) return;
    
    navigator.clipboard.writeText(qrCode.businessUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!qrCode) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Book with Premium Auto Spa',
          text: 'Book your auto detailing service with us!',
          url: qrCode.businessUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">QR Code for Your Business</h2>
        <p className="text-gray-600 mt-1">
          Generate a QR code that customers can scan to book directly with you
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!qrCode ? (
          // Generate QR Code Section
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 text-center"
          >
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <QrCode className="h-12 w-12 text-blue-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Create Your Business QR Code
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Generate a unique QR code that customers can scan to instantly access your booking page
            </p>
            
            <button
              onClick={handleGenerateQR}
              disabled={isGenerating}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="h-5 w-5" />
                  Generate QR Code
                </>
              )}
            </button>
          </motion.div>
        ) : (
          // Display QR Code Section
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* QR Code Display */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
              <div className="bg-white p-4 rounded-xl inline-block shadow-xl mb-6">
                <img
                  src={qrCode.qrCodeData}
                  alt="Business QR Code"
                  className="w-64 h-64"
                />
              </div>
              
              <p className="text-sm text-gray-500 mb-4">
                Generated on {new Date(qrCode.generatedAt).toLocaleDateString()}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Info & Instructions */}
            <div className="space-y-6">
              {/* Booking URL */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Your Booking URL</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={qrCode.businessUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">How to Use Your QR Code</h4>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      1
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">Print & Display</p>
                      <p className="text-sm text-gray-600">
                        Print the QR code and display it on your vehicle, business cards, or storefront
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      2
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">Share Digitally</p>
                      <p className="text-sm text-gray-600">
                        Add to your social media profiles, website, or email signature
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      3
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">Track Bookings</p>
                      <p className="text-sm text-gray-600">
                        Customers who scan will be directed to your personalized booking page
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Benefits */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h4 className="font-semibold text-green-800 mb-2">Benefits</h4>
                <ul className="space-y-1 text-sm text-green-700">
                  <li>• No app download required for customers</li>
                  <li>• Works with any smartphone camera</li>
                  <li>• Direct access to your services & pricing</li>
                  <li>• Increases walk-up bookings by 40%</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Marketing Tips */}
      {qrCode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 rounded-xl p-6"
        >
          <h4 className="font-semibold text-blue-900 mb-3">💡 Pro Tips</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p className="font-medium mb-1">Vehicle Wrap</p>
              <p>Add the QR code to your vehicle wrap for instant bookings while parked</p>
            </div>
            <div>
              <p className="font-medium mb-1">Loyalty Cards</p>
              <p>Include on loyalty cards so customers can easily rebook</p>
            </div>
            <div>
              <p className="font-medium mb-1">Service Complete</p>
              <p>Leave a card with QR code after completing service</p>
            </div>
            <div>
              <p className="font-medium mb-1">Social Media</p>
              <p>Share in your bio links on Instagram and Facebook</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}