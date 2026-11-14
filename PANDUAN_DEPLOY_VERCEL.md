# 🚀 Panduan Lengkap Deploy ke Vercel (100% Gratis & Tanpa Kartu Kredit)

Dokumen ini berisi panduan langkah demi langkah untuk mempublikasikan website ucapan ulang tahun **Novia Lailia** ke internet secara online menggunakan **Vercel**.

---

## 🌟 Mengapa Memilih Vercel?

1. **100% Gratis Selamanya (Hobby Plan):**
   - Vercel **sama sekali TIDAK meminta data kartu kredit, debit, ataupun nomor rekening bank**.
   - Cukup mendaftar menggunakan akun GitHub.
2. **Tanpa Mode Tidur (No Spindown / Sleep):**
   - Berbeda dengan Render Free Tier yang otomatis tidur setelah 15 menit dan butuh waktu 50 detik untuk bangun, di Vercel website akan langsung terbuka **secepat kilat kapan saja**.
3. **Performa Streaming Video & Audio Maksimal:**
   - CDN Edge global Vercel secara native mendukung HTTP Range Requests (HTTP 206 Partial Content), sehingga pemutaran background video (`vid1.mp4`) dan lagu (`shape-of-my-heart.mp3`) berjalan lancar tanpa buffering.
4. **Domain HTTPS Otomatis & Instan:**
   - Langsung mendapatkan link website gratis dengan SSL/HTTPS aman, misalnya: `https://ultah-lailia.vercel.app`.

---

## 🛠️ Persiapan yang Sudah Disediakan di Project Ini

Lingkungan aplikasi project sudah disiapkan secara khusus untuk Vercel:
- `vercel.json` : Konfigurasi routing CDN dan Serverless Function.
- `api/wishes.js` : Serverless Function endpoint untuk membaca dan mengirim ucapan/doa (`/api/wishes`).
- `lib/wishesStore.js` : Penyimpanan data adaptif (menggunakan `/tmp` dan in-memory cache saat di Vercel agar aman dari batasan *read-only filesystem*, dan file `wishes.json` saat di komputer lokal).
- `public/` : Folder statis otomatis dilayani oleh CDN Vercel.
- `.gitignore` : Menyaring folder cache dan node_modules agar repository tetap bersih dan ringan.

---

## 📋 Langkah-Langkah Deploy ke Vercel

