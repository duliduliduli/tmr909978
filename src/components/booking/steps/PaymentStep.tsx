"use client";

import { useState } from 'react';
import { CreditCard, Lock, DollarSign, Plus } from 'lucide-react';
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

export function PaymentStep({
  bookingData,
  updateBookingData,
  onNext,
  onPrev,
  isLoading,
  setIsLoading,
  setError
}: PaymentStepProps) {
  const [paymentMethod, setPaymentMethod] = useState('new');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [tipAmount, setTipAmount] = useState(0);
  const [saveCard, setSaveCard] = useState(false);

  // Mock saved cards
  const savedCards = [
    { id: 'card_1', last4: '4242', brand: 'visa', expiry: '12/25' },
    { id: 'card_2', last4: '5555', brand: 'mastercard', expiry: '08/26' }
  ];

  // Calculate pricing
  const baseAmount = 7500; // $75.00 - mock service price
  const addOnAmount = 0;
  const subtotal = baseAmount + addOnAmount;
  const taxAmount = Math.round(subtotal * 0.0875); // 8.75% tax
  const totalBeforeTip = subtotal + taxAmount;
  const finalTotal = totalBeforeTip + (tipAmount * 100);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const handleCardInputChange = (field: string, value: string) => {
    let formattedValue = value;

    if (field === 'number') {
      // Format card number with spaces
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    } else if (field === 'expiry') {
      // Format expiry as MM/YY
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
    } else if (field === 'cvc') {
      // Limit CVC to 3-4 digits
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardDetails(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleTipSelect = (percentage: number) => {
    const tipDollars = Math.round(totalBeforeTip * (percentage / 100)) / 100;
    setTipAmount(tipDollars);
  };

  const handleCustomTip = (value: string) => {
    const tipDollars = parseFloat(value) || 0;
    setTipAmount(tipDollars);
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful payment
      updateBookingData({
        paymentMethodId: paymentMethod === 'new' ? 'pm_new_card' : paymentMethod,
        tipAmount: tipAmount * 100 // Convert to cents
      });

      onNext();
    } catch (error: any) {
      setError('Payment processing failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = paymentMethod !== 'new' || (
    cardDetails.number.length >= 19 &&
    cardDetails.expiry.length === 5 &&
    cardDetails.cvc.length >= 3 &&
    cardDetails.name.trim().length > 0
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Information</h3>
        <p className="text-sm text-gray-600">
          Secure payment processing with Stripe. Your card information is encrypted and secure.
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Order Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Service (Premium Exterior Detail)</span>
            <span className="text-gray-900">{formatPrice(baseAmount)}</span>
          </div>
          {addOnAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Add-ons</span>
              <span className="text-gray-900">{formatPrice(addOnAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="text-gray-900">{formatPrice(taxAmount)}</span>
          </div>
          {tipAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tip</span>
              <span className="text-gray-900">{formatPrice(tipAmount * 100)}</span>
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
          {[15, 18, 20, 25].map(percentage => (
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

      {/* Payment Method */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Payment Method</h4>
        
        {/* Saved Cards */}
        {savedCards.length > 0 && (
          <div className="space-y-2 mb-4">
            {savedCards.map(card => (
              <label
                key={card.id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === card.id
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={card.id}
                  checked={paymentMethod === card.id}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  paymentMethod === card.id ? 'border-teal-500' : 'border-gray-300'
                }`}>
                  {paymentMethod === card.id && (
                    <div className="w-2 h-2 rounded-full bg-teal-500" />
                  )}
                </div>
                <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">
                    •••• •••• •••• {card.last4}
                  </div>
                  <div className="text-sm text-gray-500">
                    {card.brand.toUpperCase()} • Expires {card.expiry}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        {/* New Card Option */}
        <label
          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
            paymentMethod === 'new'
              ? 'border-teal-500 bg-teal-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="radio"
            name="payment"
            value="new"
            checked={paymentMethod === 'new'}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="sr-only"
          />
          <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
            paymentMethod === 'new' ? 'border-teal-500' : 'border-gray-300'
          }`}>
            {paymentMethod === 'new' && (
              <div className="w-2 h-2 rounded-full bg-teal-500" />
            )}
          </div>
          <Plus className="h-5 w-5 text-gray-400 mr-3" />
          <div className="font-medium text-gray-900">Use new card</div>
        </label>
      </div>

      {/* New Card Form */}
      {paymentMethod === 'new' && (
        <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Number *
            </label>
            <input
              type="text"
              value={cardDetails.number}
              onChange={(e) => handleCardInputChange('number', e.target.value)}
              placeholder="1234 5678 9012 3456"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              maxLength={19}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry *
              </label>
              <input
                type="text"
                value={cardDetails.expiry}
                onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                placeholder="MM/YY"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                maxLength={5}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVC *
              </label>
              <input
                type="text"
                value={cardDetails.cvc}
                onChange={(e) => handleCardInputChange('cvc', e.target.value)}
                placeholder="123"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                maxLength={4}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cardholder Name *
            </label>
            <input
              type="text"
              value={cardDetails.name}
              onChange={(e) => handleCardInputChange('name', e.target.value)}
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={saveCard}
              onChange={(e) => setSaveCard(e.target.checked)}
              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              Save this card for future bookings
            </span>
          </label>
        </div>
      )}

      {/* Security Notice */}
      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
        <Lock className="h-5 w-5 text-green-600 mr-2" />
        <div className="text-sm text-gray-600">
          Your payment information is encrypted and secure. We use Stripe for payment processing.
        </div>
      </div>

      {/* Complete Payment Button */}
      <div className="pt-4">
        <button
          onClick={handlePayment}
          disabled={!isFormValid || isLoading}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
            !isFormValid || isLoading
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </div>
          ) : (
            `Complete Payment ${formatPrice(finalTotal)}`
          )}
        </button>
      </div>
    </div>
  );
}