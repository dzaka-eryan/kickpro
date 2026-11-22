


> **Platform Otomasi Event Mabar, Kas Komunitas & Hub Sparring Sepak Bola / Mini Soccer / Futsal**
## 1. Ringkasan Eksekutif & Value Proposition

KickPro dirancang untuk memecahkan dua masalah inti komunitas sepak bola amatir di Indonesia:

1. **Inefisiensi Operasional Admin Komunitas:** Menggantikan kebiasaan manual di WhatsApp (rekap daftar nama, cek mutasi bank bukti transfer, menambal kas akibat pembatalan sepihak, dan pembukuan kas tim).
2. **Ketiadaan Hub Sparring Terpercaya:** Menggantikan pencarian lawan tanding via broadcast acak dengan papan pencarian lawan yang memiliki kepastian jadwal, pembagian biaya sewa (_split bill_), dan sistem proteksi deposit (_escrow_ anti-ghosting).
3. **Membuat Kompetisi Antar Komunitas:** Membuat liga antar komunitas secara digital, membuat slot liga antar komunitas 
    

KickPro Komunitas ketika open mabar harus memesan dan mengamankan jadwal lapangan terlebih dahulu jika belum ada lapangan di kickpro bisa juga secara mandiri tapi harus ada bukti sudah memesan lapangan, dan menggunakan KickPro sebagai platform pengelolaan slot pemain, pencarian lawan tanding, transaksi otomatis, dan pembukuan kas.

## 2. Struktur Peran Pengguna (Dual-Role Architecture)

```
                            ┌─────────────────────────────────┐
                            │             KICKPRO             │
                            └────────────────┬────────────────┘
                                             │
             ┌───────────────────────────────┴───────────────────────────────┐
             ▼                                                               ▼
   [ ROLE 1: PLAYER MODE ]                                       [ ROLE 2: CLUB / HOST MODE ]
(Pemain Lepas / Anggota Komunitas)                             (Admin / Kapten / Bendahara Tim)
             │                                                               │
  ├── Jelajah Event Mabar / Open Play                           ├── Kelola & Terbitkan Event Otomatis
  ├── Cari & Gabung Komunitas                                   ├── Cari Lawan (Sparring Matchmaker)
  ├── Kartu Statistik & Profil Pemain                           ├── Manajemen Roster & Anggota
  ├── Reservasi & Auto-Lock Slot                                ├── Dompet Tim & Cashflow Management
  └── Tiket Digital & QR Kehadiran                              └── Smart WhatsApp Generator & Rekap

```

## 3. Spesifikasi Fitur Detail

### A. Modul Player (Pemain & Anggota)

#### 1. Eksplorasi Event Mabar (Open Play)
- **Feed & Filter:** Cari jadwal main terdekat berdasarkan geolokasi/radius, tipe olahraga (Mini Soccer, Futsal, Sepak Bola Lapangan Besar), tanggal/jam, dan rentang biaya patungan.
- **Kategori & Level:** Filter level kompetisi (_Beginner Friendly_, _Fun Play_, _Competitive_).
- **Live Slot Indicator:** Visualisasi kapasitas slot terisi dan slot kosong secara real-time.
#### 2. Reservasi Slot & Pembayaran Otomatis
- **Pemilihan Slot/Posisi:** Pemain dapat memilih nomor slot atau preferensi posisi (Kiper, Bek, Gelandang, Penyerang).
- **Auto-Lock Slot (Countdown Timer):** Slot terkunci selama 10 menit saat pemain masuk ke tahap checkout agar tidak diserobot pengguna lain.
- **Payment Gateway Instan:** Mendukung QRIS, GoPay, OVO, ShopeePay, dan Virtual Account (BCA, Mandiri, BRI, BNI) dengan verifikasi otomatis tanpa unggah bukti transfer.
#### 3. Direktori Komunitas
- Jelajahi profil komunitas di sekitar kota domisili.
- Melihat jadwal rutin mingguan, galeri kegiatan, visi komunitas, dan mengajukan permintaan bergabung (_Join Request_).
#### 4. Profil Pemain & Statistik (Player Card)
- **Kartu Profil Digital:** Posisi dominan, kaki terkuat (_Left/Right_), nomor punggung favorit.
- **Rekam Jejak:** Riwayat mabar yang diikuti, jam terbang bermain, dan penghargaan MVP sesi.
- **Indeks Disiplin (Attendance Score):** Metrik kehadiran berbasis persentase untuk mencegah pembatalan sepihak (_anti-ghosting_).
    
### B. Modul Komunitas (Club / Host Mode)

