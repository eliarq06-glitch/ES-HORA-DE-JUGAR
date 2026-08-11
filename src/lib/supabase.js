import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bwraakmvdongavgsswhb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_eUXUnci_LbEUbJrvERWu1g_r7yNiWtt';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
