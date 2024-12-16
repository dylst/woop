import { supabase } from '@/supabaseClient';

export async function userLogin(
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email, 
    password,
  });

  if (error) {
    console.error('Error logging in user:', error);
    return null;

  }

  return data;
}

