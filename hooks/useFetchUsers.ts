import { supabase } from '@/supabaseClient';

export async function useFetchUsers() {
  const { data, error } = await supabase.from('user').select('*');

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data;
}
