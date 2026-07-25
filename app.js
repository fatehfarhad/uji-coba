//  APP.JS - Mesin utama Portal Desa Sumberurip
//  Logika: koneksi Supabase, render, Auth, CRUD, peta.
//  Untuk mengubah kunci Supabase, EDIT config.js (bukan file ini).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY, BUCKET } from "./config.js";

const isConfiguredRaw =
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes("YOUR-PROJECT") &&
  !SUPABASE_ANON_KEY.includes("YOUR-ANON");
// Basic format check for an anon JWT (typical Supabase anon keys start with eyJ)
const hasLikelyAnonKey =
  typeof SUPABASE_ANON_KEY === "string" && SUPABASE_ANON_KEY.startsWith("eyJ");
const isConfigured = isConfiguredRaw && hasLikelyAnonKey;
let supabase = null;
if (isConfigured) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  // Log helpful debug info to console for easier troubleshooting
  console.warn("Supabase not configured or ANON key format looks invalid.", {
    SUPABASE_URL,
    SUPABASE_ANON_KEY_preview: SUPABASE_ANON_KEY
      ? SUPABASE_ANON_KEY.slice(0, 10) + "..."
      : null,
  });
}

// DATA CONTOH (tampil jika Supabase belum diisi)
const defaultKades = {
  name: "Ir. H. Joko Santoso",
  period: "2024 - 2030",
  photo:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
  bio: "<p>Assalamu'alaikum Wr. Wb. Salam sejahtera bagi kita semua.</p><p>Puji syukur kehadirat Tuhan Yang Maha Esa atas hadirnya portal digital Desa Sumberurip. Langkah ini merupakan bukti komitmen kami untuk membawa desa tercinta melangkah lebih maju ke era modernisasi tanpa melupakan nilai-nilai luhur kebersamaan.</p><p>Melalui website ini, kami memberikan panggung utama bagi seluruh pelaku UMKM lokal untuk tumbuh besar dan terkoneksi langsung dengan pasar luar. Dengan sistem verifikasi kelayakan produk oleh Admin Desa, kami menjamin kualitas terbaik dari komoditas yang kami tawarkan. Dari desa untuk Nusantara, mari kita gotong-royong memajukan ekonomi lokal!</p>",
};
const defaultStats = {
  population: "3,450+",
  partners: "12+",
  rating: "12.5 km²",
};
const defaultMapConfig = {
  centerLat: -7.6145,
  centerLng: 110.1502,
  address: "Dsn. Krajan, Sumberurip, Kec. Indah, Kab. Makmur, Jawa Tengah",
  northBoundary: "Desa Ngasinan",
  eastBoundary: "Desa Margoyoso (Kec. Indah)",
  southBoundary: "Desa Sukowuwuh",
  westBoundary: "Desa Nglaris-Liman",
  gmapsLink: "https://maps.google.com/?q=-7.6145,110.1502",
};
const defaultOfficers = [
  {
    id: "off1",
    name: "Drs. Bambang Wijaya",
    role: "Sekretaris Desa",
    period: "2024 - 2030",
    photo:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "off2",
    name: "Siti Rahmawati, S.E.",
    role: "Bendahara Keuangan",
    period: "2025 - 2031",
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "off3",
    name: "Heri Prasetyo",
    role: "Kepala Urusan Pembangunan",
    period: "2024 - 2030",
    photo:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "off4",
    name: "Ningsih Wulandari",
    role: "Kepala Urusan Kesejahteraan",
    period: "2024 - 2030",
    photo:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  },
];
const defaultUMKMs = [
  {
    id: "umkm1",
    name: "Kopi Arabika Lereng Kerto",
    category: "Makanan",
    owner: "Pak Harjo",
    phone: "81234567890",
    imageUrl:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80",
    desc: "Kopi robusta dan arabika pilihan asli pegunungan desa, diproses secara organik tradisional.",
    status: "approved",
    storeUrl: "https://shopee.co.id",
    storeUrls: ["https://shopee.co.id"],
    certUrl:
      "https://placehold.co/600x400/b45309/ffffff?text=SERTIFIKAT+HALAL+KOPI+KERTO",
  },
  {
    id: "umkm2",
    name: "Batik Canting Sumberurip",
    category: "Kerajinan",
    owner: "Ibu Lastri",
    phone: "89876543210",
    imageUrl:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=80",
    desc: "Kain batik tulis bermotif flora lokal khas nusantara, dikerjakan tangan langsung oleh pengerajin lokal.",
    status: "approved",
    storeUrl: "https://tokopedia.com",
    storeUrls: ["https://tokopedia.com"],
    certUrl:
      "https://placehold.co/600x400/b45309/ffffff?text=SERTIFIKAT+HAKI+BATIK+SUMBER",
  },
  {
    id: "umkm3",
    name: "Beras Ketan Putih Organik",
    category: "Pertanian",
    owner: "Kelompok Tani Subur",
    phone: "81122334455",
    imageUrl:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80",
    desc: "Beras ketan putih pulen bebas pestisida kimia, diproduksi langsung dari irigasi air jernih pegunungan.",
    status: "approved",
    storeUrl: "https://shopee.co.id",
    storeUrls: ["https://shopee.co.id"],
    certUrl:
      "https://placehold.co/600x400/b45309/ffffff?text=SERTIFIKAT+ORGANIK+PERTANIAN",
  },
];
const defaultAgendas = [
  {
    id: "agenda1",
    title: "Musyawarah Perencanaan Pembangunan Desa (Musrenbangdes)",
    status: "Mendatang",
    date: "25 Juni 2026",
    time: "09:00 WIB - Selesai",
    location: "Balai Desa Sumberurip",
    desc: "Penyusunan kerangka kerja teritorial pembangunan desa terpadu anggaran semester depan bersama seluruh pimpinan dusun dan karang taruna.",
    imageUrl:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "agenda2",
    title: "Penyuluhan Sertifikasi Halal Gratis & Digitalisasi UMKM",
    status: "Berlangsung",
    date: "15 Juni 2026",
    time: "13:00 WIB - 16:00 WIB",
    location: "Aula Serbaguna Kantor Desa",
    desc: "Pendampingan khusus pendaftaran izin sertifikasi halal serta pembuatan akun niaga digital mandiri secara gratis tanpa pungutan biaya.",
    imageUrl:
      "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "agenda3",
    title: "Dokumentasi Pawai Gunungan & Festival Budaya Sumberurip",
    status: "Selesai",
    date: "24 Mei 2026",
    time: "08:00 WIB - Selesai",
    location: "Lapangan Kebudayaan Krajan",
    desc: "Rangkuman dokumentasi keindahan festival rasa syukur panen raya bumi warga yang dihadiri seluruh dusun dengan pagelaran kesenian tari lokal.",
    imageUrl:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=500&q=80",
  },
];
const defaultNews = [
  {
    id: "news1",
    title: "Pemerintah Desa Sumberurip Luncurkan Portal Digital Baru",
    date: "26 Juni 2026",
    summary:
      "Portal desa resmi kini hadir untuk memudahkan layanan publik, UMKM, dan laporan warga secara digital.",
    content:
      "Desa Sumberurip resmi meluncurkan portal digital terbaru yang menghadirkan layanan informasi desa, pendaftaran UMKM, agenda desa, dan E-Lapor. Semua warga dapat mengakses layanan ini dari perangkat mobile maupun desktop.",
    imageUrl:
      "https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "news2",
    title: "Pendaftaran UMKM Desa Sumberurip Dibuka Secara Resmi",
    date: "20 Juni 2026",
    summary:
      "Calon pelaku UMKM dapat mendaftar dan memperbarui profile usaha digital dengan dukungan Admin Desa.",
    content:
      "Admin desa siap membantu verifikasi usaha mikro lokal. Setiap UMKM dapat menambahkan link marketplace seperti Shopee, Tokopedia, atau TikTok Shop untuk memperluas kanal penjualan.",
    imageUrl:
      "https://images.unsplash.com/photo-1515169067865-5387ec356754?auto=format&fit=crop&w=800&q=80",
  },
];
const defaultComplaints = [
  {
    id: "comp1",
    title: "Jalan Berlubang Parah di RT 03 Dusun Krajan",
    category: "Infrastruktur",
    location: "Jl. Kenangan RT 03, dekat Jembatan",
    desc: "Jalan utama desa berlubang cukup lebar dan dalam. Sangat membahayakan warga terutama pengendara sepeda motor di malam hari yang minim penerangan.",
    status: "Sedang Diproses",
    imageUrl:
      "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=500&q=80",
    whatsapp: "81234567890",
    rejectionReason: "",
    date: "12 Juni 2026",
    resolutionImageUrl: "",
  },
  {
    id: "comp2",
    title: "Lampu Penerangan Jalan Umum (PJU) Mati Total",
    category: "Infrastruktur",
    location: "Dekat Lapangan Kebudayaan Dusun Krajan",
    desc: "Sudah 3 hari lampu penerangan jalan di simpang tiga mati total, membuat area jalanan gelap gulita saat malam dan rawan kecelakaan.",
    status: "Selesai Ditangani",
    imageUrl:
      "https://images.unsplash.com/photo-1509024644558-2f56ce76c490?auto=format&fit=crop&w=500&q=80",
    whatsapp: "81234567891",
    rejectionReason: "",
    date: "10 Juni 2026",
    resolutionImageUrl:
      "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "comp3",
    title: "Tumpukan Sampah Liar Menyumbat Irigasi",
    category: "Kebersihan",
    location: "Saluran Air Sawah RT 05",
    desc: "Adanya oknum tidak bertanggung jawab membuang sampah karung plastik yang menyumbat pintu pembagi air sawah milik warga kelompok tani.",
    status: "Menunggu Tindakan",
    imageUrl:
      "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=500&q=80",
    whatsapp: "81234567892",
    rejectionReason: "",
    date: "14 Juni 2026",
    resolutionImageUrl: "",
  },
];

let state = {
  currentTab: "home",
  kades: { ...defaultKades },
  officers: [...defaultOfficers],
  umkms: [...defaultUMKMs],
  agendas: [...defaultAgendas],
  stats: { ...defaultStats },
  mapConfig: { ...defaultMapConfig },
  complaints: [...defaultComplaints],
  currentFilter: "all",
  currentAgendaFilter: "all",
  currentComplaintFilter: "all",
  serviceUser: null,
  serviceAdminRequests: [],
  serviceUserRequests: [],
  serviceUsers: [],
  isAdminAuthenticated: false,
  news: [...defaultNews],
};

// Map engine globals
let leafletMap = null,
  mapMarker = null,
  mapPolygon = null;
let currentMapMode = "street",
  streetLayer,
  satelliteLayer;

// ---------- HELPER GAMBAR ----------
function compressImageToBlob(file, maxDim = 1000, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject("Tidak ada file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width,
          height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject("Gagal kompres")),
          "image/jpeg",
          quality,
        );
      };
      img.onerror = () => reject("Gagal membaca gambar");
      img.src = e.target.result;
    };
    reader.onerror = () => reject("Gagal memuat berkas");
    reader.readAsDataURL(file);
  });
}
async function uploadImage(file, folder) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  const blob = await compressImageToBlob(file);
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: "image/jpeg",
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

window.previewImage = function (input, previewId) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const preview = document.getElementById(previewId);
      if (preview) preview.src = e.target.result;
      const container = document.getElementById(previewId + "-container");
      if (container) {
        container.classList.remove("hidden");
        const prompt = document.getElementById(
          "upload-prompt-" + previewId.split("-")[1],
        );
        if (prompt) prompt.classList.add("hidden");
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
};
window.clearUpload = function (inputId, containerId, promptId) {
  const input = document.getElementById(inputId);
  if (input) input.value = "";
  const container = document.getElementById(containerId);
  if (container) container.classList.add("hidden");
  const prompt = document.getElementById(promptId);
  if (prompt) prompt.classList.remove("hidden");
};
window.openCertViewer = function (imgSrc) {
  const modal = document.getElementById("cert-viewer-modal");
  document.getElementById("modal-cert-img").src = imgSrc;
  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.classList.add("opacity-100");
    modal.firstElementChild.classList.remove("scale-95");
    modal.firstElementChild.classList.add("scale-100");
  }, 50);
};
window.closeCertViewer = function () {
  const modal = document.getElementById("cert-viewer-modal");
  modal.classList.remove("opacity-100");
  modal.firstElementChild.classList.remove("scale-100");
  modal.firstElementChild.classList.add("scale-95");
  setTimeout(() => modal.classList.add("hidden"), 200);
};

