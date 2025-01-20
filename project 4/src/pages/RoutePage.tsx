import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useRouteStore } from '../data/mockData';
import { useRouteExecutionStore } from '../store/routeExecutionStore';

export function RoutePage() {
  const navigation = useNavigation();
  const route = useRouteStore((state) => state.route);
  const { canStartSegment } = useRouteExecutionStore();
  const [showProgress, setShowProgress] = useState(true);

  // Format the due date
  const formattedDueDate = new Date(route.dueDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Calculate total route progress
  const totalPoints = route.segments.reduce((acc, segment) => acc + segment.points.length, 0);
  const totalExecutedPoints = route.segments.reduce((acc, segment) => 
    acc + segment.points.filter(p => p.executed).length, 0
  );
  const totalProgress = (totalExecutedPoints / totalPoints) * 100;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return 'map-pin';
      case 'iniciado': return 'navigation';
      case 'completed': return 'check-circle';
      case 'incompleto': return 'alert-circle';
      default: return 'map-pin';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return '#F59E0B';
      case 'iniciado': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'incompleto': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const handleSegmentPress = (segmentId: string) => {
    const hasOtherStartedSegment = route.segments.some(
      s => s.status === 'iniciado' && s.id !== segmentId
    );
    
    if (hasOtherStartedSegment) {
      Alert.alert(
        'Trecho em Andamento',
        'Existe outro trecho em andamento. Finalize-o antes de iniciar um novo.'
      );
    } else {
      navigation.navigate('Map', { segmentId });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View>
            <TouchableOpacity
              style={styles.titleContainer}
              onPress={() => setShowProgress(!showProgress)}
            >
              <Text style={styles.title}>{route.name}</Text>
              <Icon
                name={showProgress ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
            <Text style={styles.date}>{formattedDueDate}</Text>
          </View>
        </View>

        {showProgress && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Progresso Total</Text>
              <Text style={styles.progressCount}>
                {totalExecutedPoints} de {totalPoints} pontos
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[styles.progressBar, { width: `${totalProgress}%` }]}
              />
            </View>
            <Text style={styles.progressPercentage}>
              {Math.round(totalProgress)}% concluído
            </Text>
          </View>
        )}

        <View style={styles.segmentList}>
          {route.segments.map((segment, index) => {
            const completedPoints = segment.points.filter(p => p.executed).length;
            const progress = (completedPoints / segment.points.length) * 100;
            const statusColor = getStatusColor(segment.status);
            
            return (
              <TouchableOpacity
                key={segment.id}
                style={[
                  styles.segmentCard,
                  route.segments.some(s => s.status === 'iniciado' && s.id !== segment.id) &&
                    styles.segmentCardDisabled
                ]}
                onPress={() => handleSegmentPress(segment.id)}
                disabled={route.segments.some(s => s.status === 'iniciado' && s.id !== segment.id)}
              >
                <View style={styles.segmentHeader}>
                  <View style={styles.segmentTitleContainer}>
                    <Icon name={getStatusIcon(segment.status)} size={20} color={statusColor} />
                    <Text style={styles.segmentTitle}>Trecho {index + 1}</Text>
                  </View>
                  <Text style={[styles.segmentStatus, { color: statusColor }]}>
                    {segment.status.toUpperCase()}
                  </Text>
                </View>
                
                <View style={styles.segmentContent}>
                  <Text style={styles.segmentInfo}>
                    {completedPoints} de {segment.points.length} pontos • {segment.distance.toFixed(1)}km
                  </Text>
                  <View style={styles.segmentProgressContainer}>
                    <View
                      style={[
                        styles.segmentProgress,
                        { width: `${progress}%`, backgroundColor: statusColor }
                      ]}
                    />
                  </View>
                  <Text style={styles.segmentProgressText}>
                    {Math.round(progress)}% concluído
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6'
  },
  scrollView: {
    flex: 1
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111'
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  progressCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111'
  },
  progressCount: {
    fontSize: 14,
    color: '#666'
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4
  },
  progressPercentage: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4
  },
  segmentList: {
    padding: 16,
    gap: 16
  },
  segmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  segmentCardDisabled: {
    opacity: 0.5
  },
  segmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  segmentTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  segmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111'
  },
  segmentStatus: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  segmentContent: {
    gap: 8
  },
  segmentInfo: {
    fontSize: 14,
    color: '#666'
  },
  segmentProgressContainer: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden'
  },
  segmentProgress: {
    height: '100%',
    borderRadius: 3
  },
  segmentProgressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right'
  }
});