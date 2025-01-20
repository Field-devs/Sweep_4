import * as React from "react";
import { Color } from "@nativescript/core";
import { RouteProp } from '@react-navigation/core';
import { FrameNavigationProp } from "react-nativescript-navigation";
import { MainStackParamList } from "../NavigationParamList";
import { mockRoute } from "../data/mockData";

type RouteScreenProps = {
  route: RouteProp<MainStackParamList, "Route">;
  navigation: FrameNavigationProp<MainStackParamList, "Route">;
};

const getStatusColor = (status: string): Color => {
  switch (status) {
    case 'pending': return new Color('#FFD700'); // Amarelo
    case 'started': return new Color('#4169E1'); // Azul
    case 'completed': return new Color('#32CD32'); // Verde
    case 'incomplete': return new Color('#000000'); // Preto
    default: return new Color('#808080');
  }
};

export function RouteScreen({ navigation }: RouteScreenProps) {
  return (
    <gridLayout rows="auto, *" className="p-4">
      <label row={0} className="text-2xl font-bold mb-4" text={mockRoute.name} />
      
      <scrollView row={1}>
        <stackLayout>
          {mockRoute.segments.map((segment, index) => (
            <gridLayout
              key={segment.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-md"
              rows="auto, auto"
              columns="*, auto"
              onTap={() => navigation.navigate('Map', { segmentId: segment.id })}
            >
              <label
                row={0}
                col={0}
                className="text-lg font-bold"
                text={`Trecho ${index + 1}`}
              />
              <label
                row={0}
                col={1}
                className="text-sm"
                text={segment.status.toUpperCase()}
                style={{ color: getStatusColor(segment.status) }}
              />
              <stackLayout row={1} colSpan={2} className="mt-2">
                <label
                  className="text-sm text-gray-600 dark:text-gray-400"
                  text={`${segment.points.length} pontos • ${segment.distance.toFixed(1)}km`}
                />
                <progressBar
                  value={segment.points.filter(p => p.executed).length}
                  maxValue={segment.points.length}
                  className="mt-2"
                />
              </stackLayout>
            </gridLayout>
          ))}
        </stackLayout>
      </scrollView>
    </gridLayout>
  );
}