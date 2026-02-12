import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from './client';
import { SupabaseProvider } from './index.jsx';
import { useQueryClient } from '@tanstack/react-query';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

const SupabaseAuthContext = createContext();

export const SupabaseAuthProvider = ({ children }) => {
  return (
    <SupabaseProvider>
      <SupabaseAuthProviderInner>
        {children}
      </SupabaseAuthProviderInner>
    </SupabaseProvider>
  );
}

export const SupabaseAuthProviderInner = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const getSession = async () => {
      setLoading(true);
      setTimedOut(false);
      try {
        const res = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000))
        ]);
        const session = res?.data?.session ?? null;
        setSession(session);
      } catch (err) {
        // timeout or network error — proceed with null session so UI doesn't hang
        setSession(null);
        if (err && err.message === 'timeout') setTimedOut(true);
      } finally {
        setLoading(false);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      queryClient.invalidateQueries('user');
    });

    getSession();

    return () => {
      try {
        authListener.subscription.unsubscribe();
      } catch (e) {
        // ignore
      }
      setLoading(false);
    };
  }, [queryClient]);

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    queryClient.invalidateQueries('user');
    setLoading(false);
  };

  const refreshSession = async () => {
    setTimedOut(false);
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    } catch (e) {
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SupabaseAuthContext.Provider value={{ session, loading, logout, timedOut, refreshSession }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  return useContext(SupabaseAuthContext);
};

export const SupabaseAuthUI = () => (
  <Auth
    supabaseClient={supabase}
    appearance={{ theme: ThemeSupa }}
    theme="default"
    providers={[]}
  />
);