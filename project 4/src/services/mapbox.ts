import type { Point } from '../types/route';

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZmllbGRjb3JwbWFwYm94IiwiYSI6ImNscjUyYXVxZjF0YmQyanFiMGFzdzloeTMifQ.eOcqL3HsgXAFDGndTzyBjw';
const MAX_COORDINATES = 24; // Mapbox limit for waypoints excluding origin
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // ms

type Coordinates = [number, number];

// Enhanced coordinate validation
export function isValidCoordinate(coord: Coordinates): boolean {
  return Array.isArray(coord) &&
         coord.length === 2 &&
         typeof coord[0] === 'number' &&
         typeof coord[1] === 'number' &&
         !isNaN(coord[0]) && 
         !isNaN(coord[1]) &&
         Math.abs(coord[0]) <= 180 &&
         Math.abs(coord[1]) <= 90 &&
         coord[0] !== 0 &&
         coord[1] !== 0;
}

// Delay helper for retries
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced error class for Mapbox errors
class MapboxError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'MapboxError';
  }
}

function chunkCoordinates(coords: Coordinates[]): Coordinates[][] {
  const chunks: Coordinates[][] = [];
  for (let i = 0; i < coords.length; i += MAX_COORDINATES) {
    chunks.push(coords.slice(i, i + MAX_COORDINATES));
  }
  return chunks;
}

async function getDirections(origin: Coordinates, destinations: Coordinates[]): Promise<Coordinates[]> {
  let lastError: Error | null = null;

  if (!destinations.length) {
    throw new MapboxError('No destinations provided');
  }

  // Ensure we have valid coordinates
  if (!isValidCoordinate(origin)) {
    throw new MapboxError('Invalid origin coordinates', { origin });
  }

  const validDestinations = destinations.filter(isValidCoordinate);
  if (validDestinations.length === 0) {
    throw new MapboxError('No valid destination coordinates', { destinations });
  }

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      // Create coordinates string with origin and destinations
      const coordinates = [origin, ...validDestinations.slice(0, MAX_COORDINATES)];
      const coordString = coordinates
        .map(coord => coord.join(','))
        .join(';');

      const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/driving/${coordString}`);
      url.searchParams.set('geometries', 'geojson');
      url.searchParams.set('overview', 'full');
      url.searchParams.set('access_token', MAPBOX_ACCESS_TOKEN);
      url.searchParams.set('steps', 'true');
      url.searchParams.set('alternatives', 'false');

      console.log('Fetching directions from Mapbox...');
      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Mapbox API error:', errorText);
        throw new MapboxError(
          `Mapbox API error (${response.status})`,
          { status: response.status, error: errorText }
        );
      }

      const data = await response.json();
      
      if (!data.routes?.[0]?.geometry?.coordinates) {
        console.error('Invalid route data:', data);
        throw new MapboxError('No route found in response', { data });
      }

      return data.routes[0].geometry.coordinates;

    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      lastError = error;
      if (attempt < RETRY_ATTEMPTS) {
        await delay(RETRY_DELAY * attempt);
        continue;
      }
      throw new MapboxError(
        'Failed to get directions after multiple attempts',
        { originalError: error }
      );
    }
  }

  throw lastError || new MapboxError('Unknown error occurred');
}

export async function getOptimizedRoute(origin: Coordinates, destinations: Coordinates[]): Promise<Coordinates[]> {
  try {
    console.log('Optimizing route with:', { origin, destinations });

    if (!isValidCoordinate(origin)) {
      throw new MapboxError('Invalid origin coordinates', { origin });
    }

    const validDestinations = destinations.filter(isValidCoordinate);
    if (validDestinations.length === 0) {
      console.error('No valid destinations found:', destinations);
      throw new MapboxError('No valid destination coordinates', { destinations });
    }

    const route = await getDirections(origin, validDestinations);
    if (!route || route.length < 2) {
      console.error('Invalid route received:', route);
      throw new MapboxError('Invalid route received', { routeLength: route?.length });
    }
    return route;

  } catch (error) {
    console.error('Route optimization error:', error);
    if (error instanceof MapboxError) {
      throw error;
    }
    throw new MapboxError('Route optimization failed', { originalError: error });
  }
}

export function getMapboxConfig() {
  return {
    accessToken: MAPBOX_ACCESS_TOKEN,
    style: 'mapbox://styles/mapbox/streets-v12?optimize=true',
    minZoom: 2,
    maxZoom: 18,
    localIdeographFontFamily: "'Noto Sans', 'Noto Sans CJK SC', sans-serif"
  };
}