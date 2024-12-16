import { supabase } from '@/supabaseClient';
import { userLogin } from './userLogin';

export async function updateLogin(email: string, password: string, currentEmail: string, currentPassword: string) {
    // Log in if no session is available
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('No session found. Logging in...');
      const loginResult = await userLogin(currentEmail, currentPassword);
  
      if (!loginResult) {
        console.error('Failed to log in.');
        return null;
      }
    }
  
    // Update the user's email and password
    const { data, error } = await supabase.auth.updateUser({
      email,
      password,
    });
  
    if (error) {
      console.error('Error updating user:', error.message);
      return null;
    }
  
    return data;
  }
  