// ---------- MAPPER (snake_case DB -> camelCase state) ----------
const mapUmkm = (r) => {
  const storeUrls = Array.isArray(r.store_urls)
    ? r.store_urls.filter(Boolean)
    : r.store_url
      ? [r.store_url]
      : [];
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    owner: r.owner,
    phone: r.phone,
    imageUrl: r.image_url,
    desc: r.description,
    storeUrls,
    storeUrl: storeUrls.length > 0 ? storeUrls[0] : "",
    certUrl: r.cert_url,
    status: r.status,
  };
};
const mapOfficer = (r) => ({
  id: r.id,
  name: r.name,
  role: r.role,
  period: r.period,
  photo: r.photo,
});
const mapAgenda = (r) => {
  const imageUrls = Array.isArray(r.image_urls)
    ? r.image_urls.filter(Boolean)
    : r.image_url
      ? [r.image_url]
      : [];
  return {
    id: r.id,
    title: r.title,
    status: r.status,
    date: r.event_date,
    time: r.event_time,
    location: r.location,
    desc: r.description,
    imageUrls,
    imageUrl: imageUrls.length > 0 ? imageUrls[0] : "",
  };
};
const mapNews = (r) => ({
  id: r.id,
  title: r.title,
  date: r.news_date,
  summary: r.summary,
  content: r.content,
  imageUrl: r.image_url,
});
function buildStoreButtons(storeUrls = []) {
  if (!Array.isArray(storeUrls) || storeUrls.length === 0) return "";
  return storeUrls
    .filter(Boolean)
    .map((url) => {
      const lower = url.toLowerCase();
      let iconClass = "fa-solid fa-arrow-up-right-from-square";
      let label = "Toko";
      let brandClass = "bg-slate-100 hover:bg-slate-200 text-slate-800";
      if (lower.includes("shopee")) {
        iconClass = "fa-solid fa-bag-shopping";
        label = "Shopee";
        brandClass =
          "bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100";
      } else if (lower.includes("tokopedia")) {
        iconClass = "fa-solid fa-store";
        label = "Tokopedia";
        brandClass =
          "bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100";
      } else if (lower.includes("lazada")) {
        iconClass = "fa-solid fa-cart-flatbed";
        label = "Lazada";
        brandClass =
          "bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100";
      } else if (lower.includes("tiktok")) {
        iconClass = "fa-brands fa-tiktok";
        label = "TikTok";
        brandClass = "bg-slate-900 text-white hover:bg-black";
      }
      return `<a href="${url}" target="_blank" class="flex-1 py-3 text-center rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${brandClass}"><i class="${iconClass}"></i> ${label}</a>`;
    })
    .join("");
}
const mapComplaint = (r) => ({
  id: r.id,
  title: r.title,
  category: r.category,
  location: r.location,
  desc: r.description,
  imageUrl: r.image_url,
  whatsapp: r.whatsapp,
  rejectionReason: r.rejection_reason,
  status: r.status,
  date: r.complaint_date,
  resolutionImageUrl: r.resolution_image_url,
});

// ---------- LOADER ----------
async function loadConfig() {
  if (!supabase) return;
  const { data, error } = await supabase.from("village_config").select("*");
  if (error) {
    console.error(error);
    return;
  }
  data.forEach((row) => {
    if (row.section === "kades") state.kades = row.data;
    else if (row.section === "stats") state.stats = row.data;
    else if (row.section === "map") state.mapConfig = row.data;
  });
  renderAll();
  if (state.currentTab === "wilayah") updateMapMarkerAndBoundary();
}
async function loadUMKMs() {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("umkm_list")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error(error);
    return;
  }
  state.umkms = data.map(mapUmkm);
  renderAll();
}
async function loadOfficers() {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("officers_list")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error(error);
    return;
  }
  state.officers = data.map(mapOfficer);
  renderAll();
}
async function loadAgendas() {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("agenda_list")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error(error);
    return;
  }
  state.agendas = data.map(mapAgenda);
  renderAll();
}
function renderAgendaPreviewGallery(urls = []) {
  const gallery = document.getElementById("preview-agenda-gallery");
  if (!gallery) return;
  gallery.innerHTML = "";
  urls.forEach((url) => {
    const item = document.createElement("div");
    item.className =
      "h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200";
    item.innerHTML = `<img src="${url}" alt="Preview Agenda" onerror="this.src='https://placehold.co/100x100?text=Foto'" class="w-full h-full object-cover" />`;
    gallery.appendChild(item);
  });
}
window.previewAgendaImages = function (input) {
  const gallery = document.getElementById("preview-agenda-gallery");
  if (!gallery) return;
  gallery.innerHTML = "";
  Array.from(input.files || []).forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const item = document.createElement("div");
      item.className =
        "h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200";
      item.innerHTML = `<img src="${e.target.result}" alt="Preview Agenda" class="w-full h-full object-cover" />`;
      gallery.appendChild(item);
    };
    reader.readAsDataURL(file);
  });
};
async function loadNews() {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("news_list")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    return;
  }
  state.news = data.map(mapNews);
  renderAll();
}
async function loadComplaints() {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("complaints_list")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error(error);
    return;
  }
  state.complaints = data.map(mapComplaint);
  renderAll();
}

function setupRealtime() {
  if (!supabase) return;
  supabase
    .channel("desa-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "umkm_list" },
      loadUMKMs,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "officers_list" },
      loadOfficers,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "agenda_list" },
      loadAgendas,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "news_list" },
      loadNews,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "complaints_list" },
      loadComplaints,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "village_config" },
      loadConfig,
    )
    .subscribe();
}

// ---------- AUTH (Supabase Email/Password) ----------
async function applyAuthState(session) {
  state.isAdminAuthenticated = !!session;
  const loginCard = document.getElementById("admin-login-card");
  const dash = document.getElementById("admin-dashboard-card");
  if (session) {
    loginCard.classList.add("hidden");
    dash.classList.remove("hidden");
    const lbl = document.getElementById("admin-email-label");
    if (lbl && session.user) lbl.innerText = session.user.email;
    if (supabase) {
      await Promise.all([loadServiceUsers(), loadServiceRequests()]);
    }
    renderAdminDashboard();
  } else {
    loginCard.classList.remove("hidden");
    dash.classList.add("hidden");
  }
}
window.handleAdminLogin = async function (e) {
  e.preventDefault();
  if (!supabase) {
    showNotification(
      "Supabase belum dikonfigurasi. Isi SUPABASE_URL & SUPABASE_ANON_KEY di kode.",
      "error",
    );
    return;
  }
  const email = document.getElementById("admin-email-input").value.trim();
  const password = document.getElementById("admin-password-input").value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    showNotification("Email atau kata sandi salah.", "error");
    return;
  }
  document.getElementById("admin-password-input").value = "";
  showNotification(
    "Berhasil masuk! Selamat bekerja untuk kemajuan desa.",
    "success",
  );
};
window.handleAdminLogout = async function () {
  if (supabase) await supabase.auth.signOut();
  showNotification("Sesi Admin telah dinonaktifkan.", "info");
};

// ---------- INIT ----------
async function initApp() {
  if (!supabase) {
    renderAll();
    hidePreloader();
    showNotification(
      "Mode demo: Supabase belum dikonfigurasi. Website tampil dengan data contoh. Isi SUPABASE_URL & SUPABASE_ANON_KEY di dalam kode untuk mengaktifkan database.",
      "info",
    );
    return;
  }
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    await applyAuthState(session);
    supabase.auth.onAuthStateChange((_event, session) => {
      applyAuthState(session);
    });
    await Promise.all([
      loadConfig(),
      loadUMKMs(),
      loadOfficers(),
      loadAgendas(),
      loadNews(),
      loadComplaints(),
    ]);
    setupRealtime();
  } catch (err) {
    console.error("Init error:", err);
    const errMsg = err && err.message ? err.message : String(err);
    showNotification(
      `Gagal terhubung ke Supabase: ${errMsg}. Cek URL/Key & koneksi internet. Website tetap tampil dengan data contoh.`,
      "error",
    );
  }
  hidePreloader();
}

function hidePreloader() {
  const p = document.getElementById("app-preloader");
  if (p) {
    p.classList.add("opacity-0");
    setTimeout(() => p.classList.add("hidden"), 500);
  }
}

// ---------- LEAFLET MAP ----------
function initLeafletMap() {
  const mapContainer = document.getElementById("map-canvas");
  if (!mapContainer) return;
  if (leafletMap) {
    leafletMap.invalidateSize();
    updateMapMarkerAndBoundary();
    return;
  }
  leafletMap = L.map("map-canvas", {
    center: [
      parseFloat(state.mapConfig.centerLat),
      parseFloat(state.mapConfig.centerLng),
    ],
    zoom: 14,
    zoomControl: false,
  });
  L.control.zoom({ position: "bottomright" }).addTo(leafletMap);
  streetLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { attribution: "© OpenStreetMap contributors" },
  );
  satelliteLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { attribution: "Tiles &copy; Esri" },
  );
  streetLayer.addTo(leafletMap);
  updateMapMarkerAndBoundary();
}
window.toggleMapMode = function () {
  if (!leafletMap) return;
  if (currentMapMode === "street") {
    leafletMap.removeLayer(streetLayer);
    satelliteLayer.addTo(leafletMap);
    currentMapMode = "satellite";
    showNotification("Beralih ke mode citra satelit", "info");
  } else {
    leafletMap.removeLayer(satelliteLayer);
    streetLayer.addTo(leafletMap);
    currentMapMode = "street";
    showNotification("Beralih ke mode peta jalanan", "info");
  }
};
function updateMapMarkerAndBoundary() {
  if (!leafletMap) return;
  const lat = parseFloat(state.mapConfig.centerLat),
    lng = parseFloat(state.mapConfig.centerLng);
  leafletMap.setView([lat, lng], 14);
  if (mapMarker) leafletMap.removeLayer(mapMarker);
  if (mapPolygon) leafletMap.removeLayer(mapPolygon);
  mapMarker = L.marker([lat, lng]).addTo(leafletMap);
  mapMarker
    .bindPopup(
      `<div class="p-1"><h4 class="font-extrabold text-primary-900 text-sm">Kantor Kepala Desa</h4><p class="text-xs text-slate-600 mt-1">${state.mapConfig.address}</p></div>`,
    )
    .openPopup();
  const delta = 0.012;
  const villageCoords = [
    [lat + delta, lng - delta / 2],
    [lat + delta / 1.5, lng + delta],
    [lat - delta / 3, lng + delta * 1.2],
    [lat - delta, lng + delta / 2],
    [lat - delta, lng - delta / 1.2],
    [lat - delta / 3, lng - delta * 1.1],
  ];
  const outerBoundary = [
    [90, -180],
    [90, 180],
    [-90, 180],
    [-90, -180],
  ];
  mapPolygon = L.polygon([outerBoundary, villageCoords], {
    color: "#10b981",
    fillColor: "#061a10",
    fillOpacity: 0.65,
    weight: 4,
    dashArray: "6, 6",
  }).addTo(leafletMap);
}

// ---------- NAVIGATION ----------
window.navigateTo = function (pageId) {
  state.currentTab = pageId;
  document
    .querySelectorAll(".page-section")
    .forEach((s) => s.classList.add("hidden"));
  const target = document.getElementById(`section-${pageId}`);
  if (target) target.classList.remove("hidden");
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("text-primary-700", "bg-primary-50");
    link.classList.add("text-slate-700");
  });
  const activeLink = document.getElementById(`nav-${pageId}`);
  if (activeLink && pageId !== "register-umkm") {
    activeLink.classList.remove("text-slate-700");
    activeLink.classList.add("text-primary-700", "bg-primary-50");
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
  renderAll();
  if (pageId === "wilayah") setTimeout(initLeafletMap, 200);
};
window.toggleMobileMenu = function () {
  const menu = document.getElementById("mobile-menu"),
    icon = document.getElementById("menu-icon");
  if (menu.classList.contains("hidden")) {
    menu.classList.remove("hidden");
    icon.className = "fa-solid fa-xmark text-2xl";
  } else {
    menu.classList.add("hidden");
    icon.className = "fa-solid fa-bars text-2xl";
  }
};

// ---------- NOTIFICATION ----------
window.showNotification = function (message, type = "success") {
  const modal = document.getElementById("custom-modal");
  const iconContainer = document.getElementById("modal-icon-container");
  const icon = document.getElementById("modal-icon");
  const title = document.getElementById("modal-title");
  const msg = document.getElementById("modal-message");
  if (type === "success") {
    iconContainer.className =
      "flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-4 mx-auto";
    icon.className = "fa-solid fa-circle-check text-2xl";
    title.innerText = "Sukses!";
  } else if (type === "error") {
    iconContainer.className =
      "flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4 mx-auto";
    icon.className = "fa-solid fa-circle-xmark text-2xl";
    title.innerText = "Terjadi Kesalahan";
  } else if (type === "info") {
    iconContainer.className =
      "flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4 mx-auto";
    icon.className = "fa-solid fa-circle-info text-2xl";
    title.innerText = "Pemberitahuan";
  }
  msg.innerText = message;
  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.classList.add("opacity-100");
    modal.firstElementChild.classList.remove("scale-95");
    modal.firstElementChild.classList.add("scale-100");
  }, 50);
};
window.closeCustomModal = function () {
  const modal = document.getElementById("custom-modal");
  modal.classList.remove("opacity-100");
  modal.firstElementChild.classList.remove("scale-100");
  modal.firstElementChild.classList.add("scale-95");
  setTimeout(() => modal.classList.add("hidden"), 200);
};

// ---------- CONFIRMATION DIALOG ----------
let pendingConfirmation = null;

