"use client";

import { useState, useEffect, useCallback } from 'react';
import { Lock, DollarSign } from 'lucide-react';
import {
  Elements,
  PaymentElement,
  PaymentRequestButtonElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import type { PaymentRequest } from '@stripe/stripe-js';
import { getStripe } from '@/lib/stripe/getStripe';
import { BookingData } from '../BookingWizard';

interface PaymentStepProps {
  bookingData: BookingData;
  updateBookingData: (updates: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const BODY_TYPE_LABELS: Record<string, string> = {
  car: 'Car',
  van: 'Van',
  truck: 'Truck',
  suv: 'SUV',
};

/* ─── Outer wrapper: fetches clientSecret, then renders <Elements> ─── */
export function PaymentStep(props: PaymentStepProps) {
  const { bookingData, setError } = props;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [tipAmount, setTipAmount] = useState(0);
  const [intentLoading, setIntentLoading] = useState(true);

  // Calculate pricing (same logic as before)
  const vehicleSubtotalCents = Math.round(
    (bookingData.totalPrice || bookingData.vehicles.reduce((sum, v) => sum + v.adjustedPrice, 0)) * 100
  );
  const transactionFeeCents = Math.round(vehicleSubtotalCents * 0.04);
  const totalBeforeTip = vehicleSubtotalCents + transactionFeeCents;
  const tipCents = Math.round(tipAmount * 100);
  const finalTotal = totalBeforeTip + tipCents;

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

  // Create or update PaymentIntent whenever finalTotal changes
  useEffect(() => {
    if (finalTotal < 50) return; // Stripe minimum

    const controller = new AbortController();
    setIntentLoading(true);

    fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: totalBeforeTip,
        tipAmount: tipCents,
        metadata: {
          vehicleCount: String(bookingData.vehicles.length),
          providerId: bookingData.providerId ?? '',
        },
      }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Payment setup failed');
        }
        return res.json();
      })
      .then(({ clientSecret: cs, paymentIntentId: id }) => {
        setClientSecret(cs);
        setPaymentIntentId(id);
        setIntentLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('create-intent error:', err);
          setError(err.message);
          setIntentLoading(false);
        }
      });

    return () => controller.abort();
  }, [finalTotal]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTipSelect = (percentage: number) => {
    const tipDollars = Math.round(totalBeforeTip * (percentage / 100)) / 100;
    setTipAmount(tipDollars);
  };

  const handleCustomTip = (value: string) => {
    setTipAmount(parseFloat(value) || 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Information</h3>
        <p className="text-sm text-gray-600">
          Secure payment processing. Your information is encrypted and secure.
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
        <div className="space-y-2">
          {bookingData.vehicles.map((vehicle) => (
            <div key={vehicle.id} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {vehicle.serviceName} ({BODY_TYPE_LABELS[vehicle.bodyType] || vehicle.bodyType})
                {vehicle.luxuryCare ? ' + Luxury' : ''}
              </span>
              <span className="text-gray-900">{formatPrice(Math.round(vehicle.adjustedPrice * 100))}</span>
            </div>
          ))}
          {bookingData.vehicles.length === 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Services</span>
              <span className="text-gray-900">{formatPrice(vehicleSubtotalCents)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Transaction Fee (4%)</span>
            <span className="text-gray-900">{formatPrice(transactionFeeCents)}</span>
          </div>
          {tipCents > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tip</span>
              <span className="text-gray-900">{formatPrice(tipCents)}</span>
            </div>
          )}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-medium">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tip Selection */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Add Tip (Optional)</h4>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[15, 18, 20, 25].map((percentage) => (
            <button
              key={percentage}
              onClick={() => handleTipSelect(percentage)}
              className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                Math.round(tipAmount * 100) === Math.round(totalBeforeTip * (percentage / 100))
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {percentage}%
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <input
            type="number"
            placeholder="Custom amount"
            value={tipAmount || ''}
            onChange={(e) => handleCustomTip(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            min="0"
            step="0.50"
          />
        </div>
      </div>

      {/* Stripe Payment */}
      {intentLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mr-3" />
          <span className="text-gray-600">Setting up secure payment...</span>
        </div>
      ) : clientSecret ? (
        <Elements
          stripe={getStripe()}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#0d9488',
                borderRadius: '8px',
              },
            },
          }}
        >
          <PaymentForm
            clientSecret={clientSecret}
            paymentIntentId={paymentIntentId!}
            finalTotal={finalTotal}
            tipCents={tipCents}
            formatPrice={formatPrice}
            bookingData={bookingData}
            updateBookingData={props.updateBookingData}
            onNext={props.onNext}
            isLoading={props.isLoading}
            setIsLoading={props.setIsLoading}
            setError={setError}
          />
        </Elements>
      ) : (
        <div className="text-center py-6 text-red-600 text-sm">
          Unable to set up payment. Please go back and try again.
        </div>
      )}

      {/* Security Notice */}
      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
        <Lock className="h-5 w-5 text-green-600 mr-2" />
        <div className="text-sm text-gray-600">
          Your payment information is encrypted and secure. We use Stripe for payment processing.
        </div>
      </div>
    </div>
  );
}

