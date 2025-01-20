/**
 * Calculate bearing between two points
 * @returns Bearing in degrees (0-360)
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Convert to radians
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const λ1 = lon1 * Math.PI / 180;
  const λ2 = lon2 * Math.PI / 180;

  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
           Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  
  // Normalize to 0-360
  bearing = (bearing + 360) % 360;
  
  return bearing;
}