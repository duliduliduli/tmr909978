import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/coins/business?providerId=xxx - Get business coin configuration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    const businessCoin = await prisma.businessCoin.findUnique({
      where: { providerId },
      include: {
        promotions: {
          where: { isActive: true },
          orderBy: { requiredCoins: 'asc' },
        },
        _count: {
          select: {
            customerBalances: true,
            transactions: true,
          },
        },
      },
    });

    if (!businessCoin) {
      return NextResponse.json({
        exists: false,
        message: 'No business coin configured',
      });
    }

    // Get analytics
    const analytics = await prisma.coinTransaction.aggregate({
      where: { coinId: businessCoin.id },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    const earnedCoins = await prisma.coinTransaction.aggregate({
      where: { 
        coinId: businessCoin.id,
        type: 'EARNED',
      },
      _sum: {
        amount: true,
      },
    });

    const redeemedCoins = await prisma.coinTransaction.aggregate({
      where: { 
        coinId: businessCoin.id,
        type: 'REDEEMED',
      },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      exists: true,
      coin: {
        ...businessCoin,
        analytics: {
          totalCustomers: businessCoin._count.customerBalances,
          totalTransactions: businessCoin._count.transactions,
          totalCoinsIssued: earnedCoins._sum.amount || 0,
          totalCoinsRedeemed: Math.abs(redeemedCoins._sum.amount || 0),
          activePromotions: businessCoin.promotions.length,
        },
      },
    });

  } catch (error) {
    console.error('Error fetching business coin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business coin' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/coins/business - Create or update business coin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      providerId,
      name,
      displayName,
      description,
      iconUrl,
      primaryColor,
      earnRate,
      minimumEarnAmount,
      redemptionValue,
      minimumRedemption,
      maxRedemptionPerBooking,
    } = body;

    if (!providerId || !name || !displayName) {
      return NextResponse.json(
        { error: 'Provider ID, name, and display name are required' },
        { status: 400 }
      );
    }

    // Check if business coin already exists
    const existingCoin = await prisma.businessCoin.findUnique({
      where: { providerId },
    });

    let businessCoin;
    if (existingCoin) {
      // Update existing coin
      businessCoin = await prisma.businessCoin.update({
        where: { id: existingCoin.id },
        data: {
          name,
          displayName,
          description,
          iconUrl,
          primaryColor,
          earnRate,
          minimumEarnAmount,
          redemptionValue,
          minimumRedemption,
          maxRedemptionPerBooking,
        },
      });
    } else {
      // Create new coin
      businessCoin = await prisma.businessCoin.create({
        data: {
          providerId,
          name,
          displayName,
          description,
          iconUrl,
          primaryColor: primaryColor || '#3B82F6',
          earnRate: earnRate || 1.0,
          minimumEarnAmount: minimumEarnAmount || 0.0,
          redemptionValue: redemptionValue || 0.01,
          minimumRedemption: minimumRedemption || 100,
          maxRedemptionPerBooking,
        },
      });
    }

    return NextResponse.json({
      coin: businessCoin,
      message: existingCoin ? 'Business coin updated successfully' : 'Business coin created successfully',
    });

  } catch (error) {
    console.error('Error creating/updating business coin:', error);
    return NextResponse.json(
      { error: 'Failed to create/update business coin' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/coins/business - Delete business coin
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    // Deactivate instead of delete to preserve transaction history
    const businessCoin = await prisma.businessCoin.update({
      where: { providerId },
      data: { isActive: false },
    });

    return NextResponse.json({
      message: 'Business coin deactivated successfully',
      coin: businessCoin,
    });

  } catch (error) {
    console.error('Error deleting business coin:', error);
    return NextResponse.json(
      { error: 'Failed to delete business coin' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}