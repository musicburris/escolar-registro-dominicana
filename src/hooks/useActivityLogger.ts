
import { useCallback } from 'react';
import { useSupabase } from './useSupabase';

export const useActivityLogger = () => {
  const supabase = useSupabase();

  const logActivity = useCallback(async (action: string, details?: any) => {
    try {
      // Check if we have real Supabase configuration
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.log('Activity logged (mock):', { action, details });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/functions/v1/log-activity', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          details,
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to log activity');
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }, [supabase]);

  return { logActivity };
};
