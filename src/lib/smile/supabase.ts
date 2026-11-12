import { createClient } from "@supabase/supabase-js";

const url = "https://mtmtsqwxnnfzetrvnmoq.supabase.co";
const anonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bXRzcXd4bm5memV0cnZubW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0MjI5NzEsImV4cCI6MjEwOTk5ODk3MX0.nbnzxCKaK4gsl8_UoHzy-l0R8zQ70PFMtOn-24T5gWU";

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
