import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUnreadMessages = () => {
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    const { count: c, error } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'unread');

    if (!error && c !== null) setCount(c);
  };

  useEffect(() => {
    fetchCount();

    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contact_messages' },
        () => fetchCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return count;
};
