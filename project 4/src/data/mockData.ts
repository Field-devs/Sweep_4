import { create } from 'zustand';

import type { Route } from '../types/route';

const initialRoute: Route = {
  id: '1',
  name: 'Rota São Paulo - Zona Sul',
  dueDate: '2024-02-15',
  segments: [
    {
      id: 'seg1',
      status: 'pendente',
      distance: 12.5,
      points: [
        {
          id: 'p1-1',
          latitude: -23.563744931352137,
          longitude: -46.67116887504856,
          address: 'Rua Cardeal Arcoverde, 2365',
          executed: false
        }
      ]
    },
    {
      id: 'seg2',
      status: 'pendente',
      distance: 15.3,
      points: [
        {
          id: 'p2-1',
          longitude: -46.662324,
          latitude: -23.553509,
          address: 'Ponto de Coleta 1 - Campo Belo',
          executed: false
        },
        {
          id: 'p2-2',
          longitude: -46.662443,
          latitude: -23.553832,
          address: 'Ponto de Coleta 2 - Campo Belo',
          executed: false
        },
        {
          id: 'p2-3',
          longitude: -46.662443,
          latitude: -23.553832,
          address: 'Ponto de Coleta 3 - Campo Belo',
          executed: false
        },
        {
          id: 'p2-4',
          longitude: -46.662572,
          latitude: -23.554155,
          address: 'Ponto de Coleta 4 - Campo Belo',
          executed: false
        },
        {
          id: 'p2-5',
          longitude: -46.662702,
          latitude: -23.554478,
          address: 'Ponto de Coleta 5 - Campo Belo',
          executed: false
        },
        {
          id: 'p2-6',
          longitude: -46.662889,
          latitude: -23.554940,
          address: 'Ponto de Coleta 6 - Campo Belo',
          executed: false
        },
        {
          id: 'p2-7',
          longitude: -46.663047,
          latitude: -23.555288,
          address: 'Ponto de Coleta 7 - Campo Belo',
          executed: false
        },
        {
          id: 'p2-8',
          longitude: -46.663236,
          latitude: -23.555741,
          address: 'Ponto de Coleta 8 - Campo Belo',
          executed: false
        },
        {
          id: 'p2-9',
          longitude: -46.663440,
          latitude: -23.556179,
          address: 'Ponto de Coleta 9 - Campo Belo',
          executed: false
        }
      ]
    },
    {
      id: 'seg3',
      status: 'pendente',
      distance: 18.7,
      points: Array.from({ length: 23 }, (_, i) => ({
        id: `p3-${i + 1}`,
        latitude: -23.590520 + (Math.random() * 0.02),
        longitude: -46.643308 + (Math.random() * 0.02),
        address: `Ponto de Coleta ${i + 1} - Brooklin`,
        executed: false
      }))
    }
  ]
};

type RouteStore = {
  route: Route;
  updateSegmentStatus: (segmentId: string, status: Route['segments'][0]['status']) => void;
  updateSegment: (segmentId: string, updatedSegment: RouteSegment) => void;
};

export const useRouteStore = create<RouteStore>((set) => ({
  route: initialRoute,
  updateSegmentStatus: (segmentId, status) =>
    set((state) => ({
      route: {
        ...state.route,
        segments: state.route.segments.map((segment) =>
          segment.id === segmentId
            ? { ...segment, status }
            : segment
        ),
      },
    })),
  updateSegment: (segmentId, updatedSegment) =>
    set((state) => ({
      route: {
        ...state.route,
        segments: state.route.segments.map((segment) =>
          segment.id === segmentId ? updatedSegment : segment
        ),
      },
    })),
}));