#### 1. Manajemen Event Mabar (Otomasi WhatsApp)
- **Event Creator:** Form input cepat detail sesi (venue, tanggal, jam, kuota pemain, iuran per orang) Setiap pemain akan di bagi ke dalam beberapa tim, jumlah slot pemain akan mengikutin berapa tim yang akan di buat.    
- **Presensi Otomatis:** Daftar nama peserta yang sudah menyelesaikan transaksi langsung tercatat rapi tanpa verifikasi mutasi bank manual.
#### 2. Modul Sparring (Pengganti Fitur Cari Lapangan)

_Fokus mempertemukan dua tim secara adil, terjadwal, dan aman dari pembatalan sepihak._
##### a. Buka Tantangan (Host Match)
- Komunitas yang sudah memegang lapangan mempublikasikan jadwal sparring ke papan komunitas.
- Pengaturan format: 7v7, 8v8, atau 11v11; ketersediaan wasit dan fotografer dokumentasi.
- **Skema Patungan Sewa:** Pilihan pembagian biaya sewa lapangan (misal: 50% Tim Tuan Rumah : 50% Tim Penantang).
##### b. Papan Tantangan (Sparring Board)
- Daftar tim yang sedang mencari lawan tanding diurutkan berdasarkan wilayah dan tanggal.
- Tim penantang dapat melihat rekam jejak, rata-rata usia, dan level bermain tim tuan rumah sebelum menekan tombol **"Ajukan Tanding"**.
##### c. Sistem Escrow & Proteksi Pembatalan (Anti-Ghosting)
- Match berstatus _Confirmed_ hanya jika kedua kapten menyetujui jadwal dan regulasi.
- Kedua tim menyetorkan biaya sewa patungan ke saldo penampungan (_escrow_) KickPro.
- Jika ada tim yang membatalkan pertandingan secara sepihak di bawah batasan waktu yang ditentukan (misal H-1), deposit tim tersebut otomatis dicairkan ke tim lawan sebagai ganti rugi sewa lapangan.
- **Pasca Laga:** Input konfirmasi skor santai dan penilaian sportivitas antartim (_Fair Play Rating_).
#### 3. Cashflow & Kas Komunitas (Financial Ledger)
- **Team Digital Wallet:** Saldo hasil iuran mabar atau komitmen sparring otomatis terkumpul di dompet digital komunitas.
- **Buku Kas Masuk & Keluar:** Catatan pengeluaran operasional (pembelian bola, rompi, air mineral, sewa wasit/fotografer) yang transparan bagi seluruh anggota tim.
- **Pencairan Saldo (Payout/Disbursement):** Penarikan dana kas ke rekening bank pengurus/bendahara tim.
    
#### 4. Manajemen Anggota & Roster
- Pengelolaan daftar anggota aktif komunitas.
- Pembagian peran: _Head Admin_ (Ketua), _Treasurer_ (Bendahara kas), dan _Event Host_ (Koordinator lapangan).
    
## 4. Alur Kerja Sistem (System Flows)

### Flow 1: Pendaftaran Mabar & Pembayaran Otomatis

```
[Admin Komunitas] ──► Buat Event Mabar di KickPro
                            │
                            ▼
               Generate Link Page & Template WA
                            │
                            ▼
               Share link ke Grup WhatsApp
                            │
                            ▼
[Pemain / Peserta] ──► Buka Web Link (Mobile View)
                            │
                            ▼
                    Pilih Slot Posisi & Tim
                            │
                            ▼
             Slot Terkunci (Timer 10 Menit)
                            │
                            ▼
             Bayar via QRIS / E-Wallet
                            │
                            ▼
              Webhook Payment Sukses
                            │
       ┌────────────────────┴────────────────────┐
       ▼                                         ▼
Slot Status: "PAID"                     Saldo Masuk ke Kas
Nama Masuk Presensi Otomatis            Dompet Komunitas

```

### Flow 2: Pencarian Lawan & Matchmaking Sparring

```
[Komunitas A (Host)] ──► Upload Jadwal Lapangan yang Sudah Dipesan
                               │
                               ▼
                   Publish ke "Sparring Board"
                               │
                               ▼
[Komunitas B (Challenger)] ──► Ajukan Tanding
                               │
                               ▼
[Komunitas A] ───────────────► Terima Tantangan
                               │
                               ▼
             Kedua tim Mengajukan Tempat dan jadwal bertanding
                               │
                               ▼
            Sistem akan membuat list jadwal dan tempat yang match
                               │
                               ▼
                Kedua tim akan konfirm pertandingan
                               │
                               ▼
                     Status: MATCH CONFIRMED
                               │
                               ▼
               Pertandingan Berjalan di Lapangan
                               │
                               ▼
         Kedua Kapten Konfirmasi Laga & Beri Rating Sportivitas
                               │
                               ▼
                 Dana Sewa Dicairkan ke Host/Venue

```

