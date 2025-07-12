
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useActivityLogger = () => {
  const { user, session } = useAuth();

  const logActivity = useCallback(async (action: string, details?: any) => {
    try {
      if (!session || !user) {
        console.log('No authenticated user, skipping activity log');
        return;
      }

      const { error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          user_email: user.email,
          user_name: `${user.firstName} ${user.lastName}`,
          action,
          details: details ? { description: details } : {},
          ip_address: null, // Browser can't access IP directly
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Error logging activity:', error);
      } else {
        console.log('Activity logged:', action);
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }, [user, session]);

  return { logActivity };
};
