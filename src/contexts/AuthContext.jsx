import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// Email Admin — luôn được ép role = teacher
const ADMIN_EMAILS = ['nguyenthanhduocathy@gmail.com'];

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false); // Chống gọi fetchProfile trùng lặp

  // ===== FETCH PROFILE =====
  const fetchProfile = async (userId, userEmail) => {
    // Chống duplicate call
    if (fetchingRef.current) return profile;
    fetchingRef.current = true;

    try {
      console.log('[Auth] Fetching profile — id:', userId);
      const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase());

      // 1) Query bảng public.users theo id
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        if (isAdmin && data.role !== 'teacher') data.role = 'teacher';
        console.log('[Auth] ✅ Profile:', data.role, data.full_name);
        setProfile(data);
        return data;
      }

      console.warn('[Auth] ⚠️ No profile row, auto-creating...');

      // 2) Không có row → tự tạo (backup cho trigger)
      const newRow = {
        id: userId,
        email: userEmail,
        role: isAdmin ? 'teacher' : 'student',
        full_name: userEmail?.split('@')[0] || 'User',
        class_name: '',
      };

      const { data: created, error: createErr } = await supabase
        .from('users')
        .upsert(newRow, { onConflict: 'id' })
        .select()
        .single();

      if (!createErr && created) {
        console.log('[Auth] ✅ Auto-created:', created.role);
        setProfile(created);
        return created;
      }

      console.error('[Auth] ❌ Auto-create failed:', createErr?.message);

      // 3) Fallback cuối cùng cho Admin
      if (isAdmin) {
        const fallback = { id: userId, email: userEmail, role: 'teacher', full_name: 'Admin', class_name: '' };
        setProfile(fallback);
        return fallback;
      }

      setProfile(null);
      return null;
    } catch (err) {
      console.error('[Auth] ❌ Exception:', err.message);
      setProfile(null);
      return null;
    } finally {
      fetchingRef.current = false;
    }
  };

  // ===== AUTH STATE LISTENER — chỉ chạy 1 lần =====
  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000);

    // Lấy session hiện tại
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        fetchProfile(s.user.id, s.user.email).finally(() => {
          setLoading(false);
          clearTimeout(timeout);
        });
      } else {
        setLoading(false);
        clearTimeout(timeout);
      }
    });

    // Lắng nghe auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        if (s?.user) {
          fetchProfile(s.user.id, s.user.email).finally(() => setLoading(false));
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []); // [] = chỉ chạy 1 lần duy nhất

  // ===== SIGN UP — Tạo auth + public.users =====
  const signUp = async (email, password, metadata) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: metadata },
    });

    // Tạo row public.users ngay sau signup
    if (!error && data?.user) {
      const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
      await supabase.from('users').upsert({
        id: data.user.id,
        email,
        role: isAdmin ? 'teacher' : (metadata?.role || 'student'),
        full_name: metadata?.full_name || '',
        class_name: metadata?.class_name || '',
      }, { onConflict: 'id' });
    }

    return { data, error };
  };

  // ===== SIGN IN =====
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  // ===== SIGN OUT =====
  const signOut = async () => {
    await supabase.auth.signOut().catch(() => {});
    // Xóa localStorage cũ (bao gồm cả key mới chemed-auth-token)
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || key === 'chemed-auth-token') {
        localStorage.removeItem(key);
      }
    });
    setSession(null);
    setProfile(null);
  };

  // Shortcut cho user object
  const user = session?.user ?? null;

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signUp, signIn, signOut, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
