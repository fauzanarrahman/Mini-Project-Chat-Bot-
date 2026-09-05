# BelajarBot 📚 — Education Chatbot (Gemini API)

Final Project — LLM-Based Tools and Gemini API Integration for Data Scientists (Hacktiv8)

## Deskripsi
BelajarBot adalah chatbot edukasi berbasis AI yang membantu pengguna belajar berbagai mata pelajaran
dengan memanfaatkan Google Gemini API untuk memproses bahasa alami dan memberikan respon yang relevan.

## Use Case
**Education Bot** — teman belajar interaktif untuk siswa/pelajar.

## Parameter Kreatif
- **Gaya bahasa**: bisa dipilih santai (seperti kakak tingkat) atau formal.
- **Domain pengetahuan**: bisa difokuskan ke Matematika, Sains, Bahasa Inggris, Sejarah, Bahasa Indonesia, atau Umum.
- **Fitur tambahan (memory)**: riwayat percakapan disimpan di browser (localStorage) sehingga bot "ingat" konteks obrolan sebelumnya selama sesi belajar.
- **Fitur tambahan (rekomendasi/aksi)**: tombol "Buatkan Kuis" untuk otomatis membuat soal latihan pilihan ganda berdasarkan materi yang baru dibahas.

## Teknologi
- HTML, CSS, JavaScript (vanilla, tanpa framework — mudah dijalankan di mana saja)
- Google Gemini API (`gemini-2.0-flash`) untuk pemrosesan bahasa alami

## Cara Menjalankan
1. Clone repository ini:
   ```bash
   git clone <URL_REPO_INI>
   cd education-bot
   ```
2. Buka file `index.html` langsung di browser (double click), atau jalankan local server sederhana:
   ```bash
   python3 -m http.server 8000
   ```
   lalu buka `http://localhost:8000` di browser.
3. Saat pertama kali dibuka, akan muncul pop-up untuk memasukkan **Gemini API Key**.
   - Dapatkan API key gratis di [Google AI Studio](https://aistudio.google.com/app/apikey).
   - API key hanya disimpan di browser kamu sendiri (localStorage), tidak dikirim ke server manapun selain Google.
4. Pilih mapel dan gaya bahasa, lalu mulai chat!

## Struktur File
```
education-bot/
├── index.html      # Struktur UI chatbot
├── style.css       # Styling tampilan
├── script.js       # Logika chatbot & integrasi Gemini API
└── README.md       # Dokumentasi proyek
```

## Deliverables
- [x] URL Repository GitHub: `<isi setelah push ke GitHub>`
- [x] Screenshot User Interface: `<lampirkan screenshot di sini setelah deploy/jalankan lokal>`

## Catatan
Jika model `gemini-2.0-flash` tidak tersedia untuk API key kamu, ganti nama model di `script.js`
(variabel `GEMINI_MODEL`) sesuai daftar model yang tersedia di [Gemini API Docs](https://ai.google.dev/gemini-api/docs/models).
