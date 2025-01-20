import { useState, useEffect } from 'react';
import { Point } from '../types/route';
import { calculateDistance } from '../utils/geofencing';
import { toast } from 'react-hot-toast';

const GEOFENCE_RADIUS = 15; // meters
const MAX_RETRIES = 5;
const RETRY_DELAY = 3000;
const POSITION_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 0,        // Always get fresh position
  timeout: 30000        // 30 second timeout
};

export function useGeofencing(points: Point[], isTracking: boolean) {
  const [watchId, setWatchId] = useState<number | null>(null);
  const [executedPoints, setExecutedPoints] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  const startWatching = () => {
    return navigator.geolocation.watchPosition(
      (position) => {
        // Reset retry count on successful position
        setRetryCount(0);
        
        const { latitude, longitude } = position.coords;
        
        // Check each point's distance from current location
        points.forEach(point => {
          if (!executedPoints.includes(point.id)) {
            const distance = calculateDistance(
              latitude,
              longitude,
              point.latitude,
              point.longitude
            );

            if (distance <= GEOFENCE_RADIUS) {
              // Only animate if segment is initiated
              if (segment?.status === 'iniciado') {
                if (!executedPoints.includes(point.id)) {
                  const marker = markersRef.current.get(point.id);
                  if (marker) {
                    const el = marker.getElement();
                    el.style.backgroundColor = '#4CAF50';
                    el.style.cursor = 'default';
                  }
                  setExecutedPoints(prev => [...prev, point.id]);
                }
              }
            }
          }
        });
      },
      async (error) => {
        console.error('Geolocation error:', error);
        let shouldRetry = false;

        if (error.code === error.TIMEOUT) {
          if (retryCount < MAX_RETRIES) {
            shouldRetry = true;
            toast.error(`Tentando novamente... (${retryCount + 1}/${MAX_RETRIES})`);
          } else {
            toast.error('Não foi possível obter sua localização. Verifique se o GPS está ativado.');
          }
        } else if (error.code === error.PERMISSION_DENIED) {
          toast.error('Permissão de localização negada. Por favor, permita o acesso à sua localização.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          toast.error('Não foi possível determinar sua localização. Verifique se o GPS está ativado.');
          shouldRetry = retryCount < MAX_RETRIES;
        }

        if (shouldRetry) {
          // Increment retry count
          setRetryCount(prev => prev + 1);
          
          // Clear current watch
          if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
          }

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          
          // Start new watch
          const newWatchId = startWatching();
          setWatchId(newWatchId);
        }
      },
      POSITION_OPTIONS
    );
  };

  useEffect(() => {
    if (!isTracking) {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      return;
    }

    // Request permissions first
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' })
        .then(result => {
          if (result.state === 'prompt') {
            toast.loading('Aguardando permissão de localização...');
          }
          if (result.state === 'denied') {
            toast.error('Permissão de localização negada. Por favor, permita o acesso à sua localização.');
            return;
          }
          if (result.state === 'granted') {
            toast.success('Rastreamento iniciado');
          }
          
          const id = startWatching();
          setWatchId(id);
        })
        .catch(error => {
          console.error('Error querying permissions:', error);
          // Fallback to direct geolocation request
          const id = startWatching();
          setWatchId(id);
        });
    } else {
      const id = startWatching();
      setWatchId(id);
    }

    // Cleanup function
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isTracking, points, retryCount]);

  return { executedPoints };
}