### Langkah 1: Buat Akun Vercel
1. Buka browser dan kunjungi: **[https://vercel.com/signup](https://vercel.com/signup)**
2. Pilih tombol **"Continue with GitHub"**.
3. Otorisasikan akun GitHub kamu.
4. Masukkan nama dan nomor HP untuk verifikasi SMS/OTP (ini proteksi standar anti-bot gratis Vercel, **bukan pembayaran kartu kredit**).
5. Setelah verifikasi SMS selesai, akun Vercel kamu sudah aktif dan siap digunakan.

---

### Langkah 2: Buat Repository Baru di GitHub
Jika kamu belum membuat repository di GitHub untuk project ini:
1. Buka **[https://github.com/new](https://github.com/new)**.
2. Isi **Repository name**, misalnya: `ultah-lailia`.
3. Pilih opsi **Public** atau **Private** (keduanya 100% gratis di Vercel).
4. **PENTING:** Jangan centang opsi *"Add a README file"*, *"Add .gitignore"*, atau *"Choose a license"* karena file-file tersebut sudah lengkap di komputer kamu.
5. Klik tombol **"Create repository"**.
6. Simpan link URL repository yang muncul, formatnya:
   ```
   https://github.com/USERNAME-KAMU/ultah-lailia.git
   ```

---

### Langkah 3: Push Project dari Komputer ke GitHub
Buka terminal PowerShell di folder project ini (`D:\Lailiaa\Ultah`) dan jalankan perintah-perintah berikut satu per satu:

```powershell
# 1. Pastikan semua file masuk ke git
git add .

# 2. Simpan commit persiapan Vercel
git commit -m "Siapkan deploy Vercel"

# 3. Pastikan branch utama bernama main
git branch -M main

# 4. Hubungkan ke repository GitHub kamu (ganti USERNAME-KAMU dengan username GitHub kamu)
git remote add origin https://github.com/USERNAME-KAMU/ultah-lailia.git

# 5. Upload seluruh kode ke GitHub
git push -u origin main
```

*(Catatan: Jika sebelumnya kamu sudah pernah menghubungkan remote origin lain, kamu bisa mengubahnya dengan `git remote set-url origin https://github.com/USERNAME-KAMU/ultah-lailia.git` lalu lakukan `git push -u origin main`)*.

---

### Langkah 4: Hubungkan dan Deploy di Dashboard Vercel
1. Masuk ke dashboard Vercel di: **[https://vercel.com/dashboard](https://vercel.com/dashboard)**.
2. Klik tombol **"Add New..."** di pojok kanan atas, lalu pilih **"Project"**.
3. Di bagian **"Import Git Repository"**, kamu akan melihat daftar repository GitHub kamu.
   - Temukan repository `ultah-lailia`.
   - Klik tombol **"Import"** di sebelah kanannya.
4. Pada halaman konfigurasi project:
   - **Project Name**: Bisa dibiarkan sesuai nama repo (misalnya `ultah-lailia`). Nama ini akan menjadi awalan domain kamu: `ultah-lailia.vercel.app`.
   - **Framework Preset**: Pilih **"Other"** (atau biarkan default yang terdeteksi).
   - **Root Directory**: Biarkan `./` (default).
   - **Build and Output Settings**: Biarkan kosong / default (karena semua aset statis ada di folder `public/` dan endpoint ada di `api/`).
   - **Environment Variables**: Kosongkan (tidak ada API key rahasia yang wajib diisi).
5. Klik tombol **"Deploy"** berwarna biru di bagian bawah.

---

### Langkah 5: Selesai! Website Siap Diakses
1. Vercel akan memproses deployment sekitar 20 hingga 40 detik.
2. Begitu selesai, akan muncul animasi confetti perayaan: **"Congratulations! You just deployed a new project."**
3. Klik tombol **"Continue to Dashboard"** atau klik kotak pratinjau website untuk melihat tautan (*domain*) aktif kamu.
4. Contoh link yang didapatkan:
   ```
   https://ultah-lailia.vercel.app
   ```
5. Fitur parameter nama kustom juga langsung dapat digunakan di link tersebut:
   ```
   https://ultah-lailia.vercel.app/?nama=Novia+Lailia
   ```

---

## 🔄 Cara Melakukan Pembaruan (Update) di Masa Mendatang
Jika kamu ingin mengubah foto, menambahkan ucapan, atau memperbaiki teks di kemudian hari:
1. Edit file di komputer kamu seperti biasa.
2. Buka terminal di folder project dan jalankan:
   ```powershell
   git add .
   git commit -m "Update konten"
   git push origin main
   ```
3. Vercel akan secara otomatis mendeteksi perubahan tersebut dan melakukan **deploy ulang otomatis dalam hitungan detik** tanpa kamu perlu membuka dashboard Vercel lagi!

---

## 💡 Pertanyaan yang Sering Diajukan (FAQ)

**Q: Apakah Vercel benar-benar tidak akan menagih biaya apa pun?**  
**A:** Benar 100%. Paket Hobby Vercel sepenuhnya gratis untuk penggunaan personal. Vercel tidak meminta kartu kredit ataupun metode pembayaran apa pun saat mendaftar.

**Q: Apakah buku tamu ucapan (Wishes Board) tetap bisa digunakan di Vercel?**  
**A:** Ya! Endpoint `/api/wishes` telah disiapkan menggunakan Vercel Serverless Function dan `lib/wishesStore.js` yang memanfaatkan penyimpanan memori dan `/tmp`, sehingga pengunjung website dapat mengirim doa dan ucapan langsung tanpa error.

**Q: Bisakah saya mengganti nama domain agar lebih bagus?**  
**A:** Tentu. Di dashboard Vercel, masuk ke project kamu > tab **Settings** > menu **Domains**. Kamu bisa mengubah subdomain `*.vercel.app` atau bahkan menambahkan custom domain sendiri secara gratis.