window.showConfirmation = function (
  title,
  message,
  actionType = "default",
  callback = null,
) {
  const modal = document.getElementById("confirmation-modal");
  const iconContainer = document.getElementById("confirm-icon-container");
  const titleEl = document.getElementById("confirm-title");
  const messageEl = document.getElementById("confirm-message");
  const proceedBtn = document.getElementById("confirm-proceed-btn");

  titleEl.innerText = title;
  messageEl.innerText = message;

  if (actionType === "delete") {
    iconContainer.className =
      "flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4 mx-auto";
    proceedBtn.className =
      "flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg transition-all";
    proceedBtn.innerText = "Hapus";
  } else if (actionType === "submit") {
    iconContainer.className =
      "flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4 mx-auto";
    proceedBtn.className =
      "flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all";
    proceedBtn.innerText = "Kirim";
  } else {
    iconContainer.className =
      "flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-600 mb-4 mx-auto";
    proceedBtn.className =
      "flex-1 py-3 bg-primary-700 hover:bg-primary-800 text-white font-semibold rounded-xl shadow-lg transition-all";
    proceedBtn.innerText = "Lanjutkan";
  }

  pendingConfirmation = callback;
  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.classList.add("opacity-100");
    modal.firstElementChild.classList.remove("scale-95");
    modal.firstElementChild.classList.add("scale-100");
  }, 50);
};

window.cancelConfirmation = function () {
  const modal = document.getElementById("confirmation-modal");
  modal.classList.remove("opacity-100");
  modal.firstElementChild.classList.remove("scale-100");
  modal.firstElementChild.classList.add("scale-95");
  setTimeout(() => {
    modal.classList.add("hidden");
    pendingConfirmation = null;
  }, 200);
};

window.proceedConfirmation = function () {
  const modal = document.getElementById("confirmation-modal");
  modal.classList.remove("opacity-100");
  modal.firstElementChild.classList.remove("scale-100");
  modal.firstElementChild.classList.add("scale-95");
  setTimeout(() => {
    modal.classList.add("hidden");
    if (pendingConfirmation && typeof pendingConfirmation === "function")
      pendingConfirmation();
    pendingConfirmation = null;
  }, 200);
};

// ---------- RENDER PUBLIC ----------
function renderAll() {
  const approvedUMKM = state.umkms.filter(
    (u) => u.status === "approved",
  ).length;
  document.getElementById("stat-umkm").innerText = approvedUMKM;
  document.getElementById("stat-population").innerText = state.stats.population;
  document.getElementById("stat-partners").innerText = state.stats.partners;
  document.getElementById("stat-rating").innerText = state.stats.rating;

  document.getElementById("kades-name-welcome").innerText = state.kades.name;
  document.getElementById("kades-period-welcome").innerText =
    `Masa Jabatan: ${state.kades.period}`;
  document.getElementById("kades-photo-welcome").src = state.kades.photo;
  document.getElementById("kades-bio-welcome").innerHTML = state.kades.bio;

  document.getElementById("map-center-address").innerText =
    state.mapConfig.address;
  document.getElementById("map-bound-north").innerText =
    state.mapConfig.northBoundary;
  document.getElementById("map-bound-east").innerText =
    state.mapConfig.eastBoundary;
  document.getElementById("map-bound-south").innerText =
    state.mapConfig.southBoundary;
  document.getElementById("map-bound-west").innerText =
    state.mapConfig.westBoundary;
  document.getElementById("gmaps-btn-link").href = state.mapConfig.gmapsLink;

  const homeAgenda = document.getElementById("home-agenda-container");
  if (homeAgenda) {
    homeAgenda.innerHTML = "";
    [...state.agendas].slice(0, 3).forEach((item) => {
      const imgs = Array.isArray(item.imageUrls)
        ? item.imageUrls
        : item.imageUrl
          ? [item.imageUrl]
          : [];
      let badgeClass = "bg-blue-50 text-blue-700 border-blue-100",
        pulseHtml = "";
      if (item.status === "Berlangsung") {
        badgeClass = "bg-amber-50 text-amber-700 border-amber-100";
        pulseHtml = `<span class="flex h-2.5 w-2.5 relative mr-1.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span></span>`;
      } else if (item.status === "Selesai")
        badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
      const extraPhotos = imgs.length > 1 ? imgs.length - 1 : 0;
      const photoBadge = extraPhotos
        ? `<span class="absolute bottom-3 right-3 px-2 py-1 text-[10px] font-bold rounded-full bg-slate-900/80 text-white">+${extraPhotos} foto</span>`
        : "";
      homeAgenda.innerHTML += `<div class="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:scale-[1.01] transition-all flex flex-col justify-between animate-fade-in"><div><div class="h-44 rounded-2xl overflow-hidden relative mb-4"><img src="${imgs[0] || "https://placehold.co/500x300/064e3b/ffffff?text=Agenda"}" alt="${item.title}" onerror="this.src='https://placehold.co/500x300/064e3b/ffffff?text=Agenda'" class="w-full h-full object-cover"><span class="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur text-xs font-bold rounded-full border border-slate-100 shadow-sm flex items-center ${badgeClass}">${pulseHtml} ${item.status}</span>${photoBadge}</div><span class="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1"><i class="fa-regular fa-clock mr-1"></i> ${item.date}</span><h4 class="text-base font-extrabold text-slate-900 leading-snug line-clamp-2 hover:text-emerald-700 transition-all cursor-pointer" onclick="navigateTo('agenda')">${item.title}</h4><p class="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">${item.desc}</p></div><div class="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-semibold"><span class="truncate max-w-[150px]"><i class="fa-solid fa-location-dot mr-1"></i> ${item.location}</span><button onclick="navigateTo('agenda')" class="text-emerald-600 hover:text-emerald-700">Rincian <i class="fa-solid fa-arrow-right ml-0.5"></i></button></div></div>`;
    });
  }

  const publicAgenda = document.getElementById("agenda-catalog-container");
  const agendaEmpty = document.getElementById("agenda-empty-state");
  if (publicAgenda) {
    publicAgenda.innerHTML = "";
    const filtered = state.agendas.filter(
      (i) =>
        state.currentAgendaFilter === "all" ||
        i.status === state.currentAgendaFilter,
    );
    if (filtered.length === 0) agendaEmpty.classList.remove("hidden");
    else {
      agendaEmpty.classList.add("hidden");
      filtered.forEach((item) => {
        const imgs = Array.isArray(item.imageUrls)
          ? item.imageUrls
          : item.imageUrl
            ? [item.imageUrl]
            : [];
        let badgeClass = "bg-blue-50 text-blue-700 border-blue-100",
          pulseHtml = "";
        if (item.status === "Berlangsung") {
          badgeClass = "bg-amber-50 text-amber-700 border-amber-100";
          pulseHtml = `<span class="flex h-2.5 w-2.5 relative mr-1.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span></span>`;
        } else if (item.status === "Selesai")
          badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
        const extraPhotos = imgs.length > 1 ? imgs.length - 1 : 0;
        const photoBadge = extraPhotos
          ? `<span class="absolute bottom-3 right-3 px-2 py-1 text-[10px] font-bold rounded-full bg-slate-900/80 text-white">+${extraPhotos} foto</span>`
          : "";
        publicAgenda.innerHTML += `<div class="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg hover:scale-[1.01] transition-all flex flex-col justify-between group"><div><div class="h-48 relative overflow-hidden bg-slate-100"><img src="${imgs[0] || "https://placehold.co/500x300/064e3b/ffffff?text=Agenda"}" alt="${item.title}" onerror="this.src='https://placehold.co/500x300/064e3b/ffffff?text=Agenda'" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"><span class="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur text-xs font-bold rounded-full border border-slate-100 shadow-sm flex items-center ${badgeClass}">${pulseHtml} ${item.status}</span>${photoBadge}</div><div class="p-5"><div class="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-xs text-emerald-600 font-bold"><span><i class="fa-solid fa-calendar mr-1"></i> ${item.date}</span><span><i class="fa-solid fa-clock mr-1"></i> ${item.time}</span></div><h4 class="text-lg font-bold text-slate-900 group-hover:text-primary-700 transition-all leading-snug">${item.title}</h4><p class="text-xs text-slate-500 mt-3 leading-relaxed">${item.desc}</p></div></div><div class="p-5 pt-0"><div class="pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-slate-500"><span class="truncate max-w-[180px]"><i class="fa-solid fa-location-dot mr-1 text-emerald-500"></i> ${item.location}</span><span class="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">Terverifikasi</span></div></div></div>`;
      });
    }
  }

  const homeNews = document.getElementById("home-news-container");
  if (homeNews) {
    homeNews.innerHTML = "";
    state.news.slice(0, 3).forEach((item) => {
      homeNews.innerHTML += `<div class="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all group animate-fade-in"><div class="h-52 overflow-hidden relative"><img src="${item.imageUrl}" alt="${item.title}" onerror="this.src='https://placehold.co/500x300/064e3b/ffffff?text=Berita'" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" /></div><div class="p-6"><span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600">${item.date}</span><h4 class="text-lg font-bold text-slate-900 mt-3 leading-snug">${item.title}</h4><p class="text-sm text-slate-500 mt-3 line-clamp-3">${item.summary}</p><button onclick="navigateTo('news')" class="mt-5 inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold text-sm">Baca Selengkapnya <i class="fa-solid fa-arrow-right-long"></i></button></div></div>`;
    });
  }
  const newsCatalog = document.getElementById("news-catalog-container");
  const newsEmpty = document.getElementById("news-empty-state");
  if (newsCatalog) {
    newsCatalog.innerHTML = "";
    if (state.news.length === 0) {
      newsEmpty.classList.remove("hidden");
    } else {
      newsEmpty.classList.add("hidden");
      state.news.forEach((item) => {
        newsCatalog.innerHTML += `<div class="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all group animate-fade-in"><div class="h-64 overflow-hidden relative"><img src="${item.imageUrl}" alt="${item.title}" onerror="this.src='https://placehold.co/600x400/064e3b/ffffff?text=Berita'" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" /></div><div class="p-6"><span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600">${item.date}</span><h4 class="text-xl font-bold text-slate-900 mt-3 leading-snug">${item.title}</h4><p class="text-sm text-slate-500 mt-3 leading-relaxed line-clamp-4">${item.summary}</p><p class="text-sm text-slate-500 mt-3 leading-relaxed">${item.content}</p></div></div>`;
      });
    }
  }
  const complaintsFeed = document.getElementById("complaints-feed-container");
  const complaintsEmpty = document.getElementById("complaints-empty-state");
  if (complaintsFeed) {
    complaintsFeed.innerHTML = "";
    const filtered = state.complaints.filter(
      (i) =>
        state.currentComplaintFilter === "all" ||
        i.status === state.currentComplaintFilter,
    );
    if (filtered.length === 0) complaintsEmpty.classList.remove("hidden");
    else {
      complaintsEmpty.classList.add("hidden");
      filtered.forEach((item) => {
        let badgeClass = "bg-red-50 text-red-700 border-red-100",
          statusIcon = "fa-hourglass-start",
          progressSection = "";
        if (item.status === "Sedang Diproses") {
          badgeClass = "bg-amber-50 text-amber-700 border-amber-100";
          statusIcon = "fa-rotate-right animate-spin";
        } else if (item.status === "Selesai Ditangani") {
          badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
          statusIcon = "fa-circle-check";
          if (item.resolutionImageUrl)
            progressSection = `<div class="mt-4 p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100"><span class="text-[10px] font-extrabold text-emerald-700 uppercase block mb-2"><i class="fa-solid fa-circle-check"></i> Bukti Penyelesaian Fisik:</span><div class="h-40 rounded-xl overflow-hidden bg-white border border-emerald-200"><img src="${item.resolutionImageUrl}" class="w-full h-full object-cover"></div></div>`;
          else
            progressSection = `<div class="mt-3 text-xs font-bold text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-center gap-1.5"><i class="fa-solid fa-sparkles"></i> Laporan ini telah diselesaikan dengan sukses oleh aparatur desa!</div>`;
        }
        let rejectionNotice = "";
        if (item.status === "Ditolak" && item.rejectionReason)
          rejectionNotice = `<div class="mt-4 p-3 bg-red-50 rounded-2xl border border-red-100"><span class="text-[10px] font-extrabold text-red-700 uppercase block mb-2"><i class="fa-solid fa-ban"></i> Alasan Laporan Ditolak:</span><p class="text-xs text-red-700 leading-relaxed">${item.rejectionReason}</p></div>`;
        complaintsFeed.innerHTML += `<div class="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col md:flex-row gap-5 animate-fade-in"><div class="w-full md:w-1/3 h-44 rounded-2xl overflow-hidden shrink-0 relative bg-slate-50"><img src="${item.imageUrl}" alt="${item.title}" onerror="this.src='https://placehold.co/400x300/e2e8f0/64748b?text=Bukti+Aduan'" class="w-full h-full object-cover"><span class="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur text-[10px] font-bold rounded-full border border-slate-100 shadow-sm flex items-center gap-1 ${badgeClass}"><i class="fa-solid ${statusIcon}"></i> ${item.status}</span></div><div class="flex-grow flex flex-col justify-between"><div><div class="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400 font-bold uppercase mb-1"><span class="text-emerald-600"><i class="fa-solid fa-tags"></i> ${item.category}</span><span><i class="fa-solid fa-calendar"></i> ${item.date}</span></div><h4 class="text-base font-extrabold text-slate-900 leading-snug">${item.title}</h4><p class="text-xs text-slate-500 mt-2 leading-relaxed">${item.desc}</p><div class="text-[11px] font-bold text-slate-500 mt-3 flex items-start gap-1"><i class="fa-solid fa-location-dot text-red-500 mt-0.5"></i><span>Lokasi: ${item.location}</span></div></div>${progressSection}${rejectionNotice}</div></div>`;
      });
    }
  }

  const officersContainer = document.getElementById("officers-container");
  officersContainer.innerHTML = "";
  state.officers.forEach((off) => {
    officersContainer.innerHTML += `<div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-all group"><div class="h-64 overflow-hidden relative"><img src="${off.photo}" alt="${off.name}" onerror="this.src='https://placehold.co/300x400/064e3b/ffffff?text=Aparatur'" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"><div class="absolute inset-0 bg-gradient-to-t from-primary-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div></div><div class="p-5 text-center"><span class="text-[10px] font-bold px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full inline-block mb-2 uppercase">${off.role}</span><h4 class="text-base font-bold text-slate-900 truncate">${off.name}</h4><p class="text-xs text-slate-400 mt-1">Masa Jabatan: ${off.period}</p></div></div>`;
  });

  const catalog = document.getElementById("umkm-catalog-container");
  const emptyState = document.getElementById("umkm-empty-state");
  catalog.innerHTML = "";
  const filteredUMKMs = state.umkms.filter(
    (u) =>
      u.status === "approved" &&
      (state.currentFilter === "all" || u.category === state.currentFilter),
  );
  if (filteredUMKMs.length === 0) emptyState.classList.remove("hidden");
  else {
    emptyState.classList.add("hidden");
    filteredUMKMs.forEach((umkm) => {
      let certBadgeHtml = "";
      if (umkm.certUrl)
        certBadgeHtml = `<button onclick="openCertViewer('${umkm.certUrl}')" class="absolute top-3 right-3 px-3 py-1 bg-amber-500/95 hover:bg-amber-600 text-white text-[10px] font-bold rounded-full shadow-md backdrop-blur border border-amber-400 flex items-center gap-1 transition-all z-20 hover:scale-105"><i class="fa-solid fa-shield-halved"></i> Terverifikasi Desa</button>`;
      const storeButtons = buildStoreButtons(umkm.storeUrls);
      const waButtonClass = storeButtons ? "flex-1" : "w-full";
      catalog.innerHTML += `<div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all flex flex-col group h-full"><div class="h-48 relative overflow-hidden bg-slate-100 shrink-0"><img src="${umkm.imageUrl}" alt="${umkm.name}" onerror="this.src='https://placehold.co/500x300/10b981/ffffff?text=Produk+UMKM'" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"><span class="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur text-xs font-bold text-slate-800 rounded-full shadow-sm z-10">${umkm.category}</span>${certBadgeHtml}</div><div class="p-5 flex-grow flex flex-col justify-between"><div class="mb-4"><h4 class="text-lg font-bold text-slate-900 group-hover:text-primary-700 transition-all leading-tight">${umkm.name}</h4><div class="flex items-center gap-1.5 mt-1 text-xs text-slate-400 font-medium"><i class="fa-solid fa-user text-[10px] text-slate-300"></i> ${umkm.owner}</div><p class="text-xs text-slate-500 mt-3 line-clamp-3 leading-relaxed">${umkm.desc}</p></div><div class="flex flex-col sm:flex-row gap-2 w-full mt-4">${storeButtons}<a href="https://wa.me/62${umkm.phone}?text=Halo%20${encodeURIComponent(umkm.owner)},%20saya%20tertarik%20dengan%20produk%20*${encodeURIComponent(umkm.name)}*%20yang%20saya%20lihat%20di%20Website%20Resmi%20Desa%20Kerto%20Raharjo.%20Apakah%20bisa%20berdiskusi%20lebih%20lanjut?" target="_blank" class="${waButtonClass} py-3 bg-primary-600 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/5 hover:shadow-lg text-center flex items-center justify-center gap-1.5 transition-all"><i class="fa-brands fa-whatsapp text-lg"></i> WA Penjual</a></div></div></div>`;
    });
  }

  renderAdminDashboard();
}

