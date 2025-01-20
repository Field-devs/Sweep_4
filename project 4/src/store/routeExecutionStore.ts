import { create } from 'zustand';
import type { Route, RouteSegment } from '../types/route';

interface RouteExecutionStore {
  activeSegmentId: string | null;
  geofenceRadius: number;
  allowManualExecution: boolean;
  setActiveSegment: (segmentId: string | null) => void;
  canStartSegment: (segmentId: string, route: Route) => boolean;
  isPointInGeofence: (point: { latitude: number; longitude: number }, userLocation: { latitude: number; longitude: number }) => boolean;
  setGeofenceRadius: (radius: number) => void;
  setAllowManualExecution: (allow: boolean) => void;
}

export const useRouteExecutionStore = create<RouteExecutionStore>((set, get) => ({
  activeSegmentId: null,
  geofenceRadius: 20, // Default radius in meters
  allowManualExecution: false,

  setActiveSegment: (segmentId) => set({ activeSegmentId: segmentId }),

  setAllowManualExecution: (allow) => set({ allowManualExecution: allow }),

  canStartSegment: (segmentId, route) => {
    // Check if this is the active segment
    const { activeSegmentId } = get();
    
    // Allow resuming the same segment
    if (activeSegmentId === segmentId) return true;

    // Check if any other segment is in progress
    return !route.segments.some(segment => 
      segment.id !== segmentId && 
      (segment.status === 'iniciado' || segment.status === 'incompleto')
    );
  },

  isPointInGeofence: (point, userLocation) => {
    const { geofenceRadius } = get();
    
    // Convert latitude/longitude to radians
    const lat1 = point.latitude * Math.PI / 180;
    const lon1 = point.longitude * Math.PI / 180;
    const lat2 = userLocation.latitude * Math.PI / 180;
    const lon2 = userLocation.longitude * Math.PI / 180;

    // Haversine formula
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1;
    const φ2 = lat2;
    const Δφ = lat2 - lat1;
    const Δλ = (lon2 - lon1);

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return distance <= geofenceRadius;
  },

  setGeofenceRadius: (radius) => set({ geofenceRadius: radius })
}));