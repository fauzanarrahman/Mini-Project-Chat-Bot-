// ====== KONFIGURASI ======
// Ganti nama model di sini jika Google merilis versi model baru.
// Cek daftar model terbaru di https://ai.google.dev/gemini-api/docs/models
const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_ENDPOINT = (apiKey) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

const STORAGE_KEY_HISTORY = "belajarbot_history";
const STORAGE_KEY_APIKEY = "belajarbot_api_key";

// ====== ELEMEN DOM ======
const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const subjectSelect = document.getElementById("subjectSelect");
const styleSelect = document.getElementById("styleSelect");
const quizBtn = document.getElementById("quizBtn");
const clearBtn = document.getElementById("clearBtn");
const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveApiKeyBtn = document.getElementById("saveApiKeyBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

// ====== STATE / MEMORY ======
// "Memory" sederhana: riwayat chat disimpan di localStorage per browser,
// jadi percakapan tetap ada walau halaman di-refresh.
let history = loadHistory();

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory() {
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
}

function getApiKey() {
  return localStorage.getItem(STORAGE_KEY_APIKEY) || "";
}

function setApiKey(key) {
  localStorage.setItem(STORAGE_KEY_APIKEY, key);
}

// ====== RENDER CHAT ======
function renderMessage(role, text, isLoading = false) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role === "user" ? "user" : "bot"}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble" + (isLoading ? " loading" : "");
  bubble.textContent = text;

  wrapper.appendChild(bubble);
  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return bubble;
}

function renderExistingHistory() {
  history.forEach((msg) => renderMessage(msg.role, msg.text));
}
renderExistingHistory();

// ====== SYSTEM PROMPT SESUAI PARAMETER KREATIF ======
function buildSystemPrompt() {
  const subject = subjectSelect.value;
  const style = styleSelect.value;

  const subjectMap = {
    umum: "berbagai topik pelajaran sekolah secara umum",
    matematika: "Matematika (aljabar, geometri, aritmetika, dsb.)",
    sains: "Sains / IPA (fisika, kimia, biologi dasar)",
    "bahasa-inggris": "Bahasa Inggris (grammar, vocabulary, percakapan)",
    sejarah: "Sejarah (Indonesia dan dunia)",
    "bahasa-indonesia": "Bahasa Indonesia (tata bahasa, sastra, EYD)",
  };

  const styleMap = {
    santai: "santai, ramah, seperti kakak tingkat yang asik, boleh pakai emoji secukupnya",
    formal: "formal, jelas, terstruktur, tanpa basa-basi berlebihan",
  };

  return `Kamu adalah BelajarBot, chatbot edukasi untuk pelajar Indonesia.
Fokus domain pengetahuan kamu saat ini: ${subjectMap[subject]}.
Gaya bahasa yang harus kamu pakai: ${styleMap[style]}.
Jawab dengan bahasa Indonesia, singkat tapi jelas, beri contoh jika membantu pemahaman.
Jika pertanyaan di luar domain, tetap coba bantu semampunya tapi ingatkan dengan sopan bahwa itu di luar fokus mapel yang dipilih.`;
}

// ====== PANGGIL GEMINI API ======
async function callGemini(userMessage) {
  const apiKey = getApiKey();
  if (!apiKey) {
    openSettings();
    throw new Error("API Key belum diisi. Silakan isi dulu di menu pengaturan (⚙️).");
  }

  // Susun konteks percakapan (memory) supaya bot ingat obrolan sebelumnya
  const contents = [];
  const recentHistory = history.slice(-10); // batasi konteks biar ringan
  recentHistory.forEach((msg) => {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    });
  });
  contents.push({ role: "user", parts: [{ text: userMessage }] });

  const body = {
    system_instruction: {
      parts: [{ text: buildSystemPrompt() }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 800,
    },
  };

  const res = await fetch(GEMINI_ENDPOINT(apiKey), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gagal memanggil Gemini API (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const reply =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n") ||
    "Maaf, aku belum bisa jawab pertanyaan itu. Coba tanya dengan cara lain ya.";
  return reply;
}

// ====== HANDLE KIRIM PESAN ======
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  chatInput.value = "";
  renderMessage("user", text);
  history.push({ role: "user", text });
  saveHistory();

  const loadingBubble = renderMessage("bot", "BelajarBot sedang mengetik...", true);

  try {
    const reply = await callGemini(text);
    loadingBubble.textContent = reply;
    loadingBubble.classList.remove("loading");
    history.push({ role: "bot", text: reply });
    saveHistory();
  } catch (err) {
    loadingBubble.textContent = "⚠️ " + err.message;
    loadingBubble.classList.remove("loading");
  }
});

// ====== FITUR TAMBAHAN: BUATKAN KUIS ======
quizBtn.addEventListener("click", async () => {
  const topicHint =
    history.length > 0
      ? "berdasarkan materi yang baru saja kita bahas di percakapan ini"
      : "untuk mapel yang sedang dipilih (topik bebas, level dasar)";

  const quizPrompt = `Buatkan 3 soal kuis pilihan ganda (beserta jawabannya di akhir) ${topicHint}. Format rapi dan bernomor.`;

  renderMessage("user", "📝 Buatkan kuis latihan dong");
  history.push({ role: "user", text: "📝 Buatkan kuis latihan dong" });
  saveHistory();

  const loadingBubble = renderMessage("bot", "Membuat soal kuis...", true);
  try {
    const reply = await callGemini(quizPrompt);
    loadingBubble.textContent = reply;
    loadingBubble.classList.remove("loading");
    history.push({ role: "bot", text: reply });
    saveHistory();
  } catch (err) {
    loadingBubble.textContent = "⚠️ " + err.message;
    loadingBubble.classList.remove("loading");
  }
});

// ====== HAPUS RIWAYAT (MEMORY RESET) ======
clearBtn.addEventListener("click", () => {
  if (confirm("Hapus semua riwayat percakapan?")) {
    history = [];
    saveHistory();
    chatWindow.innerHTML = "";
    renderMessage("bot", "Riwayat sudah dihapus. Yuk mulai obrolan baru! 👋");
  }
});

// ====== MODAL PENGATURAN API KEY ======
function openSettings() {
  apiKeyInput.value = getApiKey();
  settingsModal.classList.remove("hidden");
}

function closeSettings() {
  settingsModal.classList.add("hidden");
}

settingsBtn.addEventListener("click", openSettings);
closeModalBtn.addEventListener("click", closeSettings);
saveApiKeyBtn.addEventListener("click", () => {
  setApiKey(apiKeyInput.value.trim());
  closeSettings();
});

// Buka otomatis pengaturan kalau API key belum pernah diisi
if (!getApiKey()) {
  openSettings();
}
