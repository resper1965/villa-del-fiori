import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obyrjbhomqtepebykavb.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ieXJqYmhvbXF0ZXBlYnlrYXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTMzNTEsImV4cCI6MjA3NzMyOTM1MX0.0b74_uNjFQdNZQygQGi4L8xQXFr-v9goG6qDcahDfRo'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

