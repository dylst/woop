import { supabase } from '@/supabaseClient';

export async function userLogout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error creating user:', error);
    return false;

  }

  return true;
}