// ---------- FILTERS ----------
window.filterAgenda = function (status) {
  state.currentAgendaFilter = status;
  document
    .querySelectorAll(".agenda-filter-btn")
    .forEach(
      (b) =>
        (b.className =
          "agenda-filter-btn px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-all bg-white hover:bg-slate-100 text-slate-700"),
    );
  const btn = document.getElementById(`agenda-filter-${status}`);
  if (btn) {
    if (status === "all")
      btn.className =
        "agenda-filter-btn px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-all bg-primary-700 text-white";
    else if (status === "Mendatang")
      btn.className =
        "agenda-filter-btn px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-all bg-blue-600 text-white";
    else if (status === "Berlangsung")
      btn.className =
        "agenda-filter-btn px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-all bg-amber-500 text-white";
    else if (status === "Selesai")
      btn.className =
        "agenda-filter-btn px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-all bg-emerald-600 text-white";
  }
  renderAll();
};
window.filterUMKM = function (category) {
  state.currentFilter = category;
  document
    .querySelectorAll(".category-btn")
    .forEach(
      (b) =>
        (b.className =
          "category-btn px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-all bg-white hover:bg-slate-100 text-slate-700"),
    );
  const btn = document.getElementById(`filter-${category}`);
  if (btn)
    btn.className =
      "category-btn px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-all bg-primary-700 text-white";
  renderAll();
};
window.filterComplaints = function (status) {
  state.currentComplaintFilter = status;
  document
    .querySelectorAll("#complaints-filter button")
    .forEach(
      (b) =>
        (b.className =
          "px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800"),
    );
  const mapper = {
    all: "btn-comp-all",
    "Menunggu Tindakan": "btn-comp-pending",
    "Sedang Diproses": "btn-comp-progress",
    Ditolak: "btn-comp-rejected",
    "Selesai Ditangani": "btn-comp-resolved",
  };
  const btn = document.getElementById(mapper[status]);
  if (btn)
    btn.className = "px-3 py-1.5 rounded-lg bg-white text-slate-800 shadow-sm";
  renderAll();
};

window.switchAdminTab = function (tabId) {
  document
    .querySelectorAll(".admin-tab-content")
    .forEach((c) => c.classList.add("hidden"));
  document.getElementById(`admin-tab-${tabId}`).classList.remove("hidden");
  document
    .querySelectorAll(".admin-tab-btn")
    .forEach(
      (b) =>
        (b.className =
          "admin-tab-btn flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all text-slate-600 hover:bg-slate-50 hover:text-slate-900 w-full"),
    );
  const btn = document.getElementById(`tab-btn-${tabId}`);
  if (btn) {
    if (tabId === "requests")
      btn.className =
        "admin-tab-btn flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all bg-primary-50 text-primary-700 w-full";
    else
      btn.className =
        "admin-tab-btn flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all bg-primary-50 text-primary-700 w-full";
  }
};

// ---------- RENDER ADMIN DASHBOARD ----------
function renderAdminDashboard() {
  if (!state.isAdminAuthenticated) return;
  document.getElementById("edit-kades-name").value = state.kades.name;
  document.getElementById("edit-kades-period").value = state.kades.period;
  document.getElementById("preview-kades-edit").src = state.kades.photo;
  document.getElementById("edit-kades-imageFile").value = "";
  document.getElementById("edit-stat-population").value =
    state.stats.population;
  document.getElementById("edit-stat-partners").value = state.stats.partners;
  document.getElementById("edit-stat-rating").value = state.stats.rating;
  document.getElementById("edit-map-lat").value = state.mapConfig.centerLat;
  document.getElementById("edit-map-lng").value = state.mapConfig.centerLng;
  document.getElementById("edit-map-address").value = state.mapConfig.address;
  document.getElementById("edit-map-north").value =
    state.mapConfig.northBoundary;
  document.getElementById("edit-map-east").value = state.mapConfig.eastBoundary;
  document.getElementById("edit-map-south").value =
    state.mapConfig.southBoundary;
  document.getElementById("edit-map-west").value = state.mapConfig.westBoundary;
  document.getElementById("edit-map-gmaps").value = state.mapConfig.gmapsLink;
  const docBio = new DOMParser().parseFromString(state.kades.bio, "text/html");
  document.getElementById("edit-kades-bio").value = docBio.body.innerText;

  const pendingUMKMs = state.umkms.filter((u) => u.status === "pending");
  const pendingCountEl = document.getElementById("admin-pending-count");
  pendingCountEl.innerText = pendingUMKMs.length;
  pendingCountEl.classList.toggle("hidden", pendingUMKMs.length === 0);

  const pendingBody = document.getElementById("admin-pending-table-body");
  const noRequests = document.getElementById("admin-no-requests");
  pendingBody.innerHTML = "";
  if (pendingUMKMs.length === 0) noRequests.classList.remove("hidden");
  else {
    noRequests.classList.add("hidden");
    pendingUMKMs.forEach((item) => {
      let certHtml = `<span class="text-xs text-slate-400 italic">No Doc</span>`;
      if (item.certUrl)
        certHtml = `<button onclick="openCertViewer('${item.certUrl}')" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200 transition-all"><i class="fa-solid fa-file-shield"></i> Cek Dokumen</button>`;
      let storeHtml = `<span class="text-xs text-slate-400 italic">No Link</span>`;
      if (item.storeUrls && item.storeUrls.length)
        storeHtml = item.storeUrls
          .map(
            (url) =>
              `<a href="${url}" target="_blank" class="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-all"><i class="fa-solid fa-arrow-up-right-from-square"></i>${url.includes("shopee") ? "Shopee" : url.includes("tokopedia") ? "Tokopedia" : url.includes("tiktok") ? "TikTok" : "Toko"}</a>`,
          )
          .join(" ");
      pendingBody.innerHTML += `<tr class="border-b border-slate-100 hover:bg-slate-50 text-sm"><td class="py-4 px-4 font-semibold text-slate-900">${item.name}</td><td class="py-4 px-4"><span class="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded font-semibold">${item.category}</span></td><td class="py-4 px-4"><div class="font-medium text-slate-800">${item.owner}</div><div class="text-xs text-slate-400 font-semibold">+62 ${item.phone}</div></td><td class="py-4 px-4 text-center">${certHtml}</td><td class="py-4 px-4 text-center">${storeHtml}</td><td class="py-4 px-4 text-center"><div class="flex gap-2 justify-center"><button onclick="approveUMKM('${item.id}', true)" class="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all">Setujui</button><button onclick="approveUMKM('${item.id}', false)" class="px-3.5 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all">Tolak</button></div></td></tr>`;
    });
  }

  const approvedUMKMs = state.umkms.filter((u) => u.status === "approved");
  const approvedBody = document.getElementById("admin-approved-table-body");
  const noApproved = document.getElementById("admin-no-approved");
  approvedBody.innerHTML = "";
  if (approvedUMKMs.length === 0) noApproved.classList.remove("hidden");
  else {
    noApproved.classList.add("hidden");
    approvedUMKMs.forEach((item) => {
      let certHtml = `<span class="text-xs text-slate-400 italic">No Doc</span>`;
      if (item.certUrl)
        certHtml = `<button onclick="openCertViewer('${item.certUrl}')" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200 transition-all"><i class="fa-solid fa-file-shield"></i> Lihat Doc</button>`;
      let storeHtml = `<span class="text-xs text-slate-400 italic">No Link</span>`;
      if (item.storeUrls && item.storeUrls.length)
        storeHtml = item.storeUrls
          .map(
            (url) =>
              `<a href="${url}" target="_blank" class="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-all"><i class="fa-solid fa-arrow-up-right-from-square"></i>${url.includes("shopee") ? "Shopee" : url.includes("tokopedia") ? "Tokopedia" : url.includes("tiktok") ? "TikTok" : "Toko"}</a>`,
          )
          .join(" ");
      approvedBody.innerHTML += `<tr class="border-b border-slate-100 hover:bg-slate-50 text-sm"><td class="py-4 px-4 font-semibold text-slate-900">${item.name}</td><td class="py-4 px-4"><span class="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded font-semibold">${item.category}</span></td><td class="py-4 px-4"><div class="font-medium text-slate-800">${item.owner}</div><div class="text-xs text-slate-400 font-semibold">+62 ${item.phone}</div></td><td class="py-4 px-4 text-center">${certHtml}</td><td class="py-4 px-4 text-center">${storeHtml}</td><td class="py-4 px-4 text-right"><button onclick="deleteApprovedUMKM('${item.id}')" class="px-3.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ml-auto"><i class="fa-solid fa-trash-can text-sm"></i> Hapus Usaha</button></td></tr>`;
    });
  }

  const compBody = document.getElementById("admin-complaints-table-body");
  const noComp = document.getElementById("admin-no-complaints");
  if (compBody) {
    compBody.innerHTML = "";
    if (state.complaints.length === 0) noComp.classList.remove("hidden");
    else {
      noComp.classList.add("hidden");
      state.complaints.forEach((item) => {
        let badge = "bg-red-100 text-red-800";
        if (item.status === "Sedang Diproses")
          badge = "bg-amber-100 text-amber-800";
        else if (item.status === "Selesai Ditangani")
          badge = "bg-emerald-100 text-emerald-800";
        const whatsappLink = item.whatsapp
          ? `<a href="https://wa.me/${item.whatsapp.replace(/[^0-9]/g, "")}" target="_blank" class="font-medium text-emerald-700 hover:underline">${item.whatsapp}</a>`
          : "-";
        compBody.innerHTML += `<tr class="border-b border-slate-100 text-sm hover:bg-slate-50/50"><td class="py-3 px-4"><div class="font-semibold text-slate-900 max-w-[200px] truncate" title="${item.title}">${item.title}</div><div class="text-xs text-slate-400 max-w-[200px] truncate">${item.desc}</div></td><td class="py-3 px-4"><span class="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded font-semibold block w-fit mb-1">${item.category}</span><div class="text-xs text-slate-500 max-w-[150px] truncate"><i class="fa-solid fa-location-dot text-red-400"></i> ${item.location}</div></td><td class="py-3 px-4 text-slate-500 font-medium text-xs">${item.date}</td><td class="py-3 px-4 text-slate-600 text-xs">${whatsappLink}</td><td class="py-3 px-4 text-center"><span class="px-2.5 py-0.5 rounded text-xs font-bold ${badge}">${item.status}</span></td><td class="py-3 px-4 text-right"><div class="flex gap-2 justify-end"><button onclick="editComplaintStatus('${item.id}')" class="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-all"><i class="fa-solid fa-headset mr-1"></i> Tindak</button><button onclick="deleteComplaint('${item.id}')" class="text-red-600 hover:text-red-800 text-xs font-bold"><i class="fa-solid fa-trash"></i> Hapus</button></div></td></tr>`;
      });
    }
  }

  const offBody = document.getElementById("admin-officers-table-body");
  offBody.innerHTML = "";
  state.officers.forEach((off) => {
    offBody.innerHTML += `<tr class="border-b border-slate-100 text-sm"><td class="py-3 px-4 font-semibold text-slate-900">${off.name}</td><td class="py-3 px-4 text-slate-600">${off.role}</td><td class="py-3 px-4 text-slate-500">${off.period}</td><td class="py-3 px-4 text-right"><div class="flex gap-2 justify-end"><button onclick="editOfficer('${off.id}')" class="text-blue-600 hover:text-blue-800 text-xs font-bold"><i class="fa-solid fa-pen-to-square"></i> Edit</button><button onclick="deleteOfficer('${off.id}')" class="text-red-600 hover:text-red-800 text-xs font-bold"><i class="fa-solid fa-trash"></i> Hapus</button></div></td></tr>`;
  });

  const ageBody = document.getElementById("admin-agenda-table-body");
  if (ageBody) {
    ageBody.innerHTML = "";
    state.agendas.forEach((item) => {
      let badge = "bg-blue-100 text-blue-800";
      if (item.status === "Berlangsung") badge = "bg-amber-100 text-amber-800";
      else if (item.status === "Selesai")
        badge = "bg-emerald-100 text-emerald-800";
      ageBody.innerHTML += `<tr class="border-b border-slate-100 text-sm"><td class="py-3 px-4 font-semibold text-slate-900 truncate max-w-[200px]" title="${item.title}">${item.title}</td><td class="py-3 px-4"><span class="px-2.5 py-0.5 rounded text-xs font-bold ${badge}">${item.status}</span></td><td class="py-3 px-4"><div class="text-slate-700 font-medium">${item.date}</div><div class="text-xs text-slate-400"><i class="fa-solid fa-location-dot"></i> ${item.location}</div></td><td class="py-3 px-4 text-right"><div class="flex gap-2 justify-end"><button onclick="editAgenda('${item.id}')" class="text-blue-600 hover:text-blue-800 text-xs font-bold"><i class="fa-solid fa-pen-to-square"></i> Edit</button><button onclick="deleteAgenda('${item.id}')" class="text-red-600 hover:text-red-800 text-xs font-bold"><i class="fa-solid fa-trash"></i> Hapus</button></div></td></tr>`;
    });
  }

  const newsBody = document.getElementById("admin-news-table-body");
  if (newsBody) {
    newsBody.innerHTML = "";
    state.news.forEach((item) => {
      newsBody.innerHTML += `<tr class="border-b border-slate-100 text-sm hover:bg-slate-50"><td class="py-4 px-4 font-semibold text-slate-900 truncate max-w-[200px]" title="${item.title}">${item.title}</td><td class="py-4 px-4 text-slate-600">${item.date || "-"}</td><td class="py-4 px-4 text-slate-500 text-xs line-clamp-2">${item.summary || "-"}</td><td class="py-4 px-4 text-right"><div class="flex gap-2 justify-end"><button onclick="editNews('${item.id}')" class="text-blue-600 hover:text-blue-800 text-xs font-bold"><i class="fa-solid fa-pen-to-square"></i> Edit</button><button onclick="deleteNews('${item.id}')" class="text-red-600 hover:text-red-800 text-xs font-bold"><i class="fa-solid fa-trash"></i> Hapus</button></div></td></tr>`;
    });
  }
  renderServiceAdminSections();
}

