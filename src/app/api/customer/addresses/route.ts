import { NextRequest, NextResponse } from 'next/server';
import { mockCustomers } from '@/lib/mockData';

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
      const customer = mockCustomers.find(c => c.id === customerId);
      return NextResponse.json(customer?.savedAddresses || []);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching saved addresses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, label, address, latitude, longitude, city, state, postalCode } = body;

    if (!customerId || !label || !address || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For demo purposes, just return the address data
    const newAddress = {
      id: `addr_${Date.now()}`,
      customerId,
      label,
      address,
      coords: { lat: latitude, lng: longitude },
      city,
      state,
      postalCode
    };

    return NextResponse.json(newAddress);
  } catch (error) {
    console.error('Error saving address:', error);
    return NextResponse.json(
      { error: 'Failed to save address' },
      { status: 500 }
    );
  }
}