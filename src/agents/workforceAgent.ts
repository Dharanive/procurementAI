import { supabase } from '@/lib/supabase';
import { User } from '@/types';

/**
 * Workforce Agent: Fetches all available employees and returns their skill sets and allocated hours.
 */
export const fetchWorkforce = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw new Error(error.message);
    return data as User[];
};