// ================= HANDLERS (TULIS KE SUPABASE) =================
window.handleServiceUserLogin = async function (e) {
  e.preventDefault();
  if (!supabase) {
    showNotification("Supabase belum dikonfigurasi.", "error");
    return;
  }
  const nik = document.getElementById("service-login-nik").value.trim();
  const password = document.getElementById("service-login-password").value;
  if (!nik || !password) {
    showNotification("Silakan isi NIK dan kata sandi Anda.", "error");
    return;
  }
  try {
    const passwordHash = await hashString(password);
    const { data, error } = await supabase.rpc("verify_service_user", {
      p_nik: nik,
      p_hash: passwordHash,
    });
    if (error) throw error;
    const user = Array.isArray(data) ? data[0] : data;
    if (!user) {
      showNotification("NIK atau kata sandi salah.", "error");
      return;
    }
    state.serviceUser = user;
    state.serviceUserRequests = [];
    document.getElementById("service-login-password").value = "";
    showNotification(
      "Login berhasil. Silakan ajukan permohonan layanan.",
      "success",
    );
    document.getElementById("service-login-panel").classList.add("hidden");
    document.getElementById("service-panel").classList.remove("hidden");
    fillServiceUserFields();
    await loadServiceUserRequests();
  } catch (err) {
    console.error(err);
    showNotification(
      "Gagal masuk. " + (err.message || "Periksa NIK dan kata sandi."),
      "error",
    );
  }
};

window.handleServiceUserLogout = function () {
  state.serviceUser = null;
  state.serviceUserRequests = [];
  document.getElementById("service-login-panel").classList.remove("hidden");
  document.getElementById("service-panel").classList.add("hidden");
  document.getElementById("service-login-nik").value = "";
  document.getElementById("service-login-password").value = "";
  document.getElementById("dtks-address").value = "";
  document.getElementById("dtks-details").value = "";
  document.getElementById("kur-business").value = "";
  document.getElementById("kur-amount").value = "";
  document.getElementById("kur-details").value = "";
  document.getElementById("kur-fund-purpose").value = "";
  document.getElementById("dtks-document").value = "";
  document.getElementById("kur-document").value = "";
  renderServiceRequestHistory();
};

window.handleServiceRequestSubmit = async function (e, requestType) {
  e.preventDefault();
  if (!state.serviceUser) {
    showNotification(
      "Silakan login terlebih dahulu untuk mengajukan permohonan.",
      "error",
    );
    return;
  }
  if (!supabase) {
    showNotification("Supabase belum dikonfigurasi.", "error");
    return;
  }
  const formId =
    requestType === "DTKS" ? "form-service-dtks" : "form-service-kur";
  const form = document.getElementById(formId);
  if (!form) {
    showNotification(
      "Formulir permohonan tidak ditemukan di halaman.",
      "error",
    );
    return;
  }
  // safe element access with null checks
  let title = "";
  let whatsapp = "";
  try {
    if (requestType === "DTKS") {
      title = "Permohonan DTKS";
      const waEl = document.getElementById("dtks-whatsapp");
      whatsapp = waEl && waEl.value ? waEl.value.trim() : "";
    } else {
      const kurBusinessEl = document.getElementById("kur-business");
      const kurBusinessVal =
        kurBusinessEl && kurBusinessEl.value ? kurBusinessEl.value.trim() : "";
      title = `Permohonan KUR - ${kurBusinessVal}`;
      const waEl = document.getElementById("kur-whatsapp");
      whatsapp = waEl && waEl.value ? waEl.value.trim() : "";
    }
  } catch (err) {
    console.error(err);
    showNotification(
      "Gagal membaca data formulir. Pastikan semua field ada.",
      "error",
    );
    return;
  }

  if (!whatsapp) {
    showNotification("Silakan isi nomor WhatsApp pemohon.", "error");
    return;
  }
  if (!title) {
    showNotification("Silakan isi judul permohonan.", "error");
    return;
  }
  if (state.serviceUser && state.serviceUser.whatsapp !== whatsapp) {
    state.serviceUser.whatsapp = whatsapp;
  }
  showConfirmation(
    `Konfirmasi Pengiriman ${requestType}`,
    `Apakah Anda yakin ingin mengirim permohonan ${requestType}?`,
    "submit",
    () => {
      executeServiceRequestSubmit(requestType, whatsapp);
    },
  );
};

window.handleCreateServiceUser = async function (e) {
  e.preventDefault();
  if (!supabase) {
    showNotification("Supabase belum dikonfigurasi.", "error");
    return;
  }
  const nik = document.getElementById("service-user-nik").value.trim();
  const fullName = document
    .getElementById("service-user-fullname")
    .value.trim();
  const whatsapp = document
    .getElementById("service-user-whatsapp")
    .value.trim();
  const password = document.getElementById("service-user-password").value;
  if (!nik || !fullName || !whatsapp || !password) {
    showNotification("Isi semua data akun warga terlebih dahulu.", "error");
    return;
  }
  try {
    const passwordHash = await hashString(password);
    const { error } = await supabase.from("service_users").insert({
      nik,
      full_name: fullName,
      whatsapp,
      password_hash: passwordHash,
    });
    if (error) throw error;
    showNotification("Akun warga berhasil dibuat.", "success");
    document.getElementById("form-service-user-create").reset();
    await loadServiceUsers();
  } catch (err) {
    console.error(err);
    showNotification(
      "Gagal membuat akun warga. " + (err.message || ""),
      "error",
    );
  }
};

window.editServiceRequestStatus = function (id) {
  const item = state.serviceAdminRequests.find((r) => r.id === id);
  if (!item) return;
  document
    .getElementById("service-request-status-form")
    .classList.remove("hidden");
  document.getElementById("edit-service-request-id").value = item.id;
  document.getElementById("service-request-status-select").value = item.status;
  document.getElementById("service-request-whatsapp").value = item.whatsapp;
  document.getElementById("service-request-rejection").value =
    item.rejection_reason || "";
  const docLink = document.getElementById("service-request-doc-link");
  if (docLink) {
    if (item.document_url) {
      docLink.href = item.document_url;
      docLink.innerText = "Lihat dokumen";
      docLink.classList.remove("text-slate-500");
      docLink.classList.add("text-primary-700");
    } else {
      docLink.href = "#";
      docLink.innerText = "Tidak ada dokumen";
      docLink.classList.remove("text-primary-700");
      docLink.classList.add("text-slate-500");
    }
  }
  const payload =
    item.payload && typeof item.payload === "object" ? item.payload : {};
  const type = item.request_type || "-";
  const title = item.title || "-";
  let addressOrBusiness = "-";
  let purpose = "-";
  let amount = "-";
  let fundPurpose = "-";
  if (type === "DTKS") {
    addressOrBusiness = item.address || payload.address || "-";
    purpose = item.details || payload.details || "-";
  } else if (type === "KUR") {
    addressOrBusiness =
      payload.business ||
      item.title.replace(/^Permohonan KUR -\s*/i, "") ||
      "-";
    amount = payload.amount || "-";
    purpose = payload.details || item.details || "-";
    fundPurpose = payload.details || item.details || "-";
  }
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.innerText = value || "-";
  };
  setText("service-request-detail-type", type);
  setText("service-request-detail-title", title);
  setText("service-request-detail-address", addressOrBusiness);
  setText("service-request-detail-purpose", purpose);
  setText("service-request-detail-amount", amount);
  setText("service-request-detail-fund-purpose", fundPurpose);
  toggleServiceRequestRejectionField(item.status);
};

window.closeServiceRequestStatusForm = function () {
  document
    .getElementById("service-request-status-form")
    .classList.add("hidden");
};

window.toggleServiceRequestRejectionField = function (value) {
  const field = document.getElementById("service-request-rejection-field");
  if (!field) return;
  field.classList.toggle("hidden", value !== "Ditolak");
};

window.handleServiceRequestStatusSubmit = async function (e) {
  e.preventDefault();
  if (!supabase) {
    showNotification("Supabase belum dikonfigurasi.", "error");
    return;
  }
  const status = document.getElementById("service-request-status-select").value;
  showConfirmation(
    "Konfirmasi Pembaruan Status Permohonan",
    `Apakah Anda yakin ingin mengubah status permohonan menjadi "${status}"?`,
    "submit",
    () => {
      executeServiceRequestStatusSubmit();
    },
  );
};

async function executeServiceRequestSubmit(requestType, whatsapp) {
  if (!supabase || !state.serviceUser) return;
  try {
    let payload = {};
    // safe retrieval of fields
    let title = "";
    try {
      if (requestType === "DTKS") {
        title = "Permohonan DTKS";
      } else {
        const kurBusinessEl = document.getElementById("kur-business");
        const kurBusinessVal =
          kurBusinessEl && kurBusinessEl.value
            ? kurBusinessEl.value.trim()
            : "";
        title = `Permohonan KUR - ${kurBusinessVal}`;
      }
    } catch (err) {
      console.error(err);
      showNotification("Gagal membaca data formulir (judul).", "error");
      return;
    }

    whatsapp =
      whatsapp || (state.serviceUser && state.serviceUser.whatsapp) || "";
    const documentInput = document.getElementById(
      requestType === "DTKS" ? "dtks-document" : "kur-document",
    );
    if (!documentInput || !documentInput.files || !documentInput.files.length) {
      showNotification("Silakan unggah dokumen pendukung.", "error");
      return;
    }
    const documentUrl = await uploadFile(
      documentInput.files[0],
      "service_requests",
    );
    let address = "";
    let details = "";
    let bankName = "";
    let bankAccount = "";
    if (requestType === "DTKS") {
      const addrEl = document.getElementById("dtks-address");
      const detailsEl = document.getElementById("dtks-details");
      address = addrEl && addrEl.value ? addrEl.value.trim() : "";
      details = detailsEl && detailsEl.value ? detailsEl.value.trim() : "";
      payload = { requestType, address, details };
    } else {
      const businessEl = document.getElementById("kur-business");
      const amountEl = document.getElementById("kur-amount");
      const detailsEl = document.getElementById("kur-details");
      const fundPurposeEl = document.getElementById("kur-fund-purpose");
      const business =
        businessEl && businessEl.value ? businessEl.value.trim() : "";
      const amount = amountEl && amountEl.value ? amountEl.value.trim() : "";
      details = detailsEl && detailsEl.value ? detailsEl.value.trim() : "";
      const fundPurpose =
        fundPurposeEl && fundPurposeEl.value ? fundPurposeEl.value.trim() : "";
      payload = {
        requestType,
        business,
        amount,
        details,
        fund_purpose: fundPurpose,
      };
    }
    const submittedAt = new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const { error } = await supabase.from("service_requests").insert({
      request_type: requestType,
      nik: state.serviceUser.nik,
      full_name: state.serviceUser.full_name,
      whatsapp,
      title,
      address,
      details,
      bank_name: bankName,
      bank_account: bankAccount,
      document_url: documentUrl,
      payload,
      status: "Menunggu Validasi",
      rejection_reason: "",
      submitted_at: submittedAt,
    });
    if (error) throw error;
    showNotification(
      "Permohonan layanan berhasil dikirim. Mohon tunggu validasi admin.",
      "success",
    );
    const fdtks = document.getElementById("form-service-dtks");
    const fkur = document.getElementById("form-service-kur");
    if (fdtks) fdtks.reset();
    if (fkur) fkur.reset();
    await loadServiceUserRequests();
  } catch (err) {
    console.error(err);
    showNotification(
      "Gagal mengirim permohonan. " + (err.message || ""),
      "error",
    );
  }
}

async function executeServiceRequestStatusSubmit() {
  if (!supabase) return;
  const id = document.getElementById("edit-service-request-id").value;
  const status = document.getElementById("service-request-status-select").value;
  const rejectionReason = document
    .getElementById("service-request-rejection")
    .value.trim();
  if (status === "Ditolak" && !rejectionReason) {
    showNotification("Silakan isi alasan penolakan.", "error");
    return;
  }
  try {
    const { error } = await supabase
      .from("service_requests")
      .update({
        status,
        rejection_reason: status === "Ditolak" ? rejectionReason : "",
      })
      .eq("id", id);
    if (error) throw error;
    showNotification("Status permohonan berhasil diperbarui.", "success");
    await loadServiceRequests();
    closeServiceRequestStatusForm();
  } catch (err) {
    console.error(err);
    showNotification(
      "Gagal memperbarui status. " + (err.message || ""),
      "error",
    );
  }
}

async function hashString(value) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function uploadFile(file, folder) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}-${sanitized}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function loadServiceUsers() {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("service_users")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    return;
  }
  state.serviceUsers = data || [];
  renderAdminDashboard();
}

async function loadServiceRequests() {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("service_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    return;
  }
  state.serviceAdminRequests = data || [];
  renderAdminDashboard();
}

async function loadServiceUserRequests() {
  if (!supabase || !state.serviceUser) return;
  const { data, error } = await supabase.rpc("get_service_requests_for_nik", {
    p_nik: state.serviceUser.nik,
  });
  if (error) {
    console.error(error);
    return;
  }
  state.serviceUserRequests = Array.isArray(data) ? data : data ? [data] : [];
  renderServiceRequestHistory();
}

function fillServiceUserFields() {
  if (!state.serviceUser) return;
  const user = state.serviceUser;
  const dtksNik = document.getElementById("dtks-nik");
  const dtksFullname = document.getElementById("dtks-fullname");
  const dtksWhatsapp = document.getElementById("dtks-whatsapp");
  const kurNik = document.getElementById("kur-nik");
  const kurFullname = document.getElementById("kur-fullname");
  const kurWhatsapp = document.getElementById("kur-whatsapp");
  if (dtksNik) dtksNik.value = user.nik || "";
  if (dtksFullname) dtksFullname.value = user.full_name || "";
  if (dtksWhatsapp) dtksWhatsapp.value = user.whatsapp || "";
  if (kurNik) kurNik.value = user.nik || "";
  if (kurFullname) kurFullname.value = user.full_name || "";
  if (kurWhatsapp) kurWhatsapp.value = user.whatsapp || "";
}

function renderServiceRequestHistory() {
  const body = document.getElementById("service-requests-history-body");
  const empty = document.getElementById("service-requests-history-empty");
  if (!body || !empty) return;
  body.innerHTML = "";
  if (!state.serviceUserRequests || state.serviceUserRequests.length === 0) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");
  state.serviceUserRequests.forEach((item) => {
    const reason =
      item.status === "Ditolak" ? item.rejection_reason || "-" : "-";
    body.innerHTML += `<tr class="border-t border-slate-100 text-sm"><td class="py-4 px-4 font-semibold text-slate-900">${item.request_type}</td><td class="py-4 px-4 text-slate-700">${item.title}</td><td class="py-4 px-4 text-slate-500">${item.submitted_at || ""}</td><td class="py-4 px-4 text-slate-600">${item.status}</td><td class="py-4 px-4 text-slate-500">${reason}</td></tr>`;
  });
}

function renderServiceAdminSections() {
  const usersBody = document.getElementById("service-users-table-body");
  const usersEmpty = document.getElementById("service-users-empty");
  if (usersBody) {
    usersBody.innerHTML = "";
    if (!state.serviceUsers || state.serviceUsers.length === 0) {
      usersEmpty.classList.remove("hidden");
    } else {
      usersEmpty.classList.add("hidden");
      state.serviceUsers.forEach((user) => {
        usersBody.innerHTML += `<tr class="border-b border-slate-100 text-sm hover:bg-slate-50"><td class="py-3 px-4 text-slate-800 font-semibold">${user.nik}</td><td class="py-3 px-4 text-slate-600">${user.full_name}</td><td class="py-3 px-4 text-slate-600">${user.whatsapp}</td><td class="py-3 px-4 text-right"><div class=\"flex items-center justify-end gap-2\"><button onclick=\"confirmDeleteServiceUser('${user.nik}')\" class=\"text-red-600 hover:text-red-800 text-xs font-bold\"><i class=\"fa-solid fa-trash\"></i> Hapus</button></div></td></tr>`;
      });
    }
  }
  const requestsBody = document.getElementById("service-requests-table-body");
  const requestsEmpty = document.getElementById("service-requests-empty");
  if (requestsBody) {
    requestsBody.innerHTML = "";
    if (
      !state.serviceAdminRequests ||
      state.serviceAdminRequests.length === 0
    ) {
      requestsEmpty.classList.remove("hidden");
    } else {
      requestsEmpty.classList.add("hidden");
      state.serviceAdminRequests.forEach((item) => {
        const docHtml = item.document_url
          ? `<a href="${item.document_url}" target="_blank" class="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-all"><i class="fa-solid fa-file-lines"></i> Lihat</a>`
          : `<span class="text-xs text-slate-400 italic">Tidak ada</span>`;
        requestsBody.innerHTML += `<tr class="border-b border-slate-100 hover:bg-slate-50 text-sm"><td class="py-3 px-4 font-semibold text-slate-900">${item.request_type}</td><td class="py-3 px-4 text-slate-700">${item.full_name}</td><td class="py-3 px-4 text-slate-600">${item.nik}</td><td class="py-3 px-4 text-slate-600">${item.whatsapp}</td><td class="py-3 px-4 text-slate-700">${docHtml}</td><td class="py-3 px-4 text-slate-700"><span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${item.status === "Disetujui" ? "bg-emerald-100 text-emerald-800" : item.status === "Diproses" ? "bg-amber-100 text-amber-800" : item.status === "Ditolak" ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-700"}">${item.status}</span></td><td class="py-3 px-4 text-right"><div class=\"flex items-center justify-end gap-2\"><button onclick=\"editServiceRequestStatus('${item.id}')\" class=\"px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg transition-all\">Ubah Status</button><button onclick=\"confirmDeleteServiceRequest('${item.id}')\" class=\"text-red-600 hover:text-red-800 text-xs font-bold\"><i class=\"fa-solid fa-trash\"></i> Hapus</button></div></td></tr>`;
      });
    }
  }
}

window.handleUMKMRegistration = async function (e) {
  e.preventDefault();
  const name = document.getElementById("reg-name").value.trim();
  if (!name) {
    showNotification("Silakan isi nama usaha Anda.", "error");
    return;
  }
  showConfirmation(
    "Konfirmasi Pendaftaran UMKM",
    `Apakah Anda yakin ingin mengirim pendaftaran UMKM "${name}"? Data Anda akan diverifikasi oleh Admin Desa.`,
    "submit",
    () => {
      submitUMKMRegistration();
    },
  );
};

window.addStoreUrlField = function () {
  const wrapper = document.getElementById("reg-store-urls-wrapper");
  if (!wrapper) return;
  const field = document.createElement("div");
  field.className = "relative";
  field.innerHTML = `<span class="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400"><i class="fa-solid fa-globe"></i></span><input type="url" class="store-url-input w-full pl-11 pr-12 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="https://shopee.co.id/toko-sumber" /><button type="button" onclick="removeStoreUrlField(this)" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600"><i class="fa-solid fa-xmark"></i></button>`;
  wrapper.appendChild(field);
};

window.removeStoreUrlField = function (button) {
  const row = button.closest("div");
  if (row) row.remove();
  const wrapper = document.getElementById("reg-store-urls-wrapper");
  if (wrapper && wrapper.querySelectorAll(".store-url-input").length === 0)
    window.addStoreUrlField();
};

function clearStoreUrlFields() {
  const wrapper = document.getElementById("reg-store-urls-wrapper");
  if (!wrapper) return;
  wrapper.innerHTML = "";
  window.addStoreUrlField();
}

async function submitUMKMRegistration() {
  const name = document.getElementById("reg-name").value.trim();
  const category = document.getElementById("reg-category").value;
  const owner = document.getElementById("reg-owner").value.trim();
  let phone = document.getElementById("reg-phone").value.trim();
  const fileInput = document.getElementById("reg-imageFile");
  const desc = document.getElementById("reg-desc").value.trim();
  const storeUrls = Array.from(
    document.querySelectorAll("#reg-store-urls-wrapper .store-url-input"),
  )
    .map((input) => input.value.trim())
    .filter(Boolean);
  const certFileInput = document.getElementById("reg-cert-file");
  if (phone.startsWith("0")) phone = phone.substring(1);
  if (!fileInput.files || !fileInput.files.length) {
    showNotification("Silakan pilih dan unggah foto produk Anda.", "error");
    return;
  }
  if (!supabase) {
    showNotification("Supabase belum dikonfigurasi.", "error");
    return;
  }
  showNotification("Mengompresi dan mengunggah berkas...", "info");
  try {
    const imageUrl = await uploadImage(fileInput.files[0], "umkm");
    let certUrl = "";
    if (certFileInput.files && certFileInput.files.length)
      certUrl = await uploadImage(certFileInput.files[0], "certs");
    const { error } = await supabase.from("umkm_list").insert({
      name,
      category,
      owner,
      phone,
      image_url: imageUrl,
      description: desc,
      store_url: storeUrls.length > 0 ? storeUrls[0] : "",
      store_urls: storeUrls,
      cert_url: certUrl,
      status: "pending",
    });
    if (error) throw error;
    showNotification(
      "Sukses! Usaha Anda berhasil didaftarkan. Mohon tunggu verifikasi kelayakan oleh Admin Desa.",
      "success",
    );
    document.getElementById("form-register-umkm").reset();
    clearStoreUrlFields();
    clearUpload("reg-imageFile", "preview-reg-container", "upload-prompt-reg");
    document.getElementById("preview-cert-reg").src =
      "https://placehold.co/100x100/d97706/ffffff?text=Sertifikat";
    await loadUMKMs();
    navigateTo("umkm");
  } catch (err) {
    console.error(err);
    showNotification(
      "Gagal mendaftarkan UMKM. " + (err.message || ""),
      "error",
    );
  }
}

window.handleNewsSubmit = async function (e) {
  e.preventDefault();
  const title = document.getElementById("news-title").value.trim();
  if (!title) {
    showNotification("Silakan isi judul berita.", "error");
    return;
  }
  const id = document.getElementById("edit-news-id").value;
  const actionText = id ? "memperbarui" : "menambahkan";
  showConfirmation(
    `Konfirmasi ${id ? "Pembaruan" : "Penambahan"} Berita`,
    `Apakah Anda yakin ingin ${actionText} berita "${title}"?`,
    "submit",
    () => {
      executeNewsSubmit();
    },
  );
};

window.resetNewsForm = function () {
  document.getElementById("edit-news-id").value = "";
  document.getElementById("news-form-title").innerText = "Tambah Berita Baru";
  document.getElementById("news-title").value = "";
  document.getElementById("news-date").value = "";
  document.getElementById("news-summary").value = "";
  document.getElementById("news-content").value = "";
  document.getElementById("news-image-file").value = "";
};

window.editNews = function (id) {
  const item = state.news.find((n) => n.id === id);
  if (!item) return;
  document.getElementById("edit-news-id").value = item.id;
  document.getElementById("news-form-title").innerText = "Edit Berita Desa";
  document.getElementById("news-title").value = item.title;
  document.getElementById("news-date").value = item.date;
  document.getElementById("news-summary").value = item.summary;
  document.getElementById("news-content").value = item.content;
  document.getElementById("news-image-file").value = "";
  window.scrollTo({
    top: document.getElementById("admin-tab-news-edit").offsetTop - 20,
    behavior: "smooth",
  });
};

window.deleteNews = async function (id) {
  showConfirmation(
    "Konfirmasi Penghapusan Berita",
    "Apakah Anda yakin ingin menghapus berita ini dari daftar publik?",
    "delete",
    () => {
      executeDeleteNews(id);
    },
  );
};

async function executeNewsSubmit() {
  if (!supabase) {
    showNotification("Supabase belum dikonfigurasi.", "error");
    return;
  }
  const id = document.getElementById("edit-news-id").value;
  const title = document.getElementById("news-title").value.trim();
  const date = document.getElementById("news-date").value.trim();
  const summary = document.getElementById("news-summary").value.trim();
  const content = document.getElementById("news-content").value.trim();
  const fileInput = document.getElementById("news-image-file");
  let imageUrl = "";
  if (id) {
    const currentItem = state.news.find((n) => n.id === id);
    if (currentItem) imageUrl = currentItem.imageUrl;
  }
  try {
    if (fileInput.files && fileInput.files.length) {
      showNotification("Mengunggah gambar berita...", "info");
      imageUrl = await uploadImage(fileInput.files[0], "news");
    }
    const payload = {
      title,
      news_date: date,
      summary,
      content,
      image_url: imageUrl,
    };
    if (id) {
      const { error } = await supabase
        .from("news_list")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
      showNotification("Berita desa berhasil diperbarui!", "success");
    } else {
      const { error } = await supabase.from("news_list").insert(payload);
      if (error) throw error;
      showNotification("Berita desa berhasil ditambahkan!", "success");
    }
    resetNewsForm();
    await loadNews();
  } catch (err) {
    console.error(err);
    showNotification("Gagal menyimpan berita. " + (err.message || ""), "error");
  }
}

async function executeDeleteNews(id) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from("news_list").delete().eq("id", id);
    if (error) throw error;
    showNotification("Berita desa berhasil dihapus.", "success");
    await loadNews();
  } catch (err) {
    console.error(err);
    showNotification("Gagal menghapus berita. " + (err.message || ""), "error");
  }
}

window.handleComplaintSubmission = async function (e) {
  e.preventDefault();
  const title = document.getElementById("lap-title").value.trim();
  if (!title) {
    showNotification("Silakan isi judul pengaduan.", "error");
    return;
  }
  showConfirmation(
    "Konfirmasi Pengiriman Laporan",
    `Apakah Anda yakin ingin mengirim laporan pengaduan "${title}"? Laporan akan diterima oleh sistem desa dan diproses oleh Admin Desa.`,
    "submit",
    () => {
      submitComplaintReport();
    },
  );
};

async function submitComplaintReport() {
  const title = document.getElementById("lap-title").value.trim();
  const category = document.getElementById("lap-category").value;
  const location = document.getElementById("lap-location").value.trim();
  const whatsapp = document.getElementById("lap-whatsapp").value.trim();
  const desc = document.getElementById("lap-desc").value.trim();
  const fileInput = document.getElementById("lap-imageFile");
  if (!whatsapp) {
    showNotification(
      "Silakan isi nomor WhatsApp Anda untuk diberi tahu oleh Admin Desa.",
      "error",
    );
    return;
  }
  if (!fileInput.files || !fileInput.files.length) {
    showNotification("Silakan unggah foto bukti fisik kendala Anda.", "error");
    return;
  }
  if (!supabase) {
    showNotification("Supabase belum dikonfigurasi.", "error");
    return;
  }
  showNotification("Mengompresi dan mengunggah foto aduan...", "info");
  try {
    const imageUrl = await uploadImage(fileInput.files[0], "complaints");
    const today = new Date();
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const formattedDate = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
    const { error } = await supabase.from("complaints_list").insert({
      title,
      category,
      location,
      description: desc,
      image_url: imageUrl,
      whatsapp,
      status: "Menunggu Tindakan",
      complaint_date: formattedDate,
      resolution_image_url: "",
      rejection_reason: "",
    });
    if (error) throw error;
    showNotification(
      "Laporan berhasil terkirim ke sistem desa! Mohon pantau status penyelesaian secara real-time.",
      "success",
    );
    document.getElementById("form-lapor-complaint").reset();
    clearUpload("lap-imageFile", "preview-lap-container", "upload-prompt-lap");
    await loadComplaints();
  } catch (err) {
    console.error(err);
    showNotification("Gagal mengirim aduan. " + (err.message || ""), "error");
  }
}

window.approveUMKM = async function (id, isApproved) {
  if (!supabase) return;
  const actionText = isApproved ? "menyetujui" : "menolak";
  showConfirmation(
    `Konfirmasi ${isApproved ? "Persetujuan" : "Penolakan"} UMKM`,
    `Apakah Anda yakin ingin ${actionText} UMKM ini?`,
    "default",
    () => {
      executeApproveUMKM(id, isApproved);
    },
  );
};

async function executeApproveUMKM(id, isApproved) {
  if (!supabase) return;
  try {
    if (isApproved) {
      const { error } = await supabase
        .from("umkm_list")
        .update({ status: "approved" })
        .eq("id", id);
      if (error) throw error;
      showNotification(
        "UMKM Berhasil disetujui untuk dipromosikan!",
        "success",
      );
    } else {
      const { error } = await supabase.from("umkm_list").delete().eq("id", id);
      if (error) throw error;
      showNotification("Pendaftaran UMKM ditolak & dihapus.", "info");
    }
    await loadUMKMs();
  } catch (err) {
    console.error(err);
    showNotification("Gagal memproses. " + (err.message || ""), "error");
  }
}

window.deleteApprovedUMKM = async function (id) {
  showConfirmation(
    "Konfirmasi Penghapusan Produk UMKM",
    "Apakah Anda yakin ingin menghapus produk UMKM ini dari katalog? Aksi ini tidak dapat dibatalkan.",
    "delete",
    () => {
      executeDeleteApprovedUMKM(id);
    },
  );
};

async function executeDeleteApprovedUMKM(id) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from("umkm_list").delete().eq("id", id);
    if (error) throw error;
    showNotification(
      "Produk UMKM berhasil dihapus dari katalog aktif desa.",
      "success",
    );
    await loadUMKMs();
  } catch (err) {
    console.error(err);
    showNotification("Gagal menghapus produk. " + (err.message || ""), "error");
  }
}

// ---------- HAPUS AKUN WARGA & PERMOHONAN (ADMIN) ----------
window.confirmDeleteServiceUser = function (nik) {
  showConfirmation(
    "Konfirmasi Hapus Akun Warga",
    `Apakah Anda yakin ingin menghapus akun warga dengan NIK ${nik}? Aksi ini tidak dapat dibatalkan.`,
    "delete",
    () => {
      executeDeleteServiceUser(nik);
    },
  );
};

window.confirmDeleteServiceRequest = function (id) {
  showConfirmation(
    "Konfirmasi Hapus Permohonan",
    "Apakah Anda yakin ingin menghapus permohonan ini dari sistem?",
    "delete",
    () => {
      executeDeleteServiceRequest(id);
    },
  );
};

async function executeDeleteServiceUser(nik) {
  if (!supabase) {
    showNotification("Supabase belum dikonfigurasi.", "error");
    return;
  }
  try {
    const { error } = await supabase
      .from("service_users")
      .delete()
      .eq("nik", nik);
    if (error) throw error;
    showNotification("Akun warga berhasil dihapus.", "success");
    await loadServiceUsers();
  } catch (err) {
    console.error(err);
    showNotification(
      "Gagal menghapus akun warga. " + (err.message || ""),
      "error",
    );
  }
}

async function executeDeleteServiceRequest(id) {
  if (!supabase) {
    showNotification("Supabase belum dikonfigurasi.", "error");
    return;
  }
  try {
    const { error } = await supabase
      .from("service_requests")
      .delete()
      .eq("id", id);
    if (error) throw error;
    showNotification("Permohonan berhasil dihapus.", "success");
    await loadServiceRequests();
  } catch (err) {
    console.error(err);
    showNotification(
      "Gagal menghapus permohonan. " + (err.message || ""),
      "error",
    );
  }
}

window.handleKadesUpdate = async function (e) {
  e.preventDefault();
  showConfirmation(
    "Konfirmasi Pembaruan Profil Kepala Desa",
    "Apakah Anda yakin ingin memperbarui profil Kepala Desa?",
    "submit",
    () => {
      executeKadesUpdate();
    },
  );
};

async function executeKadesUpdate() {
  if (!supabase) {
    showNotification("Supabase belum dikonfigurasi.", "error");
    return;
  }
  const name = document.getElementById("edit-kades-name").value.trim();
  const period = document.getElementById("edit-kades-period").value.trim();
  const fileInput = document.getElementById("edit-kades-imageFile");
  const bioText = document.getElementById("edit-kades-bio").value.trim();
  const bioHtml = bioText
    .split("\n")
    .filter((p) => p.trim() !== "")
    .map((p) => `<p class="mb-4">${p}</p>`)
    .join("");
  let photo = state.kades.photo;
  try {
    if (fileInput.files && fileInput.files.length) {
      showNotification("Memproses foto baru Kepala Desa...", "info");
      photo = await uploadImage(fileInput.files[0], "kades");
    }
    const updatedKades = { name, period, photo, bio: bioHtml };
    const { error } = await supabase
      .from("village_config")
      .upsert({ section: "kades", data: updatedKades });
    if (error) throw error;
    state.kades = updatedKades;
    showNotification("Profil Kepala Desa berhasil diperbarui!", "success");
    renderAll();
  } catch (err) {
    console.error(err);
    showNotification(
      "Gagal memperbarui profil. " + (err.message || ""),
      "error",
    );
  }
}

window.handleStatsUpdate = async function (e) {
  e.preventDefault();
  showConfirmation(
    "Konfirmasi Pembaruan Statistik Desa",
    "Apakah Anda yakin ingin memperbarui data statistik desa?",
    "submit",
    () => {
      executeStatsUpdate();
    },
  );
};

async function executeStatsUpdate() {
  if (!supabase) {
    showNotification("Supabase belum dikonfigurasi.", "error");
    return;
  }
  const updatedStats = {
    population: document.getElementById("edit-stat-population").value.trim(),
    partners: document.getElementById("edit-stat-partners").value.trim(),
    rating: document.getElementById("edit-stat-rating").value.trim(),
  };
  try {
    const { error } = await supabase
      .from("village_config")
      .upsert({ section: "stats", data: updatedStats });
    if (error) throw error;
    state.stats = updatedStats;
    showNotification("Statistik Desa berhasil diperbarui!", "success");
    renderAll();
  } catch (err) {
    console.error(err);
    showNotification(
      "Gagal memperbarui statistik. " + (err.message || ""),
      "error",
    );
  }
}

window.handleMapConfigUpdate = async function (e) {
  e.preventDefault();
  showConfirmation(
    "Konfirmasi Pembaruan Data Peta & Teritorial",
    "Apakah Anda yakin ingin memperbarui konfigurasi peta dan batas wilayah desa?",
    "submit",
    () => {
      executeMapConfigUpdate();
    },
  );
};

async function executeMapConfigUpdate() {
  if (!supabase) {
    showNotification("Supabase belum dikonfigurasi.", "error");
    return;
  }
  const updatedMapConfig = {
    centerLat: parseFloat(document.getElementById("edit-map-lat").value),
    centerLng: parseFloat(document.getElementById("edit-map-lng").value),
    address: document.getElementById("edit-map-address").value.trim(),
    northBoundary: document.getElementById("edit-map-north").value.trim(),
    eastBoundary: document.getElementById("edit-map-east").value.trim(),
    southBoundary: document.getElementById("edit-map-south").value.trim(),
    westBoundary: document.getElementById("edit-map-west").value.trim(),
    gmapsLink: document.getElementById("edit-map-gmaps").value.trim(),
  };
  try {
    const { error } = await supabase
      .from("village_config")
      .upsert({ section: "map", data: updatedMapConfig });
    if (error) throw error;
    state.mapConfig = updatedMapConfig;
    showNotification("Data Peta & Teritorial berhasil diperbarui!", "success");
    renderAll();
    if (state.currentTab === "wilayah") updateMapMarkerAndBoundary();
  } catch (err) {
    console.error(err);
    showNotification("Gagal memperbarui peta. " + (err.message || ""), "error");
  }
}

// ---- AGENDA ----
window.openAddAgendaForm = function () {
  document.getElementById("agenda-form-container").classList.remove("hidden");
  document.getElementById("agenda-form-title").innerText =
    "Tambah Kegiatan Baru";
  document.getElementById("edit-agenda-id").value = "";
  document.getElementById("age-title").value = "";
  document.getElementById("age-status").value = "Mendatang";
  document.getElementById("age-date").value = "";
  document.getElementById("age-time").value = "";
  document.getElementById("age-location").value = "";
  document.getElementById("age-desc").value = "";
  document.getElementById("age-imageFile").value = "";
  document.getElementById("preview-agenda-gallery").innerHTML = "";
};
window.closeAgendaForm = function () {
  document.getElementById("agenda-form-container").classList.add("hidden");
};
window.editAgenda = function (id) {
  const item = state.agendas.find((a) => a.id === id);
  if (!item) return;
  document.getElementById("agenda-form-container").classList.remove("hidden");
  document.getElementById("agenda-form-title").innerText =
    "Edit Agenda / Dokumentasi";
  document.getElementById("edit-agenda-id").value = item.id;
  document.getElementById("age-title").value = item.title;
  document.getElementById("age-status").value = item.status;
  document.getElementById("age-date").value = item.date;
  document.getElementById("age-time").value = item.time;
  document.getElementById("age-location").value = item.location;
  document.getElementById("age-desc").value = item.desc;
  document.getElementById("age-imageFile").value = "";
  renderAgendaPreviewGallery(item.imageUrls);
};
window.deleteAgenda = async function (id) {
  showConfirmation(
    "Konfirmasi Penghapusan Agenda",
    "Apakah Anda yakin ingin menghapus agenda ini dari sistem? Aksi ini tidak dapat dibatalkan.",
    "delete",
    () => {
      executeDeleteAgenda(id);
    },
  );
};

async function executeDeleteAgenda(id) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from("agenda_list").delete().eq("id", id);
    if (error) throw error;
    showNotification("Agenda berhasil dihapus dari sistem.", "success");
    await loadAgendas();
  } catch (err) {
    console.error(err);
    showNotification("Gagal menghapus agenda. " + (err.message || ""), "error");
  }
}
window.handleAgendaSubmit = async function (e) {
  e.preventDefault();
  const title = document.getElementById("age-title").value.trim();
  if (!title) {
    showNotification("Silakan isi judul agenda.", "error");
    return;
  }
  const id = document.getElementById("edit-agenda-id").value;
  const actionText = id ? "memperbarui" : "membuat";
  showConfirmation(
    `Konfirmasi ${id ? "Pembaruan" : "Pembuatan"} Agenda`,
    `Apakah Anda yakin ingin ${actionText} agenda "${title}"?`,
    "submit",
    () => {
      executeAgendaSubmit();
    },
  );
};

async function executeAgendaSubmit() {
  if (!supabase) {
    showNotification("Supabase belum dikonfigurasi.", "error");
    return;
  }
  const id = document.getElementById("edit-agenda-id").value;
  const title = document.getElementById("age-title").value.trim();
  const status = document.getElementById("age-status").value;
  const date = document.getElementById("age-date").value.trim();
  const time = document.getElementById("age-time").value.trim();
  const location = document.getElementById("age-location").value.trim();
  const desc = document.getElementById("age-desc").value.trim();
  const fileInput = document.getElementById("age-imageFile");
  let imageUrls = [];
  if (id) {
    const cur = state.agendas.find((a) => a.id === id);
    if (cur) imageUrls = [...cur.imageUrls];
  }
  try {
    if (fileInput.files && fileInput.files.length) {
      showNotification("Mengompresi foto kegiatan...", "info");
      const uploads = await Promise.all(
        Array.from(fileInput.files).map((file) => uploadImage(file, "agenda")),
      );
      imageUrls = uploads;
    }
    const row = {
      title,
      status,
      event_date: date,
      event_time: time,
      location,
      description: desc,
      image_url: imageUrls.length > 0 ? imageUrls[0] : "",
      image_urls: imageUrls,
    };
    if (id) {
      const { error } = await supabase
        .from("agenda_list")
        .update(row)
        .eq("id", id);
      if (error) throw error;
      showNotification("Agenda kegiatan berhasil diperbarui!", "success");
    } else {
      const { error } = await supabase.from("agenda_list").insert(row);
      if (error) throw error;
      showNotification("Agenda baru berhasil dipublikasikan!", "success");
    }
    await loadAgendas();
    closeAgendaForm();
  } catch (err) {
    console.error(err);
    showNotification("Gagal menyimpan agenda. " + (err.message || ""), "error");
  }
}

// ---- COMPLAINTS (ADMIN) ----
window.editComplaintStatus = function (id) {
  const item = state.complaints.find((c) => c.id === id);
  if (!item) return;
  document.getElementById("complaint-status-form").classList.remove("hidden");
  document.getElementById("edit-complaint-id").value = item.id;
  document.getElementById("comp-status-select").value = item.status;
  toggleResolutionPhotoInput(item.status);
  document.getElementById("comp-resolutionFile").value = "";
  document.getElementById("preview-comp-resolution").src =
    item.resolutionImageUrl || "https://placehold.co/100x100?text=Bukti";
};
window.toggleResolutionPhotoInput = function (val) {
  const resolutionField = document.getElementById("resolution-photo-field");
  const rejectionField = document.getElementById("rejection-reason-field");
  if (val === "Selesai Ditangani") {
    resolutionField.classList.remove("hidden");
    rejectionField.classList.add("hidden");
  } else if (val === "Ditolak") {
    rejectionField.classList.remove("hidden");
    resolutionField.classList.add("hidden");
  } else {
    resolutionField.classList.add("hidden");
    rejectionField.classList.add("hidden");
  }
};
window.closeComplaintStatusForm = function () {
  document.getElementById("complaint-status-form").classList.add("hidden");
};
window.handleComplaintStatusSubmit = async function (e) {
  e.preventDefault();
  if (!supabase) {
    showNotification("Supabase belum dikonfigurasi.", "error");
    return;
  }
  const status = document.getElementById("comp-status-select").value;
  showConfirmation(
    "Konfirmasi Pembaruan Status Pengaduan",
    `Apakah Anda yakin ingin mengubah status pengaduan menjadi "${status}"?`,
    "submit",
    () => {
      executeComplaintStatusSubmit();
    },
  );
};

async function executeComplaintStatusSubmit() {
  if (!supabase) {
    showNotification("Supabase belum dikonfigurasi.", "error");
    return;
  }
  const id = document.getElementById("edit-complaint-id").value;
  const status = document.getElementById("comp-status-select").value;
  const fileInput = document.getElementById("comp-resolutionFile");
  const rejectionReason = document
    .getElementById("comp-rejection-reason")
    .value.trim();
  const currentItem = state.complaints.find((c) => c.id === id);
  if (!currentItem) return;
  let resolutionImageUrl = currentItem.resolutionImageUrl || "";
  let reasonValue = currentItem.rejectionReason || "";
  try {
    if (
      status === "Selesai Ditangani" &&
      fileInput.files &&
      fileInput.files.length
    ) {
      showNotification("Mengompresi foto bukti penyelesaian...", "info");
      resolutionImageUrl = await uploadImage(fileInput.files[0], "resolutions");
      reasonValue = "";
    } else if (status === "Ditolak") {
      reasonValue = rejectionReason;
      if (!reasonValue) {
        showNotification(
          "Silakan isi alasan penolakan agar pelapor memahami keputusan.",
          "error",
        );
        return;
      }
      resolutionImageUrl = "";
    } else {
      resolutionImageUrl = currentItem.resolutionImageUrl || "";
      reasonValue = "";
    }
    const { error } = await supabase
      .from("complaints_list")
      .update({
        status,
        resolution_image_url: resolutionImageUrl,
        rejection_reason: reasonValue,
      })
      .eq("id", id);
    if (error) throw error;
    showNotification("Status pengaduan warga berhasil diperbarui!", "success");
    await loadComplaints();
    closeComplaintStatusForm();
  } catch (err) {
    console.error(err);
    showNotification(
      "Gagal memperbarui status. " + (err.message || ""),
      "error",
    );
  }
}

window.deleteComplaint = async function (id) {
  showConfirmation(
    "Konfirmasi Penghapusan Pengaduan",
    "Apakah Anda yakin ingin menghapus laporan pengaduan ini dari sistem? Aksi ini tidak dapat dibatalkan.",
    "delete",
    () => {
      executeDeleteComplaint(id);
    },
  );
};

async function executeDeleteComplaint(id) {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from("complaints_list")
      .delete()
      .eq("id", id);
    if (error) throw error;
    showNotification("Laporan pengaduan berhasil dihapus.", "success");
    await loadComplaints();
  } catch (err) {
    console.error(err);
    showNotification("Gagal menghapus aduan. " + (err.message || ""), "error");
  }
}

// ---- OFFICERS ----
window.openAddOfficerForm = function () {
  document.getElementById("officer-form-container").classList.remove("hidden");
  document.getElementById("officer-form-title").innerText =
    "Tambah Aparatur Baru";
  document.getElementById("edit-officer-id").value = "";
  document.getElementById("off-name").value = "";
  document.getElementById("off-role").value = "";
  document.getElementById("off-period").value = "";
  document.getElementById("off-imageFile").value = "";
  document.getElementById("preview-officer-edit").src =
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80";
};
window.closeOfficerForm = function () {
  document.getElementById("officer-form-container").classList.add("hidden");
};
window.editOfficer = function (id) {
  const off = state.officers.find((o) => o.id === id);
  if (!off) return;
  document.getElementById("officer-form-container").classList.remove("hidden");
  document.getElementById("officer-form-title").innerText =
    "Edit Struktur Aparatur";
  document.getElementById("edit-officer-id").value = off.id;
  document.getElementById("off-name").value = off.name;
  document.getElementById("off-role").value = off.role;
  document.getElementById("off-period").value = off.period;
  document.getElementById("off-imageFile").value = "";
  document.getElementById("preview-officer-edit").src = off.photo;
};
window.deleteOfficer = async function (id) {
  showConfirmation(
    "Konfirmasi Penghapusan Aparatur",
    "Apakah Anda yakin ingin menghapus data aparatur ini dari sistem? Aksi ini tidak dapat dibatalkan.",
    "delete",
    () => {
      executeDeleteOfficer(id);
    },
  );
};

async function executeDeleteOfficer(id) {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from("officers_list")
      .delete()
      .eq("id", id);
    if (error) throw error;
    showNotification("Aparatur berhasil dihapus dari sistem.", "success");
    await loadOfficers();
  } catch (err) {
    console.error(err);
    showNotification(
      "Gagal menghapus aparatur. " + (err.message || ""),
      "error",
    );
  }
}

window.handleOfficerSubmit = async function (e) {
  e.preventDefault();
  const name = document.getElementById("off-name").value.trim();
  if (!name) {
    showNotification("Silakan isi nama aparatur.", "error");
    return;
  }
  const id = document.getElementById("edit-officer-id").value;
  const actionText = id ? "memperbarui" : "menambahkan";
  showConfirmation(
    `Konfirmasi ${id ? "Pembaruan" : "Penambahan"} Aparatur`,
    `Apakah Anda yakin ingin ${actionText} data aparatur "${name}"?`,
    "submit",
    () => {
      executeOfficerSubmit();
    },
  );
};

async function executeOfficerSubmit() {
  if (!supabase) {
    showNotification("Supabase belum dikonfigurasi.", "error");
    return;
  }
  const id = document.getElementById("edit-officer-id").value;
  const name = document.getElementById("off-name").value.trim();
  const role = document.getElementById("off-role").value.trim();
  const period = document.getElementById("off-period").value.trim();
  const fileInput = document.getElementById("off-imageFile");
  let photo =
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80";
  if (id) {
    const cur = state.officers.find((o) => o.id === id);
    if (cur) photo = cur.photo;
  }
  try {
    if (fileInput.files && fileInput.files.length) {
      showNotification("Memproses foto staf...", "info");
      photo = await uploadImage(fileInput.files[0], "officers");
    }
    const data = { name, role, period, photo };
    if (id) {
      const { error } = await supabase
        .from("officers_list")
        .update(data)
        .eq("id", id);
      if (error) throw error;
      showNotification("Data aparatur berhasil diperbarui!", "success");
    } else {
      const { error } = await supabase.from("officers_list").insert(data);
      if (error) throw error;
      showNotification("Aparatur baru sukses ditambahkan!", "success");
    }
    await loadOfficers();
    closeOfficerForm();
  } catch (err) {
    console.error(err);
    showNotification(
      "Gagal menyimpan aparatur. " + (err.message || ""),
      "error",
    );
  }
}

// ---------- BOOTSTRAP ----------
window.onload = function () {
  initApp();
};
