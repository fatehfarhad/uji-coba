-- =====================================================================
--  PORTAL DESA SUMBERURIP — SETUP SUPABASE (BACKEND)
--  Jalankan SELURUH skrip ini sekali di:
--  Supabase Dashboard > SQL Editor > New query > Run
-- =====================================================================

-- =====================================================================
-- 1. TABEL
-- =====================================================================

-- Konfigurasi desa (kepala desa, statistik, peta) disimpan sebagai JSONB
-- per-bagian (section) agar identik dengan struktur lama.
create table if not exists public.village_config (
  section    text primary key,        -- 'kades' | 'stats' | 'map'
  data       jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists public.umkm_list (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null,
  owner       text not null,
  phone       text not null,
  image_url   text,
  description text,
  store_url   text,
  store_urls  text[] default '{}',
  cert_url    text,
  status      text not null default 'pending',   -- 'pending' | 'approved'
  created_at  timestamptz default now()
);

create table if not exists public.news_list (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  news_date   text,
  summary     text,
  content     text,
  image_url   text,
  created_at  timestamptz default now()
);

create table if not exists public.officers_list (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  role       text not null,
  period     text,
  photo      text,
  created_at timestamptz default now()
);

create table if not exists public.agenda_list (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  status      text not null default 'Mendatang', -- 'Mendatang' | 'Berlangsung' | 'Selesai'
  event_date  text,
  event_time  text,
  location    text,
  description text,
  image_url   text,
  image_urls  text[] default ARRAY[]::text[],
  created_at  timestamptz default now()
);

alter table public.agenda_list add column if not exists image_urls text[] default ARRAY[]::text[];

create table if not exists public.complaints_list (
  id                   uuid primary key default gen_random_uuid(),
  title                text not null,
  category             text not null,
  location             text,
  description          text,
  image_url            text,
  whatsapp             text,
  rejection_reason     text default '',
  status               text not null default 'Menunggu Tindakan', -- 'Menunggu Tindakan' | 'Sedang Diproses' | 'Selesai Ditangani' | 'Ditolak'
  complaint_date       text,
  resolution_image_url text default '',
  created_at           timestamptz default now()
);

create table if not exists public.service_users (
  id           uuid primary key default gen_random_uuid(),
  nik          text not null unique,
  full_name    text not null,
  whatsapp     text not null,
  password_hash text not null,
  created_at   timestamptz default now()
);

create table if not exists public.service_requests (
  id                uuid primary key default gen_random_uuid(),
  request_type      text not null,
  nik               text not null,
  full_name         text not null,
  whatsapp          text not null,
  title             text not null,
  address           text,
  details           text,
  bank_name         text,
  bank_account      text,
  document_url      text,
  payload           jsonb,
  status            text not null default 'Menunggu Validasi', -- 'Menunggu Validasi' | 'Diproses' | 'Disetujui' | 'Ditolak'
  rejection_reason  text default '',
  submitted_at      text,
  updated_at        timestamptz default now(),
  created_at        timestamptz default now()
);

create or replace function public.verify_service_user(
  p_nik text,
  p_hash text
)
returns table(
  id uuid,
  nik text,
  full_name text,
  whatsapp text
)
language plpgsql security definer stable as $$
begin
  -- Use explicit table alias to avoid ambiguous column reference errors
  return query
    select su.id, su.nik, su.full_name, su.whatsapp
    from public.service_users su
    where su.nik = p_nik and su.password_hash = p_hash
    limit 1;
end;
$$;

create or replace function public.get_service_requests_for_nik(
  p_nik text
)
returns table(
  id uuid,
  request_type text,
  nik text,
  full_name text,
  whatsapp text,
  title text,
  address text,
  details text,
  bank_name text,
  bank_account text,
  document_url text,
  payload jsonb,
  status text,
  rejection_reason text,
  submitted_at text,
  updated_at timestamptz,
  created_at timestamptz
)
language plpgsql security definer stable as $$
begin
  -- Use explicit table alias to avoid ambiguous column reference errors
  return query
    select sr.id, sr.request_type, sr.nik, sr.full_name, sr.whatsapp, sr.title, sr.address, sr.details, sr.bank_name, sr.bank_account, sr.document_url, sr.payload, sr.status, sr.rejection_reason, sr.submitted_at, sr.updated_at, sr.created_at
    from public.service_requests sr
    where sr.nik = p_nik
    order by sr.created_at desc;
end;
$$;

-- =====================================================================
-- 2. ROW LEVEL SECURITY (RLS) — aturan keamanan
-- =====================================================================
alter table public.village_config  enable row level security;
alter table public.umkm_list       enable row level security;
alter table public.officers_list   enable row level security;
alter table public.agenda_list     enable row level security;
alter table public.complaints_list enable row level security;
alter table public.service_users   enable row level security;
alter table public.service_requests enable row level security;

-- ----- SEMUA ORANG BOLEH MEMBACA (publik) -----
create policy "read_all_config"     on public.village_config  for select using (true);
create policy "read_all_umkm"       on public.umkm_list       for select using (true);
create policy "read_all_officers"   on public.officers_list   for select using (true);
create policy "read_all_agenda"     on public.agenda_list     for select using (true);
create policy "read_all_complaints" on public.complaints_list for select using (true);

-- ----- WARGA (anon) BOLEH MENDAFTAR & MELAPOR -----
-- Pendaftaran UMKM oleh warga dipaksa berstatus 'pending'
create policy "anon_insert_umkm" on public.umkm_list
  for insert to anon, authenticated
  with check (status = 'pending');

-- Pengiriman aduan oleh warga dipaksa berstatus 'Menunggu Tindakan'
create policy "anon_insert_complaint" on public.complaints_list
  for insert to anon, authenticated
  with check (status = 'Menunggu Tindakan');

-- Akun layanan desa hanya boleh dibuat oleh admin (authenticated)
create policy "admin_select_service_users" on public.service_users
  for select to authenticated
  using (true);
create policy "admin_insert_service_user" on public.service_users
  for insert to authenticated
  with check (true);
create policy "admin_update_service_user" on public.service_users
  for update to authenticated
  using (true)
  with check (true);
create policy "admin_delete_service_user" on public.service_users
  for delete to authenticated
  using (true);

create policy "admin_select_service_requests" on public.service_requests
  for select to authenticated
  using (true);

-- Semua orang boleh membuat permohonan pelayanan desa melalui form
create policy "anon_insert_service_request" on public.service_requests
  for insert to anon, authenticated
  with check (status = 'Menunggu Validasi');

-- Admin boleh mengelola permohonan layanan desa
create policy "admin_update_service_request" on public.service_requests
  for update to authenticated
  using (true)
  with check (true);
create policy "admin_delete_service_request" on public.service_requests
  for delete to authenticated
  using (true);

-- ----- HANYA ADMIN (login/authenticated) YANG BOLEH UBAH & HAPUS -----
create policy "admin_update_umkm" on public.umkm_list for update to authenticated using (true) with check (true);
create policy "admin_delete_umkm" on public.umkm_list for delete to authenticated using (true);

create policy "admin_insert_config" on public.village_config for insert to authenticated with check (true);
create policy "admin_update_config" on public.village_config for update to authenticated using (true) with check (true);

create policy "admin_insert_officers" on public.officers_list for insert to authenticated with check (true);
create policy "admin_update_officers" on public.officers_list for update to authenticated using (true) with check (true);
create policy "admin_delete_officers" on public.officers_list for delete to authenticated using (true);

create policy "admin_insert_agenda" on public.agenda_list for insert to authenticated with check (true);
create policy "admin_update_agenda" on public.agenda_list for update to authenticated using (true) with check (true);
create policy "admin_delete_agenda" on public.agenda_list for delete to authenticated using (true);

create policy "admin_update_complaint" on public.complaints_list for update to authenticated using (true) with check (true);
create policy "admin_delete_complaint" on public.complaints_list for delete to authenticated using (true);

create policy "admin_insert_news" on public.news_list for insert to authenticated with check (true);
create policy "admin_update_news" on public.news_list for update to authenticated using (true) with check (true);
create policy "admin_delete_news" on public.news_list for delete to authenticated using (true);

-- =====================================================================
-- 3. STORAGE — bucket untuk semua gambar (produk, sertifikat, foto, dll)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('desa-images', 'desa-images', true)
on conflict (id) do nothing;

-- Semua orang boleh melihat gambar (publik)
create policy "public_read_images" on storage.objects
  for select using (bucket_id = 'desa-images');

-- Warga (anon) boleh mengunggah (foto produk & foto aduan)
create policy "public_upload_images" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'desa-images');

