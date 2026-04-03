const express = require("express");
const axios = require("axios");
const fs = require("fs");

const app = express();
app.use(express.json());

const PORT = 3000;
const TOKEN = "Sqk8EcTS2CB5f4jXNLQh";

// DB
const DB = "./db.json";

function loadDB() {
  if (!fs.existsSync(DB)) {
    fs.writeFileSync(DB, JSON.stringify({ users: {} }));
  }
  return JSON.parse(fs.readFileSync(DB));
}

function saveDB(data) {
  fs.writeFileSync(DB, JSON.stringify(data));
}

// GAME

function handleGame(id, msg) {
  let db = loadDB();

  if (!db.users[id]) {
    db.users[id] = {
      uang: 100,
      energy: 100,
      padi: 0,
      ikan: 0,
      ayam: 0,
      sapi: 0,
      telur: 0
    };
    saveDB(db);

    return `🌅 *Selamat datang di Harvest Moon: Back To Desa*

Kamu tiba di desa kecil...
Udara segar... suara burung... kehidupan baru dimulai 🌾

Ketik: menu`;
  }

  let u = db.users[id];

  // ===== MENU =====
  if (msg === "menu") {
    return `🌾 *HARVEST MOON MENU*

📊 info
🌱 tanam
🌾 panen
🐄 ternak
🎣 mancing
🍳 masak
💼 kerja
🛒 pasar
🕶️ gelap
🎒 inv
🌌 event`;
  }

  // ===== INFO =====
  if (msg === "info") {
    return `📊 *STATUS DESA*

💰 Uang: ${u.uang}
⚡ Energy: ${u.energy}

🌾 Padi: ${u.padi}
🐟 Ikan: ${u.ikan}
🐔 Ayam: ${u.ayam}
🐄 Sapi: ${u.sapi}
🥚 Telur: ${u.telur}`;
  }

  // ===== TANAM =====
  if (msg === "tanam") {
    if (u.energy < 10) return "⚡ Kamu terlalu lelah...";

    u.energy -= 10;
    u.padi += 3;
    saveDB(db);

    return `🌱 Kamu menanam di ladang...

Tanah terasa hangat...
🌾 +3 padi`;
  }

  // ===== PANEN =====
  if (msg === "panen") {
    if (u.padi < 1) return "🌾 Tidak ada yang bisa dipanen";

    let hasil = u.padi * 5;
    u.uang += hasil;
    u.padi = 0;
    saveDB(db);

    return `🌾 Kamu memanen ladang...

Hasil dijual ke pasar 💰
+${hasil}`;
  }

  // ===== TERNAK =====
  if (msg === "ternak") {
    return `🐄 *KANDANG DESA*

Angin sore berhembus...
Hewan ternakmu menatap tenang 🐔🐄

🐔 ayam - $20
🐄 sapi - $100

Ketik:
beli ayam / beli sapi`;
  }

  if (msg.startsWith("beli")) {
    let h = msg.split(" ")[1];

    if (h === "ayam") {
      if (u.uang < 20) return "💸 Uang tidak cukup...";
      u.ayam += 1;
      u.uang -= 20;
      saveDB(db);

      return "🐔 Seekor ayam kini tinggal di kandangmu...";
    }

    if (h === "sapi") {
      if (u.uang < 100) return "💸 Uang tidak cukup...";
      u.sapi += 1;
      u.uang -= 100;
      saveDB(db);

      return "🐄 Sapi besar itu kini milikmu...";
    }
  }

  // ===== MANCING =====
  if (msg === "mancing") {
    let hasil = ["lele", "ikan emas", "sepatu tua", "ikan langka ✨"];
    let dapet = hasil[Math.floor(Math.random() * hasil.length)];

    if (dapet === "sepatu tua") {
      return "😅 Kamu menarik sesuatu... ternyata cuma sepatu tua...";
    }

    u.ikan += 1;
    saveDB(db);

    return `🎣 Air bergetar...

🐟 Kamu mendapat ${dapet}`;
  }

  // ===== MASAK =====
  if (msg === "masak") {
    if (u.ikan < 1) return "🍳 Tidak ada bahan...";
    u.ikan -= 1;
    u.energy += 10;
    saveDB(db);

    return "🍳 Kamu memasak ikan...\n⚡ Energy +10";
  }

  // ===== KERJA =====
  if (msg === "kerja") {
    if (u.energy < 15) return "⚡ Kamu kelelahan...";
    u.energy -= 15;
    u.uang += 50;
    saveDB(db);

    return "💼 Kamu bekerja di kota...\n💰 +50";
  }

  // ===== PASAR =====
  if (msg === "pasar") {
    return `🛒 *PASAR DESA*

Orang-orang ramai berdagang...

Ketik:
jual ikan`;
  }

  if (msg === "jual ikan") {
    if (u.ikan < 1) return "❌ Tidak ada ikan";

    let uang = u.ikan * 10;
    u.uang += uang;
    u.ikan = 0;
    saveDB(db);

    return `💰 Ikan terjual semua!\n+${uang}`;
  }

  // ===== PASAR GELAP =====
  if (msg === "gelap") {
    return `🕶️ *PASAR GELAP*

Tempat ini terasa... berbeda...

💣 item langka
💰 harga mahal

(coming soon 😈)`;
  }

  // ===== INVENTORY =====
  if (msg === "inv") {
    return `🎒 INVENTORY

🌾 ${u.padi}
🐟 ${u.ikan}
🐔 ${u.ayam}
🐄 ${u.sapi}
🥚 ${u.telur}`;
  }

  // ===== EVENT =====
  if (msg === "event") {
    return `🌌 *UNDER THE DOME*

Langit berubah gelap...
Kubus cahaya turun ke desa...

Ketik:
masuk / lari`;
  }

  if (msg === "masuk") {
    let r = Math.random();

    if (r < 0.5) {
      u.uang += 200;
      saveDB(db);
      return "💰 Kamu menemukan harta tersembunyi! +200";
    } else {
      return "👻 Suara aneh... kamu lari ketakutan!";
    }
  }

  return "❓ Perintah tidak dikenal...";
}
// WEBHOOK
app.post("/webhook", async (req, res) => {
  console.log("MASUK WEBHOOK:", req.body);

  const sender = req.body.sender;
  const msg = req.body.message?.toLowerCase() || "";

  const reply = handleGame(sender, msg);

  console.log("BALAS:", reply);

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

// ROOT
app.get("/", (req, res) => {
  res.send("BOT AKTIF 🔥");
});

app.listen(PORT, () => {
  console.log("Server jalan");
});
