import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    Geolocation.requestAuthorization('always');
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Permissão de Localização',
        message: 'O app precisa acessar sua localização para funcionar corretamente',
        buttonNeutral: 'Perguntar depois',
        buttonNegative: 'Cancelar',
        buttonPositive: 'OK'
      }
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      // Request background location for Android 10+
      if (Platform.Version >= 29) {
        const backgroundGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: 'Permissão de Localização em Segundo Plano',
            message: 'O app precisa acessar sua localização em segundo plano para continuar rastreando sua rota',
            buttonNeutral: 'Perguntar depois',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK'
          }
        );
        return backgroundGranted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error requesting location permission:', err);
    return false;
  }
}