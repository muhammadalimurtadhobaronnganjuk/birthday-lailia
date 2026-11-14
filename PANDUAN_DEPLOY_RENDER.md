# Panduan Lengkap Deploy Website ke Render.com

Panduan ini berisi langkah-langkah lengkap untuk mempublikasikan (*deploy*) website ucapan ulang tahun ini ke platform **Render.com** secara gratis agar bisa diakses secara publik melalui internet dari ponsel maupun komputer.

---

## 1. Persiapan Proyek yang Telah Diselesaikan
Proyek ini sudah dikonfigurasi dan siap untuk di-deploy:
- **Port Dinamis & Host Binding**: `server.js` telah mendukung `process.env.PORT` dan mengikat ke host `0.0.0.0` (standar cloud hosting).
- **Health Check Route**: Endpoint `/healthz` telah ditambahkan untuk monitoring server otomatis di Render.
- **Node Engines**: `package.json` telah dikonfigurasi dengan script `npm start` dan versi Node.js yang sesuai.
- **File `.gitignore`**: Telah dibuat sehingga folder berat `node_modules` tidak terunggah ke GitHub.
- **File `render.yaml`**: Telah disiapkan jika Anda ingin menggunakan fitur Blueprint otomatis di Render.

---

## 2. Langkah-Langkah Publikasi

### Langkah 1: Buat Repository Baru di GitHub
1. Buka dan login ke akun GitHub Anda di: [https://github.com](https://github.com).
2. Di pojok kanan atas, klik tanda **`+`** lalu pilih **New repository** (atau akses langsung ke [https://github.com/new](https://github.com/new)).
3. Masukkan nama repository, contoh: `ultah-lailia`.
4. Pilih **Public** (atau **Private**; Render mendukung keduanya).
5. **Jangan centang** opsi *"Add a README file"*, *"Add .gitignore"*, atau *"Choose a license"* karena file-file tersebut sudah ada di proyek lokal Anda.
6. Klik tombol hijau **Create repository**.

---

### Langkah 2: Unggah (Push) Proyek ke GitHub
Buka terminal (PowerShell atau Command Prompt) di folder proyek ini (`D:\Lailiaa\Ultah`), lalu jalankan perintah berikut secara berurutan:

```bash
# 1. Tambahkan semua file proyek ke Git
git add .

# 2. Buat commit pertama
git commit -m "Deploy: Siap publikasi ke Render"

# 3. Pastikan branch utama bernama 'main'
git branch -M main

# 4. Hubungkan ke repository GitHub Anda (ganti USERNAME dan NAMA-REPO sesuai milik Anda)
git remote add origin https://github.com/USERNAME/NAMA-REPO.git

# 5. Unggah proyek ke GitHub
git push -u origin main
```

> **Catatan File Video (`vid1.mp4`):**
> File video memiliki ukuran sekitar ~74 MB (masih di bawah batas maksimal 100 MB per file di GitHub). Proses `git push` akan memakan waktu 1–3 menit tergantung kecepatan unggah internet Anda. Tunggu hingga proses upload selesai 100%.

---

### Langkah 3: Deploy di Render.com
1. Buka dan masuk ke akun Render di: [https://render.com](https://render.com) (Anda bisa login menggunakan akun GitHub Anda dengan klik **Sign in with GitHub**).
2. Setelah masuk ke Dashboard Render, klik tombol **New +** di pojok kanan atas, lalu pilih **Web Service**.
3. Pilih opsi **Build and deploy from a Git repository**, lalu klik **Next**.
4. Di bagian **Connect a repository**, cari repository GitHub Anda (`ultah-lailia`) lalu klik **Connect**.
   *(Jika belum muncul, klik "Configure account" untuk memberi izin akses Render ke repository GitHub Anda).*
5. Isi formulir konfigurasi berikut:
   - **Name**: `ultah-novia-lailia` (nama subdomain website Anda di Render)
   - **Region**: Pilih **Singapore** (paling dekat dan cepat diakses dari Indonesia)
   - **Branch**: `main`
   - **Root Directory**: Kosongkan (biarkan kosong)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type / Plan**: Pilih **Free** ($0 / month)
6. Di bagian bawah, klik tombol **Create Web Service**.

---

### Langkah 4: Tunggu Proses Build & Akses Website
1. Render akan langsung memulai proses build secara otomatis. Anda dapat melihat log proses:
   - Mengunduh repository dari GitHub
   - Menjalankan `npm install`
   - Menjalankan `npm start`
2. Tunggu sekitar 1–3 menit sampai log menampilkan pesan server berjalan dan status di kiri atas berubah menjadi **Live** dengan ikon warna hijau.
3. Di bawah nama web service Anda, akan muncul tautan website resmi publik Anda, contohnya:
   ```
   https://ultah-novia-lailia.onrender.com
   ```
4. Salin tautan tersebut dan buka di browser atau kirimkan kepada yang berulang tahun.

---

## 3. Catatan & Tips Penting untuk Render Free Tier

1. **Fitur Auto Sleep (Spindown) pada Paket Free**:
   - Jika website tidak dibuka selama lebih dari 15 menit, Render akan menonaktifkan server sementara untuk menghemat sumber daya.
   - Saat website diakses kembali setelah inaktif, Render membutuhkan waktu sekitar **30–50 detik** untuk menyala kembali (*cold start*). Setelah menyala, website akan berjalan cepat dan normal kembali.
   - *Tips:* Buka website Anda terlebih dahulu sekitar 1 menit sebelum Anda membagikan linknya ke teman agar website sudah dalam kondisi aktif (*hot*).

2. **Penyimpanan Pesan Buku Tamu (`wishes.json`)**:
   - Pada paket gratis Render, sistem file bersifat *ephemeral* (jika server direstart atau di-deploy ulang, file `wishes.json` akan kembali ke kondisi awal commit Git).
   - Semua fitur ucapan, form, dan tampilan tetap berfungsi normal selama server berjalan.

3. **Cara Update Website di Masa Depan**:
   - Jika Anda melakukan perubahan di lokal, Anda cukup melakukan commit dan push ulang:
     ```bash
     git add .
     git commit -m "Update konten"
     git push origin main
     ```
   - Render akan mendeteksi push tersebut secara otomatis dan melakukan *re-deploy* tanpa perlu pengaturan manual lagi.
