import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

function getDeviceId(): string {
  let id = localStorage.getItem('energia_device_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('energia_device_id', id)
  }
  return id
}

export const deviceId = getDeviceId()
