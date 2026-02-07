import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paymentRateLimit, checkRateLimit } from '@/lib/rateLimit';

// POST /api/coins/redeem - Redeem coins for discount
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await checkRateLimit(paymentRateLimit, ip);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const { customerId, coinId, coinsToRedeem, bookingTotal, bookingId } = body;

    if (!customerId || !coinId || !coinsToRedeem || bookingTotal === undefined || bookingTotal === null) {
      return NextResponse.json(
        { error: 'Customer ID, coin ID, coins to redeem, and booking total are required' },
        { status: 400 }
      );
    }

    if (typeof coinsToRedeem !== 'number' || coinsToRedeem <= 0 || !Number.isInteger(coinsToRedeem)) {
      return NextResponse.json(
        { error: 'Coins to redeem must be a positive integer' },
        { status: 400 }
      );
    }

    if (typeof bookingTotal !== 'number' || bookingTotal < 0) {
      return NextResponse.json(
        { error: 'Booking total must be a non-negative number' },
        { status: 400 }
      );
    }

    // Get customer's coin balance
    const coinBalance = await prisma.customerCoinBalance.findUnique({
      where: {
        customerId_coinId: { customerId, coinId },
      },
      include: {
        coin: true,
      },
    });

    if (!coinBalance) {
      return NextResponse.json(
        { error: 'Customer has no balance for this coin' },
        { status: 404 }
      );
    }

    const coin = coinBalance.coin;

    // Validate redemption
    if (coinsToRedeem < coin.minimumRedemption) {
      return NextResponse.json(
        { error: `Minimum redemption is ${coin.minimumRedemption} coins` },
        { status: 400 }
      );
    }

    if (coinBalance.balance < coinsToRedeem) {
      return NextResponse.json(
        { error: 'Insufficient coin balance' },
        { status: 400 }
      );
    }

    // Calculate discount
    const discountAmount = coinsToRedeem * coin.redemptionValue;
    
    // Check maximum redemption per booking
    if (coin.maxRedemptionPerBooking && discountAmount > coin.maxRedemptionPerBooking) {
      const maxCoins = Math.floor(coin.maxRedemptionPerBooking / coin.redemptionValue);
      return NextResponse.json(
        { 
          error: `Maximum redemption per booking is $${coin.maxRedemptionPerBooking} (${maxCoins} coins)`,
        },
        { status: 400 }
      );
    }

    // Ensure discount doesn't exceed booking total
    const finalDiscount = Math.min(discountAmount, bookingTotal);
    const actualCoinsRedeemed = Math.floor(finalDiscount / coin.redemptionValue);

    if (actualCoinsRedeemed === 0) {
      return NextResponse.json(
        { error: 'Discount amount is too small' },
        { status: 400 }
      );
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update customer coin balance
      const updatedBalance = await tx.customerCoinBalance.update({
        where: { id: coinBalance.id },
        data: {
          balance: { decrement: actualCoinsRedeemed },
          totalRedeemed: { increment: actualCoinsRedeemed },
          lastRedeemedAt: new Date(),
        },
      });

      // Create transaction record
      const transaction = await tx.coinTransaction.create({
        data: {
          coinId,
          customerId,
          bookingId,
          type: 'REDEEMED',
          amount: -actualCoinsRedeemed, // Negative for redemption
          description: `Redeemed ${actualCoinsRedeemed} coins for $${finalDiscount.toFixed(2)} discount`,
          dollarAmount: finalDiscount,
          previousBalance: coinBalance.balance,
          newBalance: updatedBalance.balance,
        },
      });

      return { updatedBalance, transaction };
    });

    return NextResponse.json({
      success: true,
      coinsRedeemed: actualCoinsRedeemed,
      discountAmount: finalDiscount,
      remainingBalance: result.updatedBalance.balance,
      transaction: result.transaction,
      message: `Successfully redeemed ${actualCoinsRedeemed} coins for $${finalDiscount.toFixed(2)} discount`,
    });

  } catch (error) {
    console.error('Error redeeming coins:', error);
    return NextResponse.json(
      { error: 'Failed to redeem coins' },
      { status: 500 }
    );
  }
}

// GET /api/coins/redeem - Calculate potential redemption
export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await checkRateLimit(paymentRateLimit, ip);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const coinId = searchParams.get('coinId');
    const bookingTotal = parseFloat(searchParams.get('bookingTotal') || '0');

    if (!customerId || !coinId || !bookingTotal) {
      return NextResponse.json(
        { error: 'Customer ID, coin ID, and booking total are required' },
        { status: 400 }
      );
    }

    // Get customer's coin balance
    const coinBalance = await prisma.customerCoinBalance.findUnique({
      where: {
        customerId_coinId: { customerId, coinId },
      },
      include: {
        coin: true,
      },
    });

    if (!coinBalance) {
      return NextResponse.json({
        canRedeem: false,
        message: 'No coin balance found',
      });
    }

    const coin = coinBalance.coin;
    
    // Check if customer has minimum coins
    if (coinBalance.balance < coin.minimumRedemption) {
      return NextResponse.json({
        canRedeem: false,
        balance: coinBalance.balance,
        minimumRequired: coin.minimumRedemption,
        message: `Need at least ${coin.minimumRedemption} coins to redeem`,
      });
    }

    // Calculate maximum possible redemption
    const maxDiscountFromCoins = coinBalance.balance * coin.redemptionValue;
    const maxDiscountFromBooking = coin.maxRedemptionPerBooking || bookingTotal;
    const maxDiscountFromTotal = bookingTotal;

    const maxPossibleDiscount = Math.min(
      maxDiscountFromCoins,
      maxDiscountFromBooking,
      maxDiscountFromTotal
    );

    const maxRedeemableCoins = Math.floor(maxPossibleDiscount / coin.redemptionValue);

    return NextResponse.json({
      canRedeem: true,
      balance: coinBalance.balance,
      coinValue: coin.redemptionValue,
      minimumRedemption: coin.minimumRedemption,
      maxRedeemableCoins,
      maxDiscountAmount: maxPossibleDiscount,
      recommendations: [
        {
          coins: coin.minimumRedemption,
          discount: coin.minimumRedemption * coin.redemptionValue,
          label: 'Minimum',
        },
        {
          coins: Math.min(coinBalance.balance, maxRedeemableCoins),
          discount: Math.min(coinBalance.balance, maxRedeemableCoins) * coin.redemptionValue,
          label: 'Maximum',
        },
      ],
    });

  } catch (error) {
    console.error('Error calculating redemption:', error);
    return NextResponse.json(
      { error: 'Failed to calculate redemption' },
      { status: 500 }
    );
  }
}