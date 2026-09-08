import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://bwraakmvdongavgsswhb.supabase.co';
export const supabaseAnonKey = 'sb_publishable_eUXUnci_LbEUbJrvERWu1g_r7yNiWtt';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
