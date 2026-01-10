/**
 * AUTHENTICATION CONTEXT
 * 
 * Provides authentication state and methods throughout the app.
 * Uses Lovable Cloud (Supabase) for auth.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isGuest: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  exitGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => {
    // Check localStorage for guest mode on initial load
    return localStorage.getItem('scavy_guestMode') === 'true';
  });

  useEffect(() => {
    // Set up auth state listener FIRST (prevents missing events)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Exit guest mode if user signs in
        if (session?.user) {
          setIsGuest(false);
          localStorage.removeItem('scavy_guestMode');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || email.split('@')[0] }
      }
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsGuest(false);
    localStorage.removeItem('scavy_guestMode');
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('scavy_guestMode', 'true');
  };

  const exitGuestMode = () => {
    setIsGuest(false);
    localStorage.removeItem('scavy_guestMode');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      isGuest,
      signUp, 
      signIn, 
      signOut,
      continueAsGuest,
      exitGuestMode
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
