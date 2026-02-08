import { NextRequest, NextResponse } from 'next/server';
import { apiRateLimit } from '@/lib/rateLimit';
import { getProviderEarnings } from '@/lib/stripe/transfers';

// GET /api/provider/earnings — Provider earnings summary
export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { success } = await apiRateLimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    if (!providerId) {
      return NextResponse.json({ error: 'providerId required' }, { status: 400 });
    }

    const earnings = await getProviderEarnings(
      providerId,
      fromDate ? new Date(fromDate) : undefined,
      toDate ? new Date(toDate) : undefined
    );

    return NextResponse.json({
      providerId,
      earnings: {
        released: {
          total: earnings.totalEarnings / 100, // Convert cents to dollars
          fees: earnings.totalFees / 100,
          count: earnings.releasedCount,
        },
        pending: {
          total: earnings.pendingEarnings / 100,
          count: earnings.pendingCount,
        },
        blocked: {
          total: earnings.blockedEarnings / 100,
          count: earnings.blockedCount,
        },
      },
      recentPayouts: earnings.recentPayouts.map(p => ({
        id: p.id,
        amount: p.amount / 100,
        status: p.status,
        releasedAt: p.releasedAt,
        booking: p.booking,
      })),
    });
  } catch (error: any) {
    console.error('[Earnings] Error:', error);
    return NextResponse.json({ error: 'Failed to get earnings' }, { status: 500 });
  }
}
