import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Singleton — chỉ tạo 1 instance duy nhất trong toàn app
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // storageKey riêng biệt, tránh xung đột lock giữa các project trên localhost
    storageKey: 'chemed-auth-token',
  },
})


