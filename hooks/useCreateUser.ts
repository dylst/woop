import { supabase } from '@/supabaseClient';

export async function useCreateUser(
  name: string,
  email: string,
  city: string,
  state: string
) {
  const { data, error } = await supabase
    .from('user')
    .insert([{ name, email, city, state }]);

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }

  return data;
}
