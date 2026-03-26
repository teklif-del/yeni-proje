import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dynofcslyqomvvftdomm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_qWr3XSl5cK0Eo2eYljxaZQ_bYkH2dHg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
