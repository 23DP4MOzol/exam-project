import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth changes first
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data ? {
        ...data,
        role: data.role as 'admin' | 'user'
      } : null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: username
          }
        }
      });

      if (error) throw error;

      if (data.user && !data.session) {
        toast({
          title: "Check your email",
          description: "Please check your email and click the verification link to complete registration.",
        });
      } else if (data.user) {
        // User signed up and is immediately signed in (email confirmation disabled)
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            username,
            role: email === 'admin@marketplace.com' ? 'admin' : 'user',
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't throw here, as the auth user was created successfully
        }

        toast({
          title: "Account created!",
          description: "Welcome to the marketplace!",
        });
      }

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // For demo accounts, handle specially with database lookup
      if ((email === 'admin@marketplace.com' && password === 'admin123') ||
          (email === 'demo@marketplace.com' && password === 'demo123')) {
        
        // Query the database for the user
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (userError || !userData) {
          throw new Error('Demo user not found in database');
        }

        // Create a mock session for the demo account
        const mockUser = {
          id: userData.id,
          email: userData.email,
          created_at: userData.created_at,
          updated_at: userData.updated_at,
          email_confirmed_at: new Date().toISOString(),
          aud: 'authenticated',
          role: 'authenticated'
        } as any;

        setUser(mockUser);
        setProfile({
          id: userData.id,
          email: userData.email,
          username: userData.username,
          role: userData.role as 'admin' | 'user',
          created_at: userData.created_at,
          updated_at: userData.updated_at
        });

        toast({
          title: email === 'admin@marketplace.com' ? "Welcome back, Admin!" : "Welcome back!",
          description: "You have been signed in successfully.",
        });

        return { data: { user: mockUser, session: { user: mockUser } }, error: null };
      }

      // For regular users, use normal Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      // Clear any demo sessions
      if (user?.email === 'admin@marketplace.com' || user?.email === 'demo@marketplace.com') {
        setUser(null);
        setProfile(null);
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
        return;
      }

      // Normal Supabase signout for real users
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'Not authenticated' };
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile({
        ...data,
        role: data.role as 'admin' | 'user'
      });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updatePassword,
  };
};