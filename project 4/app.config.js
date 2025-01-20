export default {
  name: 'RouteTracking',
  slug: 'route-tracking',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.routetracking',
    infoPlist: {
      NSLocationWhenInUseUsageDescription: 'We need your location to track your route and show nearby points',
      NSLocationAlwaysAndWhenInUseUsageDescription: 'We need your location in the background to continue tracking your route',
      NSLocationAlwaysUsageDescription: 'We need your location in the background to continue tracking your route',
      UIBackgroundModes: ['location', 'fetch']
    }
  },
  android: {
    package: 'com.routetracking',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'ACCESS_BACKGROUND_LOCATION'
    ]
  },
  plugins: [
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Allow Route Tracking to use your location.'
      }
    ]
  ]
};