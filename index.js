const express = require("express");
const fs = require("fs");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const TOKEN = "Sqk8EcTS2CB5f4jXNLQh";

// ===== DATABASE =====
const DB = "./db.json";

function loadDB() {
  if (!fs.existsSync(DB)) {
    fs.writeFileSync(DB, JSON.stringify({ users: {} }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB));
}

function saveDB(data) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

// ===== GAME =====
function handleGame(id, msg) {
  let db = loadDB();

  if (!db.users[id]) {
    db.users[id] = {
      name: "Petani Desa",
      level: 1,
      exp: 0,
      saldo: 100,
      energi: 10,
      lastKerja: 0,
      lahan: [],
      ternak: [],
      inventory: {}
    };
    saveDB(db);
    return "🌾 Selamat datang di Harvest Moon: Back to Desa!\nKetik: desa menu";
  }

  let user = db.users[id];

  // ===== MENU =====
  if (msg === "desa menu") {
    return `🌾 MENU

desa info
desa pasar
desa tanam <nama>
desa panen
desa kerja
desa ternak
desa inv
desa top`;
  }

  // ===== INFO =====
  if (msg === "desa info") {
    return `📊 INFO

👤 ${user.name}
⭐ Level: ${user.level}
💰 Saldo: ${user.saldo}
⚡ Energi: ${user.energi}

🌾 Lahan: ${user.lahan.length}/5
🐄 Ternak: ${user.ternak.length}`;
  }

  // ===== PASAR =====
  if (msg === "desa pasar") {
    return `🛒 PASAR

🌽 jagung
🍅 tomat
🥕 wortel

Ketik:
desa tanam <nama>`;
  }

  // ===== TANAM =====
  if (msg.startsWith("desa tanam")) {
    let tanaman = msg.split(" ")[2];

    if (!tanaman) return "❌ Contoh: desa tanam jagung";
    if (user.lahan.length >= 5) return "❌ Lahan penuh";

    user.lahan.push({ tanaman, waktu: Date.now() });
    saveDB(db);

    return `🌱 Menanam ${tanaman}`;
  }

  // ===== PANEN =====
  if (msg === "desa panen") {
    if (user.lahan.length === 0) return "❌ Tidak ada tanaman";

    let hasil = user.lahan.length * 20;
    user.saldo += hasil;
    user.lahan = [];

    saveDB(db);

    return `🌾 Panen +${hasil}`;
  }

  // ===== KERJA =====
  if (msg === "desa kerja") {
    let now = Date.now();

    if (now - user.lastKerja < 60000)
      return "⏳ Tunggu 1 menit";

    let gaji = 50;
    user.saldo += gaji;
    user.lastKerja = now;

    saveDB(db);
    return `💼 Kerja +${gaji}`;
  }

  // ===== TERNAK =====
  if (msg === "desa ternak") {
    return `🐄 TERNAK

🐔 ayam - 20
🐑 domba - 50
🐄 sapi - 100

Ketik:
desa beli <hewan>`;
  }

  if (msg.startsWith("desa beli")) {
    let h = msg.split(" ")[2];

    let harga = { ayam: 20, domba: 50, sapi: 100 };

    if (!harga[h]) return "❌ Tidak ada";
    if (user.saldo < harga[h]) return "❌ Uang kurang";

    user.saldo -= harga[h];
    user.ternak.push(h);

    saveDB(db);
    return `🐾 Membeli ${h}`;
  }

  // ===== INVENTORY =====
  if (msg === "desa inv") {
    return `🎒 INVENTORY

💰 ${user.saldo}
🐄 Ternak: ${user.ternak.length}`;
  }

  // ===== LEADERBOARD =====
  if (msg === "desa top") {
    let top = Object.entries(db.users)
      .sort((a, b) => b[1].saldo - a[1].saldo)
      .slice(0, 5);

    let teks = "🏆 TOP PLAYER\n\n";
    top.forEach((u, i) => {
      teks += `${i + 1}. ${u[1].name} - ${u[1].saldo}\n`;
    });

    return teks;
  }

  return "❓ Tidak dikenal";
}

// ===== WEBHOOK =====
app.post("/webhook", async (req, res) => {
  const sender = req.body.sender;
  const msg = req.body.message?.toLowerCase() || "";

  const reply = handleGame(sender, msg);

  await axios.post(
    "https://api.fonnte.com/send",
    {
      target: sender,
      message: reply,
    },
    {
      headers: {
        Authorization: TOKEN,
      },
    }
  );

  res.send("OK");
});

// ===== ROOT =====
app.get("/", (req, res) => {
  res.send("🌾 HARVEST MOON BOT AKTIF");
});

app.listen(PORT, () => console.log("Server jalan"));
