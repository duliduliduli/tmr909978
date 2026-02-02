import { stripe, STRIPE_CONNECT_CONFIG, PLATFORM_CONFIG } from './config';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto-js';

const prisma = new PrismaClient();

// ===== STRIPE CONNECT ACCOUNT MANAGEMENT =====

export interface CreateConnectAccountData {
  providerId: string;
  email: string;
  businessType: 'individual' | 'company';
  country: string;
  businessProfile?: {
    name?: string;
    description?: string;
    url?: string;
    support_phone?: string;
    support_email?: string;
  };
}

/**
 * Create a Stripe Connect Express account for a provider
 */
export async function createConnectAccount(data: CreateConnectAccountData) {
  try {
    // Check if provider already has a Stripe account
    const existingProvider = await prisma.providerProfile.findUnique({
      where: { id: data.providerId },
      select: { stripeAccountId: true, user: { select: { email: true } } }
    });

    if (!existingProvider) {
      throw new Error('Provider not found');
    }

    if (existingProvider.stripeAccountId) {
      throw new Error('Provider already has a connected account');
    }

    // Create Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: data.country,
      email: data.email,
      business_type: data.businessType,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      business_profile: {
        name: data.businessProfile?.name || 'Tumaro Provider',
        product_description: 'Mobile vehicle detailing services',
        support_email: data.businessProfile?.support_email || data.email,
        support_phone: data.businessProfile?.support_phone,
        url: data.businessProfile?.url,
        mcc: '7542' // Car washes
      },
      settings: {
        payouts: {
          schedule: STRIPE_CONNECT_CONFIG.payout_schedule
        }
      },
      metadata: {
        provider_id: data.providerId,
        platform: 'tumaro',
        created_by: 'api'
      }
    });

    // Update provider with Stripe account ID
    await prisma.providerProfile.update({
      where: { id: data.providerId },
      data: {
        stripeAccountId: account.id,
        stripeOnboarded: false
      }
    });

    return {
      accountId: account.id,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled
    };

  } catch (error: any) {
    console.error('Error creating Connect account:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      throw new Error(`Stripe error: ${error.message}`);
    }
    
    throw error;
  }
}

/**
 * Create an account link for Express onboarding
 */
export async function createAccountLink(
  providerId: string,
  refreshUrl: string,
  returnUrl: string
) {
  try {
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      select: { stripeAccountId: true }
    });

    if (!provider?.stripeAccountId) {
      throw new Error('Provider does not have a connected account');
    }

    const accountLink = await stripe.accountLinks.create({
      account: provider.stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding'
    });

    return {
      url: accountLink.url,
      expiresAt: new Date(accountLink.expires_at * 1000)
    };

  } catch (error: any) {
    console.error('Error creating account link:', error);
    throw error;
  }
}

/**
 * Get Connect account status
 */
export async function getAccountStatus(providerId: string) {
  try {
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      select: { stripeAccountId: true, stripeOnboarded: true }
    });

    if (!provider?.stripeAccountId) {
      return {
        hasAccount: false,
        accountId: null,
        onboarded: false,
        canReceivePayments: false,
        requirements: []
      };
    }

    const account = await stripe.accounts.retrieve(provider.stripeAccountId);
    
    return {
      hasAccount: true,
      accountId: account.id,
      onboarded: account.details_submitted && account.charges_enabled,
      canReceivePayments: account.charges_enabled && account.payouts_enabled,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements?.currently_due || [],
      pastDueRequirements: account.requirements?.past_due || [],
      pendingVerification: account.requirements?.pending_verification || [],
      errors: account.requirements?.errors || []
    };

  } catch (error: any) {
    console.error('Error getting account status:', error);
    throw error;
  }
}

/**
 * Update provider onboarding status
 */
export async function updateOnboardingStatus(providerId: string) {
  try {
    const status = await getAccountStatus(providerId);
    
    await prisma.providerProfile.update({
      where: { id: providerId },
      data: {
        stripeOnboarded: status.onboarded
      }
    });

    return status;

  } catch (error: any) {
    console.error('Error updating onboarding status:', error);
    throw error;
  }
}

/**
 * Create login link for Express dashboard
 */
export async function createDashboardLink(providerId: string) {
  try {
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      select: { stripeAccountId: true }
    });

    if (!provider?.stripeAccountId) {
      throw new Error('Provider does not have a connected account');
    }

    const loginLink = await stripe.accounts.createLoginLink(
      provider.stripeAccountId
    );

    return {
      url: loginLink.url,
      createdAt: new Date()
    };

  } catch (error: any) {
    console.error('Error creating dashboard link:', error);
    throw error;
  }
}

/**
 * Delete Connect account (for testing/cleanup)
 */
export async function deleteConnectAccount(providerId: string) {
  try {
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      select: { stripeAccountId: true }
    });

    if (!provider?.stripeAccountId) {
      throw new Error('Provider does not have a connected account');
    }

    // Delete the Stripe account
    await stripe.accounts.del(provider.stripeAccountId);

    // Clear Stripe data from database
    await prisma.providerProfile.update({
      where: { id: providerId },
      data: {
        stripeAccountId: null,
        stripeOnboarded: false
      }
    });

    return { success: true };

  } catch (error: any) {
    console.error('Error deleting Connect account:', error);
    throw error;
  }
}

/**
 * Get account balance
 */
export async function getAccountBalance(providerId: string) {
  try {
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      select: { stripeAccountId: true }
    });

    if (!provider?.stripeAccountId) {
      throw new Error('Provider does not have a connected account');
    }

    const balance = await stripe.balance.retrieve({
      stripeAccount: provider.stripeAccountId
    });

    return {
      available: balance.available,
      pending: balance.pending,
      currency: balance.available[0]?.currency || 'usd'
    };

  } catch (error: any) {
    console.error('Error getting account balance:', error);
    throw error;
  }
}

/**
 * Get recent transactions
 */
export async function getAccountTransactions(
  providerId: string,
  limit: number = 10
) {
  try {
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      select: { stripeAccountId: true }
    });

    if (!provider?.stripeAccountId) {
      throw new Error('Provider does not have a connected account');
    }

    const transactions = await stripe.balanceTransactions.list(
      { limit },
      { stripeAccount: provider.stripeAccountId }
    );

    return transactions.data.map(txn => ({
      id: txn.id,
      amount: txn.amount,
      currency: txn.currency,
      description: txn.description,
      fee: txn.fee,
      net: txn.net,
      status: txn.status,
      type: txn.type,
      created: new Date(txn.created * 1000),
      availableOn: new Date(txn.available_on * 1000)
    }));

  } catch (error: any) {
    console.error('Error getting account transactions:', error);
    throw error;
  }
}