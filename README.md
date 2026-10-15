# Math Fluency — Kuis Kelancaran Berhitung

Aplikasi web modern untuk menguji dan melatih kelancaran kognitif berhitung cepat (math fluency). 100% Bebas biaya tanpa paywall atau batasan fitur.

![Math Fluency Logo](math-fluency.png)

## Fitur Utama

- **4 Operasi Matematika Lengkap**:
  - ✖ **Perkalian**: Menguji kecepatan tabel perkalian dasar.
  - ➕ **Penjumlahan**: Latihan penjumlahan cepat.
  - ➖ **Pengurangan**: Menggunakan hasil bulat positif tanpa nilai minus.
  - ➗ **Pembagian**: Pembagian bulat presisi tanpa sisa.
- **Pilihan Tingkat Kesulitan**:
  - *Standar (2–9)*: Ideal untuk penguasaan kelancaran dasar.
  - *Tantangan (2–12)*: Untuk tantangan angka lebih tinggi.
- **Tata Letak Desktop 1:1 Bujur Sangkar**:
  - `aspect-ratio: 1 / 1` terpusat di layar dengan 2 div terpisah:
    - **Quiz Container**: Alur kuis interaktif, keypad sentuh, dan evaluasi hasil.
    - **Dashboard Container**: Live Dashboard, rekor terbaik personal, grafik tren SVG, serta kontrol tema dan audio.
- **Mobile View Ergonomis**:
  - Mengikuti tinggi layar `100dvh` dengan minim scroll dan tanpa scroll horizontal.
  - Keypad responsif dengan dukungan *haptic vibration*.
- **Tanpa Tanda Scroll & Animasi Lembut**:
  - Scrollbar disembunyikan secara bersih di seluruh browser.
  - Menggunakan **View Transitions API** dan kurva easing modern `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Desain Warna Open Color**:
  - Palet resmi Open Color (**Blue, Green, Orange**) dengan dukungan **Light Mode** & **Dark Mode**.
- **Web Audio API Synthesizer**:
  - Efek suara tuts, nada benar, nada salah, dan melodi kuis selesai tanpa memerlukan file audio eksternal.
- **Perhitungan Math Fluency Ilmiah**:
  - **Formula 1**: Indeks kategorikal kecepatan $\times$ akurasi target.
  - **Formula 2**: Reaksi waktu kontinu logaritmik $\sum \frac{1.5}{\max(1.5, t_i)}$.
  - Pelacakan riwayat 30 sesi permainan terakhir dengan visualisasi grafik garis SVG.

## Menjalankan Secara Lokal

Aplikasi ini dibuat murni menggunakan HTML5, Vanilla CSS, dan Vanilla JavaScript tanpa dependensi build. Anda dapat membukanya langsung:

1. Buka file `index.html` langsung di browser favorit Anda, atau
2. Jalankan server lokal sederhana:
   ```bash
   # Menggunakan Node.js
   npx serve .
   # atau Python
   python -m http.server 3000
   ```

## Pengujian Otomatis

Jalankan test suite untuk memastikan seluruh generator soal dan formula matematis akurat:
```bash
node test_runner.js
```

## Lisensi
MIT License