/* ─── Inner form: runs inside <Elements>, has access to useStripe() ─── */

interface PaymentFormProps {
  clientSecret: string;
  paymentIntentId: string;
  finalTotal: number;
  tipCents: number;
  formatPrice: (cents: number) => string;
  bookingData: BookingData;
  updateBookingData: (updates: Partial<BookingData>) => void;
  onNext: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

function PaymentForm({
  clientSecret,
  paymentIntentId,
  finalTotal,
  tipCents,
  formatPrice,
  updateBookingData,
  onNext,
  isLoading,
  setIsLoading,
  setError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);

  // Set up Apple Pay / Google Pay via PaymentRequest
  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: 'Tumaro Detailing',
        amount: finalTotal,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) {
        setCanMakePayment(true);
        setPaymentRequest(pr);
      }
    });

    pr.on('paymentmethod', async (ev) => {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: ev.paymentMethod.id },
        { handleActions: false }
      );

      if (error) {
        ev.complete('fail');
        setError(error.message ?? 'Payment failed');
      } else if (paymentIntent?.status === 'requires_action') {
        ev.complete('success');
        const { error: confirmError } = await stripe.confirmCardPayment(clientSecret);
        if (confirmError) {
          setError(confirmError.message ?? 'Payment confirmation failed');
        } else {
          handleSuccess();
        }
      } else {
        ev.complete('success');
        handleSuccess();
      }
    });
  }, [stripe, finalTotal]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSuccess = useCallback(() => {
    updateBookingData({
      paymentMethodId: 'stripe_confirmed',
      tipAmount: tipCents,
      stripePaymentIntentId: paymentIntentId,
    });
    onNext();
  }, [updateBookingData, tipCents, paymentIntentId, onNext]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setError(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href, // Not used since redirect: 'if_required'
      },
      redirect: 'if_required',
    });

    if (error) {
      setError(error.message ?? 'Payment failed. Please try again.');
      setIsLoading(false);
    } else if (paymentIntent?.status === 'succeeded') {
      setIsLoading(false);
      handleSuccess();
    } else {
      setError('Unexpected payment status. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Apple Pay / Google Pay button (shows only when available) */}
      {canMakePayment && paymentRequest && (
        <>
          <PaymentRequestButtonElement
            options={{
              paymentRequest,
              style: {
                paymentRequestButton: {
                  type: 'default',
                  theme: 'dark',
                  height: '48px',
                },
              },
            }}
          />
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or pay with card</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>
        </>
      )}

      {/* Stripe PaymentElement (PCI-compliant card form) */}
      <PaymentElement
        onReady={() => setPaymentReady(true)}
        options={{
          layout: 'tabs',
        }}
      />

      {/* Pay Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={!stripe || !paymentReady || isLoading}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
            !stripe || !paymentReady || isLoading
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Processing Payment...
            </div>
          ) : (
            `Complete Payment ${formatPrice(finalTotal)}`
          )}
        </button>
      </div>
    </form>
  );
}
