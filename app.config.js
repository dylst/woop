import 'dotenv/config';

export default ({ config }) => {
  const expo = config.expo || {};

  return {
    ...config,
    expo: {
      ...expo,
      scheme: expo.scheme || 'com.anonymous.woop',

      // Plugins
      plugins: [
        'expo-router',
        [
          'expo-build-properties',
          {
            ios: {
              cxxLanguageStandard: 'c++17',
              cxxLibrary: 'libc++',
            },
          },
        ],
        // Preserve any previously configured plugins
        ...(expo.plugins || []),
      ],

      // JavaScript runtime engine
      jsEngine: 'jsc',

      // Environment variables exposed to the app
      extra: {
        ...(expo.extra || {}),
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },

      ios: {
        ...(expo.ios || {}),
        bundleIdentifier:
          expo.ios?.bundleIdentifier || 'com.anonymous.woop',
        infoPlist: {
          ...(expo.ios?.infoPlist || {}),
          NSLocationWhenInUseUsageDescription:
            expo.ios?.infoPlist?.NSLocationWhenInUseUsageDescription,
          NSLocationAlwaysAndWhenInUseUsageDescription:
            expo.ios?.infoPlist?.NSLocationAlwaysAndWhenInUseUsageDescription,
          NSLocationAlwaysUsageDescription:
            expo.ios?.infoPlist?.NSLocationAlwaysUsageDescription,
        },
        config: {
          ...(expo.ios?.config || {}),
          googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },

      android: {
        ...(expo.android || {}),
        package: expo.android?.package || 'com.anonymous.woop',
        adaptiveIcon: expo.android?.adaptiveIcon,
        permissions: expo.android?.permissions,
        config: {
          ...(expo.android?.config || {}),
          googleMaps: {
            ...(expo.android?.config?.googleMaps || {}),
            apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
          },
        },
      },

      web: {
        ...(expo.web || {}),
      },

      experiments: {
        ...(expo.experiments || {}),
      },
    },
  };
};