import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiRateLimit } from '@/lib/rateLimit';

// GET /api/promotions — Active promotions for customer home page
export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { success } = await apiRateLimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const now = new Date();

    // Fetch active coin promotions (loyalty deals from detailers)
    const coinPromotions = await prisma.coinPromotion.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        OR: [
          { validUntil: null },
          { validUntil: { gte: now } },
        ],
      },
      include: {
        coin: {
          select: {
            id: true,
            name: true,
            displayName: true,
            iconUrl: true,
            primaryColor: true,
            provider: {
              select: {
                id: true,
                businessName: true,
                providerName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Fetch active promotion codes (platform-wide or detailer-specific deals)
    const promoCodes = await prisma.promotionCode.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        OR: [
          { validUntil: null },
          { validUntil: { gte: now } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Filter out maxed-out promo codes in JS (simpler than Prisma raw column compare)
    const activePromoCodes = promoCodes.filter(
      (pc) => pc.maxUses === null || pc.usedCount < pc.maxUses
    );

    // Normalize into a unified format for the frontend
    const promotions = [
      ...coinPromotions.map((cp) => ({
        id: cp.id,
        type: 'coin' as const,
        title: cp.title,
        description: cp.description,
        discountAmount: cp.discountAmount,
        requiredCoins: cp.requiredCoins,
        validUntil: cp.validUntil,
        providerName: cp.coin.provider.businessName,
        providerId: cp.coin.provider.id,
        coinColor: cp.coin.primaryColor,
        coinIcon: cp.coin.iconUrl,
        coinDisplayName: cp.coin.displayName,
      })),
      ...activePromoCodes.map((pc) => ({
        id: pc.id,
        type: 'code' as const,
        title: pc.discountType === 'PERCENTAGE'
          ? `${pc.discountAmount}% Off`
          : pc.discountType === 'FREE_SERVICE'
            ? 'Free Service'
            : `$${pc.discountAmount} Off`,
        description: `Use code: ${pc.code}`,
        discountType: pc.discountType,
        discountAmount: pc.discountAmount,
        code: pc.code,
        validUntil: pc.validUntil,
        minOrderAmount: pc.minOrderAmount,
        newCustomersOnly: pc.newCustomersOnly,
      })),
    ];

    return NextResponse.json({ promotions });
  } catch (error: any) {
    console.error('[Promotions] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 });
  }
}
