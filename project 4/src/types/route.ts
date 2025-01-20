export type Point = {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  executed: boolean;
};

export type RouteSegment = {
  id: string;
  points: Point[];
  status: 'pendente' | 'iniciado' | 'completed' | 'incompleto';
  distance: number;
};

export type Route = {
  id: string;
  name: string;
  dueDate: string;
  segments: RouteSegment[];
};