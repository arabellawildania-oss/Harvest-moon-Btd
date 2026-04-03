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
      name: "Petani Desa",
      level: 1,
      exp: 0,
      saldo: 100,
      emas: 10,
      energi: 10,
      maxEnergi: 10,
      lastKerja: 0,
      lastPanen: 0,
      lahan: [],
      ternak: [],
      inventory: {},
      skill: {
        farming: 1,
        mining: 1,
        fishing: 1
      }
    };
    saveDB(db);
    return "🌾 Selamat datang di Harvest Moon: Back to Desa!\nKetik: menu";
  }

  let user = db.users[id];

  // ===== REGENERASI ENERGI =====
  if (user.energi < user.maxEnergi) {
    user.energi += 1;
  }

  // ===== MENU =====
  if (msg === "menu") {
    return `🌾 HARVEST MOON MENU

📊 info
🌱 tanam
🌾 panen
🐄 ternak
🎣 mancing
⛏ tambang
🍳 masak
💼 kerja
🛒 pasar
🕶 gelap
☢ event
🎒 inv`;
  }

  // ===== INFO =====
  if (msg === "info") {
    return `📊 INFO PETANI

👤 ${user.name}
⭐ Level: ${user.level} (${user.exp}/100)
💰 Saldo: ${user.saldo}
🥇 Emas: ${user.emas}
⚡ Energi: ${user.energi}/${user.maxEnergi}

🌾 Lahan: ${user.lahan.length}/5
🐄 Ternak: ${user.ternak.length}

🎯 Skill:
🌱 Farming: ${user.skill.farming}
⛏ Mining: ${user.skill.mining}
🎣 Fishing: ${user.skill.fishing}`;
  }

  // ===== TANAM =====
  if (msg.startsWith("tanam")) {
    if (user.energi <= 0) return "❌ Energi habis";

    let tanaman = msg.split(" ")[2];
    if (!tanaman) return "Contoh: tanam padi";

    user.lahan.push({ tanaman, waktu: Date.now() });
    user.energi -= 1;

    saveDB(db);
    return `🌱 Menanam ${tanaman}`;
  }

  // ===== PANEN =====
  if (msg === "panen") {
    if (user.lahan.length === 0) return "❌ Tidak ada tanaman";

    let hasil = user.lahan.length * 30;
    user.saldo += hasil;
    user.exp += 20;
    user.lahan = [];

    if (user.exp >= 100) {
      user.level++;
      user.exp = 0;
    }

    saveDB(db);
    return `🌾 Panen berhasil!\n💰 +${hasil}`;
  }

  // ===== KERJA =====
  if (msg === "kerja") {
    let now = Date.now();
    if (now - user.lastKerja < 60000)
      return "⏳ Tunggu 1 menit untuk kerja lagi";

    let gaji = 50 + user.level * 10;
    user.saldo += gaji;
    user.lastKerja = now;

    saveDB(db);
    return `💼 Kamu bekerja\n💰 +${gaji}`;
  }

  // ===== MANCING =====
  if (msg === "mancing") {
    if (user.energi <= 0) return "❌ Energi habis";

    let ikan = ["🐟 Lele", "🐠 Nila", "🐡 Tuna"];
    let hasil = ikan[Math.floor(Math.random() * ikan.length)];

    user.inventory[hasil] = (user.inventory[hasil] || 0) + 1;
    user.skill.fishing += 1;
    user.energi -= 1;

    saveDB(db);
    return `🎣 Kamu dapat ${hasil}`;
  }

  // ===== TAMBANG =====
  if (msg === "tambang") {
    if (user.energi <= 0) return "❌ Energi habis";

    let item = ["🪨 Batu", "⛓ Besi", "💎 Diamond"];
    let hasil = item[Math.floor(Math.random() * item.length)];

    user.inventory[hasil] = (user.inventory[hasil] || 0) + 1;
    user.skill.mining += 1;
    user.energi -= 1;

    saveDB(db);
    return `⛏ Kamu dapat ${hasil}`;
  }

  // ===== TERNAK =====
  if (msg === "ternak") {
    return `🐄 TERNAK

🐔 ayam - $20
🐑 domba - $50
🐄 sapi - $100

Ketik:
beli <hewan>`;
  }

  if (msg.startsWith("beli")) {
    let h = msg.split(" ")[2];
    let harga = { ayam: 20, domba: 50, sapi: 100 };

    if (!harga[h]) return "❌ Tidak ada";
    if (user.saldo < harga[h]) return "❌ Uang kurang";

    user.saldo -= harga[h];
    user.ternak.push({ jenis: h, lapar: false });

    saveDB(db);
    return `🐾 Membeli ${h}`;
  }

  // ===== MASAK =====
  if (msg === "masak") {
    return `🍳 RESEP

🥚 telur goreng
🥩 steak
🍲 sup

Ketik:
desa masak <menu>`;
  }

  // ===== PASAR GELAP =====
  if (msg === "gelap") {
    return `🕶 PASAR GELAP

💣 Bom - 100 emas
🧪 Elixir - 50 emas
🗝 Kunci Misteri - 200 emas`;
  }

  // ===== EVENT =====
  if (msg === "event") {
    return `☢ EVENT: UNDER THE DOME

kubah misterius datang...

Ketik:
masuk`;
  }

  if (msg === "masuk") {
    user.saldo += 200;
    user.emas += 50;

    saveDB(db);
    return `☢ Kamu selamat!\n💰 +200\n🥇 +50`;
  }

  // ===== INVENTORY =====
  if (msg === "inv") {
    let inv = Object.entries(user.inventory)
      .map(([k, v]) => `${k} x${v}`)
      .join("\n");

    return `🎒 INVENTORY\n\n${inv || "Kosong"}`;
  }

  return "❓ Tidak dikenal";
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
