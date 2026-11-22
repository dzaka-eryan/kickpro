# KickPro

Platform otomasi event mabar, kas komunitas, dan hub sparring sepak bola / mini soccer / futsal di Indonesia.

## Infrastruktur & Firebase

| Alias | Project ID | Region Utama | Keterangan |
| --- | --- | --- | --- |
| `local` | `demo-kickpro` | Lokal (Emulator) | Auth, Firestore, Functions, Storage, UI |
| `staging` | `kickpro-staging` | `asia-southeast2` (Jakarta) | Auto-deploy dari branch `develop` |
| `prod` | `kickpro-prod` | `asia-southeast2` (Jakarta) | Deploy dari branch `main` dengan approval |

Layanan yang diaktifkan per project:
- **Firebase Authentication** (Phone OTP & Google)
- **Cloud Firestore** (Region: `asia-southeast2` Jakarta)
- **Cloud Storage for Firebase**
- **Cloud Functions for Firebase 2nd gen** (Node.js 20, TypeScript, region `asia-southeast2`)
- **Firebase App Hosting** (Next.js 15 App Router SSR)

## Menjalankan Lokal

```bash
# 1. Install dependencies
pnpm install

# 2. Jalankan Next.js + Firebase Emulator Suite
pnpm dev:all

# 3. Di terminal terpisah, isi data contoh ke emulator
pnpm seed
```

## Perintah Umum

- `pnpm lint` — cek ESLint seluruh workspace
- `pnpm typecheck` — cek TypeScript strict seluruh paket
- `pnpm test:unit` — jalankan unit test (Vitest)
- `pnpm test:rules` — jalankan test Security Rules dengan Firestore Emulator
- `pnpm build` — build `@kickpro/shared`, `@kickpro/functions`, dan `@kickpro/web`
- `pnpm exec firebase use staging` / `pnpm exec firebase use prod` — ganti target project Firebase
