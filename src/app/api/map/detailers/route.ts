import { NextResponse } from 'next/server';
import type { FeatureCollection, Feature, Point } from 'geojson';
import { mockDetailers } from '@/lib/mockData';

export async function GET() {
  try {
    // Convert mock detailers to GeoJSON FeatureCollection
    const features: Feature<Point>[] = mockDetailers
      .filter(detailer => detailer.location.lat && detailer.location.lng)
      .map(detailer => ({
        type: 'Feature',
        properties: {
          id: detailer.id,
          name: detailer.name,
          businessName: detailer.businessName,
          rating: detailer.rating,
          reviewCount: detailer.reviewCount,
          coin: detailer.coin,
          phone: detailer.phone,
          hours: detailer.hours,
          services: detailer.services.slice(0, 3), // Only first 3 for performance
        },
        geometry: {
          type: 'Point',
          coordinates: [detailer.location.lng, detailer.location.lat]
        }
      }));

    const featureCollection: FeatureCollection<Point> = {
      type: 'FeatureCollection',
      features
    };

    // Add caching headers
    return new NextResponse(JSON.stringify(featureCollection), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching detailers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch detailers' },
      { status: 500 }
    );
  }
}