// =========================================================
//  KONFIGURASI SUPABASE
//  >>> HANYA FILE INI YANG PERLU ANDA EDIT <<<
//
//  Ambil dari dashboard Supabase:
//   - SUPABASE_URL      : Settings > General  (atau di halaman utama project)
//   - SUPABASE_ANON_KEY : Settings > API Keys > tab "Legacy anon, service_role"
//                         -> salin baris berlabel "anon" "public" (diawali eyJ...)
//                         JANGAN gunakan service_role / secret!
// =========================================================

export const SUPABASE_URL = "https://dkjidfdwtskhojohrlvd.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRramlkZmR3dHNraG9qb2hybHZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwODUzNDQsImV4cCI6MjA5OTY2MTM0NH0.XNumJ3OBnx3EC1kv7IczSRZnup7QyJ4z_gLJjAa6cqo";

// Nama bucket Storage untuk menyimpan gambar (jangan diubah,
// kecuali mengganti namanya juga di supabase_setup.sql)
export const BUCKET = "desa-images";
