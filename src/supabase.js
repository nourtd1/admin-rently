import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mqmsuzlmnbqairoptyro.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xbXN1emxtbmJxYWlyb3B0eXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0OTMwMTgsImV4cCI6MjA4ODA2OTAxOH0.9pz3mHhKtbFwCDRiWfDz4dCNpLK-FckJLCW4KL2LAoU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
