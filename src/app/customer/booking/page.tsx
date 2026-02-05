"use client";

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BookingWizard } from '@/components/booking/BookingWizard';
import { ArrowLeft } from 'lucide-react';

function BookingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const detailerId = searchParams.get('detailerId');

  const handleComplete = (bookingId: string) => {
    router.push('/customer/appointments');
  };

  if (!detailerId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center px-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No detailer selected</h2>
          <p className="text-gray-600 mb-4">Please select a detailer from the map first.</p>
          <button
            onClick={() => router.push('/customer/map')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      <div className="py-6 px-4">
        <BookingWizard
          providerId={detailerId}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading booking...</p>
        </div>
      </div>
    }>
      <BookingPageContent />
    </Suspense>
  );
}
