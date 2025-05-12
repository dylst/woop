import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

// 1) Grab the right “extra” block depending on your SDK/workflow
const extras =
  // Expo SDK ≤47 (classic manifest)
  Constants.manifest?.extra
  // Expo SDK ≥48 (new expoConfig)
  ?? Constants.expoConfig?.extra
  // nothing there? warn so you notice
  ?? (() => {
    console.warn('No Constants.manifest.extra or Constants.expoConfig.extra found');
    return {};
  })();

// 2) Support both naming conventions
const supabaseUrl =
  // if you used EXPO_PUBLIC_SUPABASE_URL in your extra
  extras.EXPO_PUBLIC_SUPABASE_URL
  // or if you aliased it to supabaseUrl
  ?? extras.supabaseUrl;

const supabaseAnonKey =
  extras.EXPO_PUBLIC_SUPABASE_ANON_KEY
  ?? extras.supabaseAnonKey;

// 3) Sanity‐check at runtime
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase URL or anon key not found. ' +
    'Make sure app.config.js “extra” exports EXPO_PUBLIC_SUPABASE_URL & EXPO_PUBLIC_SUPABASE_ANON_KEY'
  );
} else {
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase anon key (truncated):', supabaseAnonKey.slice(0,6) + '…');
}

// 4) Export your Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');