## 5. Model Monetisasi & Arus Kas (Cash Flow)

Untuk menjaga arus kas perusahaan tetap positif dan sehat tanpa ketergantungan modal bakar (_burn capital_):

| Sumber Pendapatan                  | Skema & Target Pengguna                                                                                     | Estimasi Nilai                    | Dampak Arus Kas                                                  |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------- |
| **Convenience Fee (Platform Fee)** | Dibebankan kepada pemain perorangan saat checkout pembayaran slot mabar.                                    | Rp2.000 – Rp3.000 / transaksi     | Pemasukan harian langsung (_daily cash inflow_).                 |
| **Sparring Escrow & Admin Fee**    | Biaya administrasi proteksi jadwal sparring antartim.                                                       | Rp15.000 – Rp25.000 / tim / match | Dana mengendap sementara (_float cash_) + margin layanan.        |
| **KickPro Club Pass (SaaS)**       | Berlangganan bulanan untuk komunitas aktif (fitur buku kas lengkap, bebas biaya pencairan, verified badge). | Rp99.000 – Rp199.000 / bulan      | Pendapatan berulang bulanan (_Monthly Recurring Revenue_ / MRR). |
| **Marketplace Wasit & Fotografer** | Biaya komisi rujukan fotografer dan wasit rekanan yang dipesan melalui aplikasi.                            | Komisi 10% – 15% per transaksi    | Tambahan margin per event akhir pekan.                           |

## 6. Rancangan Skema Data Firestore (NoSQL Structure)

```
users/ (collection)
  └── {userId} (document)
        ├── name: string
        ├── phoneNumber: string
        ├── role: "player" | "host" | "admin"
        ├── position: "GK" | "DF" | "MF" | "FW"
        ├── preferredFoot: "left" | "right" | "both"
        ├── attendanceScore: number (0 - 100)
        └── createdAt: timestamp

clubs/ (collection)
  └── {clubId} (document)
        ├── name: string
        ├── logoUrl: string
        ├── city: string
        ├── adminUids: array of string
        ├── walletBalance: number
        ├── totalMatchesPlayed: number
        └── fairPlayScore: number (1.0 - 5.0)

events/ (collection)
  └── {eventId} (document)
        ├── clubId: string
        ├── title: string
        ├── sportType: "mini_soccer" | "futsal" | "football"
        ├── eventType: "open_play" | "sparring"
        ├── venueName: string
        ├── venueAddress: string
        ├── eventDate: string (YYYY-MM-DD)
        ├── startTime: string (HH:mm)
        ├── endTime: string (HH:mm)
        ├── pricePerSlot: number
        ├── totalSlots: number
        ├── filledSlots: number
        ├── status: "open" | "completed" | "cancelled"
        ├── createdAt: timestamp
        │
        ├── slots/ (sub-collection)
        │     └── {slotId} (document: "1", "2", ...)
        │           ├── slotNumber: number
        │           ├── status: "available" | "locked" | "paid"
        │           ├── lockedByUserId: string | null
        │           ├── lockedAt: timestamp | null
        │           ├── playerName: string | null
        │           ├── playerPhone: string | null
        │           └── paymentId: string | null

sparring_matches/ (collection)
  └── {matchId} (document)
        ├── hostClubId: string
        ├── challengerClubId: string | null
        ├── venueName: string
        ├── matchDate: string
        ├── matchTime: string
        ├── format: "7v7" | "8v8" | "11v11"
        ├── totalFieldCost: number
        ├── splitRatio: "50:50"
        ├── hostDepositPaid: boolean
        ├── challengerDepositPaid: boolean
        ├── status: "open" | "challenge_pending" | "confirmed" | "completed" | "disputed"
        └── createdAt: timestamp

```

## 7. Metrik Keberhasilan MVP (KPI)

1. **Transaction Completion Rate:** $\ge 70\%$ pemain yang mengunci slot menyelesaikan pembayaran dalam durasi 10 menit.
2. **Zero Dispute Matchmaking:** $\ge 90\%$ pertandingan sparring berjalan tanpa sengketa jadwal atau pembatalan sepihak.
3. **Cashflow Health:** Arus kas operasional positif pada bulan ke-3 pasca rilis melalui kombinasi _platform fee_ dan _SaaS Club Pass_.
4. **Time Efficiency:** Mengurangi waktu kerja admin komunitas untuk rekapitulasi data pemain dan keuangan sebesar $> 75\%$.