-- Hanya admin yang boleh memperbarui/menghapus berkas
create policy "admin_update_images" on storage.objects
  for update to authenticated using (bucket_id = 'desa-images');
create policy "admin_delete_images" on storage.objects
  for delete to authenticated using (bucket_id = 'desa-images');

-- =====================================================================
-- 4. REALTIME — agar perubahan tampil langsung di semua perangkat
-- =====================================================================
alter publication supabase_realtime add table public.umkm_list;
alter publication supabase_realtime add table public.officers_list;
alter publication supabase_realtime add table public.agenda_list;
alter publication supabase_realtime add table public.news_list;
alter publication supabase_realtime add table public.complaints_list;
alter publication supabase_realtime add table public.village_config;

-- =====================================================================
-- 5. DATA AWAL (SEED) — isi konten contoh seperti versi lama
-- =====================================================================

-- ----- Konfigurasi Desa -----
insert into public.village_config (section, data) values
('kades', jsonb_build_object(
  'name',   'Ir. H. Joko Santoso',
  'period', '2024 - 2030',
  'photo',  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
  'bio',    '<p>Assalamu''alaikum Wr. Wb. Salam sejahtera bagi kita semua.</p><p>Puji syukur kehadirat Tuhan Yang Maha Esa atas hadirnya portal digital Desa Sumberurip. Langkah ini merupakan bukti komitmen kami untuk membawa desa tercinta melangkah lebih maju ke era modernisasi tanpa melupakan nilai-nilai luhur kebersamaan.</p><p>Melalui website ini, kami memberikan panggung utama bagi seluruh pelaku UMKM lokal untuk tumbuh besar dan terkoneksi langsung dengan pasar luar. Dengan sistem verifikasi kelayakan produk oleh Admin Desa, kami menjamin kualitas terbaik dari komoditas yang kami tawarkan. Dari desa untuk Nusantara, mari kita gotong-royong memajukan ekonomi lokal!</p>'
)),
('stats', jsonb_build_object(
  'population', '3,450+',
  'partners',  '12+',
  'rating',    '12.5 km²'
)),
('map', jsonb_build_object(
  'centerLat',     -7.6145,
  'centerLng',     110.1502,
  'address',       'Desa Sumberurip, Kec. Indah, Kab. Makmur, Jawa Tengah',
  'northBoundary', 'Desa Ngasinan',
  'eastBoundary',  'Desa Margoyoso (Kec. Indah)',
  'southBoundary', 'Desa Sukowuwuh',
  'westBoundary',  'Desa Nglaris-Liman',
  'gmapsLink',     'https://maps.google.com/?q=-7.6145,110.1502'
))
on conflict (section) do nothing;

