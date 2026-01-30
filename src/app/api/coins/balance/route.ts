import { NextRequest, NextResponse } from 'next/server';
import { mockCoinBalances } from '@/lib/mockData';

// GET /api/coins/balance?customerId=xxx - Get customer's coin balances
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Use mock data for demo
    if (customerId === 'cust_1') {
      const totalValue = mockCoinBalances.reduce((sum, balance) => {
        return sum + parseFloat(balance.dollarValue);
      }, 0);

      return NextResponse.json({
        balances: mockCoinBalances,
        totalCoins: mockCoinBalances.reduce((sum, balance) => sum + balance.balance, 0),
        totalValue: totalValue.toFixed(2),
        businessCount: mockCoinBalances.length
      });
    }

    // Return empty balances for other customers
    return NextResponse.json({
      balances: [],
      totalCoins: 0,
      totalValue: "0.00",
      businessCount: 0
    });

  } catch (error) {
    console.error('Error fetching coin balances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coin balances' },
      { status: 500 }
    );
  }
}

// POST /api/coins/balance - Award coins to customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, coinId, amount, description, bookingId, dollarAmount } = body;

    if (!customerId || !coinId || !amount) {
      return NextResponse.json(
        { error: 'Customer ID, coin ID, and amount are required' },
        { status: 400 }
      );
    }

    // Get or create customer coin balance
    const existingBalance = await prisma.customerCoinBalance.findUnique({
      where: {
        customerId_coinId: { customerId, coinId },
      },
    });

    let coinBalance;
    if (existingBalance) {
      // Update existing balance
      coinBalance = await prisma.customerCoinBalance.update({
        where: { id: existingBalance.id },
        data: {
          balance: { increment: amount },
          totalEarned: { increment: amount },
          lastEarnedAt: new Date(),
        },
      });
    } else {
      // Create new balance
      coinBalance = await prisma.customerCoinBalance.create({
        data: {
          customerId,
          coinId,
          balance: amount,
          totalEarned: amount,
          lastEarnedAt: new Date(),
        },
      });
    }

    // Create transaction record
    const transaction = await prisma.coinTransaction.create({
      data: {
        coinId,
        customerId,
        bookingId,
        type: 'EARNED',
        amount,
        description: description || 'Coins earned from purchase',
        dollarAmount,
        previousBalance: existingBalance?.balance || 0,
        newBalance: coinBalance.balance,
      },
    });

    return NextResponse.json({
      balance: coinBalance,
      transaction,
      message: `Awarded ${amount} coins!`,
    });

  } catch (error) {
    console.error('Error awarding coins:', error);
    return NextResponse.json(
      { error: 'Failed to award coins' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}