import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    const addresses = await prisma.savedAddress.findMany({
      where: { customerId },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json(addresses);
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

    // Check if address with same label already exists
    const existingAddress = await prisma.savedAddress.findFirst({
      where: {
        customerId,
        label: label.toLowerCase()
      }
    });

    if (existingAddress) {
      // Update existing address
      const updatedAddress = await prisma.savedAddress.update({
        where: { id: existingAddress.id },
        data: {
          address,
          latitude,
          longitude,
          city,
          state,
          postalCode
        }
      });
      return NextResponse.json(updatedAddress);
    } else {
      // Create new address
      const newAddress = await prisma.savedAddress.create({
        data: {
          customerId,
          label,
          address,
          latitude,
          longitude,
          city,
          state,
          postalCode
        }
      });
      return NextResponse.json(newAddress);
    }
  } catch (error) {
    console.error('Error saving address:', error);
    return NextResponse.json(
      { error: 'Failed to save address' },
      { status: 500 }
    );
  }
}