import * as React from "react";
import { Dialogs, Utils } from "@nativescript/core";
import { RouteProp } from '@react-navigation/core';
import { FrameNavigationProp } from "react-nativescript-navigation";
import { MainStackParamList } from "../NavigationParamList";
import { mockRoute } from "../data/mockData";
import { RouteSegment } from "../types/route";
import { checkPointsInGeofence } from "../utils/geofencing";

type MapScreenProps = {
  route: RouteProp<MainStackParamList, "Map">;
  navigation: FrameNavigationProp<MainStackParamList, "Map">;
};

export function MapScreen({ route, navigation }: MapScreenProps) {
  const [segment, setSegment] = React.useState<RouteSegment | null>(null);
  const [isTracking, setIsTracking] = React.useState(false);

  React.useEffect(() => {
    const segmentId = route.params.segmentId;
    const foundSegment = mockRoute.segments.find(s => s.id === segmentId);
    if (foundSegment) {
      setSegment(foundSegment);
    }
  }, [route.params.segmentId]);

  const startTracking = async () => {
    if (segment?.status === 'pending') {
      const firstPoint = segment.points[0];
      const url = `google.navigation:q=${firstPoint.latitude},${firstPoint.longitude}`;
      
      try {
        await Utils.openUrl(url);
        setIsTracking(true);
        // TODO: Start background tracking service
      } catch (error) {
        console.error('Error opening navigation:', error);
        Dialogs.alert({
          title: "Erro",
          message: "Não foi possível abrir a navegação",
          okButtonText: "OK"
        });
      }
    }
  };

  const finishSegment = async () => {
    if (!segment) return;

    const unexecutedPoints = segment.points.filter(p => !p.executed);
    if (unexecutedPoints.length > 0) {
      const result = await Dialogs.prompt({
        title: "Pontos Pendentes",
        message: `Existem ${unexecutedPoints.length} pontos não executados. Por favor, justifique:`,
        okButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
        inputType: "text"
      });

      if (result.result) {
        // TODO: Save justification and update segment status
        setIsTracking(false);
        navigation.goBack();
      }
    } else {
      // TODO: Update segment status to completed
      setIsTracking(false);
      navigation.goBack();
    }
  };

  const getActionButtons = () => {
    if (!segment) return null;

    switch (segment.status) {
      case 'pending':
        return (
          <>
            <button
              className="btn p-4 rounded-lg bg-blue-500 text-white font-bold"
              text="Voltar"
              onTap={() => navigation.goBack()}
            />
            <button
              className="btn p-4 rounded-lg bg-green-500 text-white font-bold"
              text="Iniciar"
              onTap={startTracking}
            />
          </>
        );
      case 'started':
        return (
          <>
            <button
              className="btn p-4 rounded-lg bg-blue-500 text-white font-bold"
              text="Voltar"
              onTap={() => navigation.goBack()}
            />
            <button
              className="btn p-4 rounded-lg bg-red-500 text-white font-bold"
              text="Finalizar"
              onTap={finishSegment}
            />
          </>
        );
      case 'incomplete':
        return (
          <>
            <button
              className="btn p-4 rounded-lg bg-blue-500 text-white font-bold"
              text="Voltar"
              onTap={() => navigation.goBack()}
            />
            <button
              className="btn p-4 rounded-lg bg-yellow-500 text-white font-bold"
              text="Retomar"
              onTap={startTracking}
            />
          </>
        );
      case 'completed':
        return (
          <button
            className="btn p-4 rounded-lg bg-blue-500 text-white font-bold"
            text="Voltar"
            onTap={() => navigation.goBack()}
          />
        );
      default:
        return null;
    }
  };

  if (!segment) {
    return (
      <gridLayout>
        <label className="text-center p-4">Carregando...</label>
      </gridLayout>
    );
  }

  return (
    <gridLayout rows="*, auto">
      <stackLayout row={0} className="bg-gray-100">
        <label className="text-xl font-bold p-4" text={`Trecho: ${segment.points.length} pontos`} />
        <scrollView>
          <stackLayout className="p-4">
            {segment.points.map((point, index) => (
              <gridLayout
                key={point.id}
                className={`p-4 rounded-lg mb-2 ${
                  point.executed ? 'bg-green-100' : 'bg-yellow-100'
                }`}
                rows="auto, auto"
                columns="auto, *"
              >
                <label
                  row={0}
                  col={0}
                  className="font-bold mr-2"
                  text={`${index + 1}.`}
                />
                <label
                  row={0}
                  col={1}
                  className="font-bold"
                  text={point.address}
                />
                <label
                  row={1}
                  col={1}
                  className="text-sm text-gray-600"
                  text={point.executed ? 'Executado' : 'Pendente'}
                />
              </gridLayout>
            ))}
          </stackLayout>
        </scrollView>
      </stackLayout>

      <flexboxLayout row={1} className="p-4 space-x-4 justify-between bg-white">
        {getActionButtons()}
      </flexboxLayout>
    </gridLayout>
  );
}