-- ----- Perangkat Desa -----
do $$
begin
  if not exists (select 1 from public.officers_list) then
    insert into public.officers_list (name, role, period, photo) values
    ('Drs. Bambang Wijaya',     'Sekretaris Desa',                '2024 - 2030', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80'),
    ('Siti Rahmawati, S.E.',    'Bendahara Keuangan',             '2025 - 2031', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'),
    ('Heri Prasetyo',           'Kepala Urusan Pembangunan',      '2024 - 2030', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80'),
    ('Ningsih Wulandari',       'Kepala Urusan Kesejahteraan',    '2024 - 2030', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');
  end if;
end $$;

-- ----- UMKM (terverifikasi) -----
do $$
begin
  if not exists (select 1 from public.umkm_list) then
    insert into public.umkm_list (name, category, owner, phone, image_url, description, store_url, cert_url, status) values
    ('Kopi Arabika Lereng Sumber', 'Makanan',   'Pak Harjo',           '81234567890', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80', 'Kopi robusta dan arabika pilihan asli pegunungan desa, diproses secara organik tradisional.', 'https://shopee.co.id',   'https://placehold.co/600x400/b45309/ffffff?text=SERTIFIKAT+HALAL+KOPI+SUMBER', 'approved'),
    ('Batik Canting Sumberurip','Kerajinan', 'Ibu Lastri',          '89876543210', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=80', 'Kain batik tulis bermotif flora lokal khas nusantara, dikerjakan tangan langsung oleh pengerajin lokal.', 'https://tokopedia.com', 'https://placehold.co/600x400/b45309/ffffff?text=SERTIFIKAT+HAKI+BATIK+SUMBER', 'approved'),
    ('Beras Ketan Putih Organik', 'Pertanian', 'Kelompok Tani Subur', '81122334455', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80', 'Beras ketan putih pulen bebas pestisida kimia, diproduksi langsung dari irigasi air jernih pegunungan.', 'https://shopee.co.id',   'https://placehold.co/600x400/b45309/ffffff?text=SERTIFIKAT+ORGANIK+PERTANIAN', 'approved');
  end if;
end $$;

-- ----- Berita Desa -----
do $$
begin
  if not exists (select 1 from public.news_list) then
    insert into public.news_list (title, news_date, summary, content, image_url) values
    ('Pemerintah Desa Sumberurip Luncurkan Portal Digital Baru', '26 Juni 2026', 'Portal desa resmi kini hadir untuk memudahkan layanan publik, UMKM, dan laporan warga secara digital.', 'Desa Sumberurip resmi meluncurkan portal digital terbaru yang menghadirkan layanan informasi desa, pendaftaran UMKM, agenda desa, dan E-Lapor. Semua warga dapat mengakses layanan ini dari perangkat mobile maupun desktop.', 'https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=800&q=80'),
    ('Pendaftaran UMKM Desa Sumberurip Dibuka Secara Resmi', '20 Juni 2026', 'Calon pelaku UMKM dapat mendaftar dan memperbarui profile usaha digital dengan dukungan Admin Desa.', 'Admin desa siap membantu verifikasi usaha mikro lokal. Setiap UMKM dapat menambahkan link marketplace seperti Shopee, Tokopedia, atau TikTok Shop untuk memperluas kanal penjualan.', 'https://images.unsplash.com/photo-1515169067865-5387ec356754?auto=format&fit=crop&w=800&q=80');
  end if;
end $$;

-- ----- Agenda Desa -----
do $$
begin
  if not exists (select 1 from public.agenda_list) then
    insert into public.agenda_list (title, status, event_date, event_time, location, description, image_url) values
    ('Musyawarah Perencanaan Pembangunan Desa (Musrenbangdes)', 'Mendatang',   '25 Juni 2026', '09:00 WIB - Selesai',     'Balai Desa Sumberurip',     'Penyusunan kerangka kerja teritorial pembangunan desa terpadu anggaran semester depan bersama seluruh pimpinan dusun dan karang taruna.', 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=500&q=80'),
    ('Penyuluhan Sertifikasi Halal Gratis & Digitalisasi UMKM','Berlangsung', '15 Juni 2026', '13:00 WIB - 16:00 WIB',   'Aula Serbaguna Kantor Desa',   'Pendampingan khusus pendaftaran izin sertifikasi halal serta pembuatan akun niaga digital mandiri secara gratis tanpa pungutan biaya.', 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=500&q=80'),
    ('Dokumentasi Pawai Gunungan & Festival Budaya Sumberurip',     'Selesai',     '24 Mei 2026',  '08:00 WIB - Selesai',     'Lapangan Kebudayaan Sumberurip',   'Rangkuman dokumentasi keindahan festival rasa syukur panen raya bumi warga yang dihadiri seluruh dusun dengan pagelaran kesenian tari lokal.', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=500&q=80');
  end if;
end $$;

-- ----- Pengaduan Warga (E-Lapor) -----
do $$
begin
  if not exists (select 1 from public.complaints_list) then
    insert into public.complaints_list (title, category, location, description, whatsapp, status, rejection_reason, image_url, complaint_date, resolution_image_url) values
    ('Jalan Berlubang Parah di RT 03 Dusun Krajan',        'Infrastruktur', 'Jl. Kenangan RT 03, dekat Jembatan',          'Jalan utama desa berlubang cukup lebar dan dalam. Sangat membahayakan warga terutama pengendara sepeda motor di malam hari yang minim penerangan.', '81234567890', 'Sedang Diproses', '', 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=500&q=80', '12 Juni 2026', ''),
    ('Lampu Penerangan Jalan Umum (PJU) Mati Total',       'Infrastruktur', 'Dekat Lapangan Kebudayaan Dusun Krajan',      'Sudah 3 hari lampu penerangan jalan di simpang tiga mati total, membuat area jalanan gelap gulita saat malam dan rawan kecelakaan.', '81234567891', 'Selesai Ditangani', '', 'https://images.unsplash.com/photo-1509024644558-2f56ce76c490?auto=format&fit=crop&w=500&q=80', '10 Juni 2026', 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=500&q=80'),
    ('Tumpukan Sampah Liar Menyumbat Irigasi',             'Kebersihan',    'Saluran Air Sawah RT 05',                     'Adanya oknum tidak bertanggung jawab membuang sampah karung plastik yang menyumbat pintu pembagi air sawah milik warga kelompok tani.', '81234567892', 'Menunggu Tindakan', '', 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=500&q=80', '14 Juni 2026', '');
  end if;
end $$;

-- =====================================================================
-- SELESAI. Langkah terakhir: buat akun admin di
-- Authentication > Users > Add user (email + password).
-- =====================================================================
