import { supabase } from '@/supabaseClient';

export async function userLogout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error logging out user:', error);
    return false;

  }

  return true;
}

