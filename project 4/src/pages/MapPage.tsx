import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  Dimensions
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouteStore } from '../data/mockData';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { useRouteExecutionStore } from '../store/routeExecutionStore';
import { calculateBearing } from '../utils/navigation';
import type { Point } from '../types/route';

const { width, height } = Dimensions.get('window');

export function MapPage() {
  const route = useRoute();
  const navigation = useNavigation();
  const { segmentId } = route.params as { segmentId: string };
  const { route: routeData, updateSegmentStatus, updateSegment } = useRouteStore();
  const { location } = useCurrentLocation();
  const { setActiveSegment } = useRouteExecutionStore();
  const mapRef = useRef<MapView>(null);
  const [segment, setSegment] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [navigationMode, setNavigationMode] = useState(false);

  // Initialize execution state based on segment status
  useEffect(() => {
    if (segment) {
      setIsExecuting(segment.status === 'iniciado' || segment.status === 'incompleto');
      setNavigationMode(segment.status === 'iniciado' || segment.status === 'incompleto');
    }
  }, [segment]);

  const handleStopPress = async (point: Point) => {
    if (!isExecuting || !segment) return;

    try {
      const updatedPoints = segment.points.map(p =>
        p.id === point.id ? { ...p, executed: true } : p
      );

      const updatedSegment = { ...segment, points: updatedPoints };
      await updateSegment(segment.id, updatedSegment);
      setSegment(updatedSegment);

      if (updatedPoints.every(p => p.executed)) {
        updateSegmentStatus(segment.id, 'completed');
        setIsExecuting(false);
        Alert.alert(
          'Trecho Concluído',
          'Todos os pontos foram executados! O trecho foi concluído.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error updating point:', error);
      Alert.alert('Erro', 'Falha ao atualizar o ponto');
    }
  };

  const startSegment = () => {
    if (!segment) return;

    const newStatus = 'iniciado';
    updateSegmentStatus(segment.id, newStatus);
    setActiveSegment(segment.id);
    setNavigationMode(true);
    setIsExecuting(true);
  };

  const handleFinishSegment = async () => {
    if (!segment) return;

    const unexecutedPoints = segment.points.filter(p => !p.executed);
    
    if (unexecutedPoints.length === 0) {
      updateSegmentStatus(segment.id, 'completed');
      setIsExecuting(false);
      navigation.goBack();
      return;
    }

    Alert.prompt(
      'Pontos Pendentes',
      `Existem ${unexecutedPoints.length} pontos não executados. Por favor, justifique:`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Confirmar',
          onPress: (justification) => {
            if (justification) {
              updateSegmentStatus(segment.id, 'incompleto');
              setNavigationMode(false);
              setIsExecuting(false);
              navigation.goBack();
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    if (segmentId && routeData) {
      const foundSegment = routeData.segments.find((s) => s.id === segmentId);
      if (foundSegment) setSegment(foundSegment);
    }
  }, [segmentId, routeData]);

  useEffect(() => {
    if (segment && location && mapRef.current) {
      const points = segment.points.map(point => ({
        latitude: point.latitude,
        longitude: point.longitude
      }));

      if (points.length > 0) {
        mapRef.current.fitToCoordinates([
          { latitude: location.latitude, longitude: location.longitude },
          ...points
        ], {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true
        });
      }
    }
  }, [segment, location]);

  if (!segment || !location) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        followsUserLocation={navigationMode}
        showsMyLocationButton
        showsCompass
        rotateEnabled={navigationMode}
        pitchEnabled={navigationMode}
        initialCamera={{
          center: {
            latitude: location.latitude,
            longitude: location.longitude
          },
          pitch: navigationMode ? 45 : 0,
          heading: location.heading || 0,
          zoom: 15,
          altitude: 1000
        }}
      >
        {segment.points.map((point, index) => (
          <Marker
            key={point.id}
            coordinate={{
              latitude: point.latitude,
              longitude: point.longitude
            }}
            onPress={() => handleStopPress(point)}
          >
            <View style={[
              styles.marker,
              point.executed ? styles.markerExecuted : styles.markerPending
            ]}>
              <Text style={styles.markerText}>{index + 1}</Text>
            </View>
          </Marker>
        ))}

        {segment.points.length > 1 && (
          <Polyline
            coordinates={segment.points.map(point => ({
              latitude: point.latitude,
              longitude: point.longitude
            }))}
            strokeWidth={4}
            strokeColor="#2196F3"
          />
        )}
      </MapView>

      <View style={styles.header}>
        <Text style={styles.headerText}>
          {segment.points.filter(p => p.executed).length}/{segment.points.length}
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>

        {(segment.status === 'pendente' || segment.status === 'incompleto') ? (
          <TouchableOpacity
            style={[
              styles.actionButton,
              segment.status === 'incompleto' ? styles.resumeButton : styles.startButton
            ]}
            onPress={startSegment}
          >
            <Text style={styles.buttonText}>
              {segment.status === 'incompleto' ? 'Retomar' : 'Iniciar'}
            </Text>
          </TouchableOpacity>
        ) : segment.status === 'iniciado' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.finishButton]}
            onPress={handleFinishSegment}
          >
            <Text style={styles.buttonText}>Terminar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  map: {
    width,
    height
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  backButton: {
    flex: 1,
    backgroundColor: '#666',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  startButton: {
    backgroundColor: '#4CAF50'
  },
  resumeButton: {
    backgroundColor: '#FFC107'
  },
  finishButton: {
    backgroundColor: '#F44336'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  marker: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  markerPending: {
    backgroundColor: '#2196F3'
  },
  markerExecuted: {
    backgroundColor: '#4CAF50'
  },
  markerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20
  }
});