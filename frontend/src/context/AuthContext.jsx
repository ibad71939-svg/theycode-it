import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';

// Use Supabase auth where available. Do not write application-level localStorage
// keys; rely on Supabase client for session persistence and fall back to the
// backend endpoints when Supabase isn't configured.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  // While register() is mid-flight, supabase.auth.signUp() creates a real
  // session and fires onAuthStateChange on its own — before we've confirmed
  // the users/students profile rows actually got created. This flag stops
  // that listener from logging the user in early off the back of a
  // half-finished signup; register() manages token/user itself instead.
  const registeringRef = useRef(false);

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
        const u = session.user;
        setToken(session.access_token);
        setUser({ id: u.id, email: u.email, name: u.user_metadata?.name || u.email, role: u.user_metadata?.role || 'STUDENT' });
      }
      if (mounted) setIsInitializing(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (registeringRef.current) return;
      if (session && session.user) {
        const u = session.user;
        setToken(session.access_token);
        setUser({ id: u.id, email: u.email, name: u.user_metadata?.name || u.email, role: u.user_metadata?.role || 'STUDENT' });
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
      const user = data.user;
      const nextUser = { id: user.id, email: user.email, name: user.user_metadata?.name || user.email, role: user.user_metadata?.role || 'STUDENT' };
      setToken(session.access_token);
      setUser(nextUser);
      return nextUser;
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
      // 1. Create the actual Supabase Auth identity from the browser — the
      //    same call the login page uses, so both paths agree on how the
      //    account exists.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, phone, role: 'STUDENT' } },
      });
      if (error) throw error;

      // If the Supabase project requires email confirmation, there's no
      // session yet — the account exists but can't be used until confirmed.
      if (!data.session) {
        throw new Error('Account created — check your email to confirm it before logging in.');
      }

      // 2. Create the matching users/students profile rows via the backend,
      //    authenticated with the session we just got back.
      try {
        const result = await api.post('/auth/register', profileFields, data.session.access_token);
        setToken(data.session.access_token);
        setUser(result.user);
        return result.user;
      } catch (profileErr) {
        // The auth identity exists but the profile step failed. Sign the
        // half-created session back out so the app doesn't treat this
        // account as logged in — otherwise reloading the page would trigger
        // the exact same "no student profile" 404 on the dashboard.
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

