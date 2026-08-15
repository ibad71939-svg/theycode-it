import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';

// Use Supabase auth where available. Do not write application-level localStorage
// keys; rely on Supabase client for session persistence and fall back to the
// backend endpoints when Supabase isn't configured.
//
// SECURITY: `role` is never read from the Supabase session's user_metadata
// here. That field is client-writable by anyone with the public anon key
// (supabase.auth.signUp/updateUser both accept arbitrary metadata from the
// browser console), so trusting it for UI/routing would let someone display
// admin navigation for themselves just by claiming a role at signup. Instead,
// after every sign-in event we call GET /api/auth/me, which returns the role
// as sourced from the backend's own `users` table — the only place role is
// actually authoritative.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const registeringRef = useRef(false);

  async function loadTrustedProfile(accessToken) {
    try {
      const { user: profile } = await api.get('/auth/me', accessToken);
      return profile;
    } catch (e) {
      console.error('Could not load trusted profile:', e.message);
      return null;
    }
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!import.meta.env.VITE_SUPABASE_URL) {
        if (mounted) setIsInitializing(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      const session = data?.session || null;
      if (session && mounted) {
        const profile = await loadTrustedProfile(session.access_token);
        if (mounted && profile) {
          setToken(session.access_token);
          setUser(profile);
        }
      }
      if (mounted) setIsInitializing(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (registeringRef.current) return;
      if (session && session.user) {
        const profile = await loadTrustedProfile(session.access_token);
        if (profile) {
          setToken(session.access_token);
          setUser(profile);
        } else {
          setToken(null);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
      }
    });

    return () => {
      if (sub?.subscription) sub.subscription.unsubscribe();
      mounted = false;
    };
  }, []);

  async function login(email, password) {
    if (import.meta.env.VITE_SUPABASE_URL) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const session = data.session;
      const profile = await loadTrustedProfile(session.access_token);
      if (!profile) throw new Error('Could not load your account profile. Please try again.');
      setToken(session.access_token);
      setUser(profile);
      return profile;
    }

    const data = await api.post('/auth/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const { password, ...profileFields } = payload;
    const { name, email, phone } = profileFields;

    registeringRef.current = true;
    try {
      // 1. Create the actual Supabase Auth identity from the browser. Note:
      //    the `role: 'STUDENT'` claimed here in metadata is NEVER trusted
      //    by the backend for authorization — it's purely descriptive. Real
      //    role assignment happens server-side in POST /api/auth/register.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, phone } },
      });
      if (error) throw error;

      if (!data.session) {
        throw new Error('Account created — check your email to confirm it before logging in.');
      }

      // 2. Create the matching users/students profile rows via the backend,
      //    authenticated with the session we just got back. The backend
      //    hardcodes role STUDENT here regardless of anything the client
      //    sends.
      try {
        const result = await api.post('/auth/register', profileFields, data.session.access_token);
        setToken(data.session.access_token);
        setUser(result.user);
        return result.user;
      } catch (profileErr) {
        await supabase.auth.signOut().catch(() => {});
        throw new Error(profileErr.message || 'Account created, but saving your details failed. Please try again.');
      }
    } finally {
      registeringRef.current = false;
    }
  }

  function logout() {
    if (import.meta.env.VITE_SUPABASE_URL) {
      supabase.auth.signOut().catch(() => {});
    }
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, isInitializing }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext };
