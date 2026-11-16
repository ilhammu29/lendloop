"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import CategoryIcon from "../components/CategoryIcon";
import {
  Wrench,
  ShieldCheck,
  Clock,
  Lock,
  Search,
  Check,
  X,
} from "lucide-react";

export default function PublicLandingPage() {
  const { isSignedIn } = useUser();
  const publicTools = useQuery(api.tools?.listPublicTools || ({} as any));
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "All",
    "Power Tools",
    "Gardening",
    "Lawn Care",
    "Hand Tools",
    "Cleaning",
    "Automotive",
    "Other",
  ];

  const filteredTools = (publicTools || []).filter((tool: any) => {
    const matchesCategory =
      selectedCategory === "All" || tool.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900">
      {/* Hero Section */}
      <section className="border-b border-slate-200/80 bg-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950 leading-[1.12]">
                Pinjam alat tetangga.
                <span className="block text-slate-500 font-normal mt-1 text-3xl sm:text-4xl lg:text-5xl">
                  Bagikan apa yang tersimpan di garasi.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                LendLoop mengorganisir peminjaman perkakas dan perlengkapan rumah
                tangga antar warga sekitar. Dilengkapi perlindungan privasi data
                dan pengingat pengembalian otomatis berjadwal.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {isSignedIn ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                  >
                    Buka Gudang Komunitas
                  </Link>
                ) : (
                  <SignInButton mode="modal">
                    <button className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                      Masuk & Pinjam Alat
                    </button>
                  </SignInButton>
                )}

                <a
                  href="#katalog"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 transition-colors"
                >
                  Lihat Inventaris Publik
                </a>
              </div>
            </div>

            {/* Right Column: Architectural Highlights Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-6 space-y-5">
                <div className="border-b border-slate-200 pb-3.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Spesifikasi Keamanan & Privasi
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Standar keandalan untuk ekosistem pinjam-meminjam warga
                  </p>
                </div>

                <div className="space-y-4 text-xs text-slate-700">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-md bg-emerald-100/80 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        Data Minimization Publik
                      </span>
                      <span className="text-slate-500 text-[11px] leading-normal">
                        Katalog terbuka hanya menampilkan nama dan kategori alat.
                        Identitas dan nomor kontak pemilik disembunyikan hingga
                        peminjaman disetujui.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        Otomasi Pengingat n8n
                      </span>
                      <span className="text-slate-500 text-[11px] leading-normal">
                        Cron harian mendeteksi pinjaman jatuh tempo dan
                        mengirimkan pengingat sopan berjadwal dengan proteksi
                        kunci idempoten.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        Tanda Tangan Kriptografis HMAC-SHA256
                      </span>
                      <span className="text-slate-500 text-[11px] leading-normal">
                        Seluruh interaksi antar-layanan Convex dan webhook n8n
                        divalidasi secara kriptografis menggunakan algoritma
                        constant-time.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Public Catalog Section */}
      <section id="katalog" className="py-14 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-950 tracking-tight">
              Katalog Alat Komunitas
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Inventaris publik dengan proteksi privasi. Masuk ke akun Anda untuk
              melihat foto detail, memeriksa reputasi pemilik, dan mengajukan
              peminjaman.
            </p>
          </div>

          {!isSignedIn && (
            <SignInButton mode="modal">
              <button className="self-start md:self-auto text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors">
                Masuk untuk meminjam alat
              </button>
            </SignInButton>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white font-semibold"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {cat === "All" ? "Semua Kategori" : cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari alat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
            />
          </div>
        </div>

        {/* Catalog Grid */}
        {publicTools === undefined ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-40 bg-white border border-slate-200/90 rounded-xl p-5 space-y-3 animate-pulse"
              >
                <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                <div className="h-5 bg-slate-100 rounded w-2/3"></div>
                <div className="h-8 bg-slate-50 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-xl border border-dashed border-slate-300 p-8 space-y-3">
            <Wrench className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">
              {publicTools.length === 0
                ? "Belum ada alat yang terdaftar"
                : "Tidak ada alat yang cocok dengan filter"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {publicTools.length === 0
                ? "Daftarkan alat pertama Anda untuk memulai sirkulasi peralatan di lingkungan tetangga."
                : "Coba ubah kata kunci pencarian atau pilih kategori lain."}
            </p>
            {publicTools.length === 0 && (
              <div className="pt-1">
                <SignInButton mode="modal">
                  <button className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition-colors">
                    Daftarkan Alat Baru
                  </button>
                </SignInButton>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool: any) => (
              <div
                key={tool._id}
                className="bg-white border border-slate-200/90 rounded-xl p-5 hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <CategoryIcon category={tool.category} size="md" />
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      Tersedia
                    </span>
                  </div>

                  <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    {tool.category}
                  </span>
                  <h3 className="text-base font-semibold text-slate-900 mt-0.5">
                    {tool.name}
                  </h3>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Identitas terlindungi
                  </span>

                  {isSignedIn ? (
                    <Link
                      href="/dashboard"
                      className="font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
                    >
                      Ajukan Pinjam
                    </Link>
                  ) : (
                    <SignInButton mode="modal">
                      <button className="font-medium text-emerald-700 hover:text-emerald-800 transition-colors">
                        Ajukan Pinjam
                      </button>
                    </SignInButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Problem & Solution Comparison Section */}
      <section className="border-t border-slate-200/80 bg-white py-14 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl font-bold text-slate-950 tracking-tight">
              Mengapa Berbagi Alat Membutuhkan Sistem yang Terstruktur?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Perbandingan antara meminjam via grup obrolan informal dengan
              menggunakan platform terotomasi LendLoop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Chat Group Frustrations */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-rose-700 text-xs font-semibold uppercase tracking-wider">
                <X className="w-4 h-4" />
                Grup WhatsApp / Facebook RT
              </div>

              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold mt-0.5">•</span>
                  <span>
                    <strong className="text-slate-800">Kebocoran Privasi:</strong> Nomor telepon dan alamat
                    rumah tersebar terbuka ke seluruh anggota grup.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold mt-0.5">•</span>
                  <span>
                    <strong className="text-slate-800">Status Terlupakan:</strong> Riwayat peminjaman tenggelam
                    oleh obrolan harian lainnya dan sering tidak tercatat.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold mt-0.5">•</span>
                  <span>
                    <strong className="text-slate-800">Canggung Menagih:</strong> Pemilik merasa tidak enak
                    hati meminta kembali barang yang sudah lewat masa pinjam.
                  </span>
                </li>
              </ul>
            </div>

            {/* Right: LendLoop Approach */}
            <div className="bg-emerald-50/40 border border-emerald-200/90 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
                <Check className="w-4 h-4" />
                Pendekatan LendLoop
              </div>

              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold mt-0.5">•</span>
                  <span>
                    <strong className="text-slate-900">Zero-Trust RBAC:</strong> Kontak dan alamat pemilik hanya
                    diberikan kepada peminjam yang disetujui untuk masa pinjam aktif.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold mt-0.5">•</span>
                  <span>
                    <strong className="text-slate-900">Status Terpantau Real-time:</strong> Pelacakan 4
                    tahap (Diajukan, Disetujui, Sedang Dipakai, Dikembalikan).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold mt-0.5">•</span>
                  <span>
                    <strong className="text-slate-900">Pengingat Otomatis n8n:</strong> Sistem mengirimkan
                    pengingat sopan berjadwal dengan proteksi anti-spam idempoten.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
