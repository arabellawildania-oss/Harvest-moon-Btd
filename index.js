const express = require("express");
const axios = require("axios");
const fs = require("fs");

const app = express();
app.use(express.json());

const PORT = 3000;
const TOKEN = "";

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
    db.users[id] = { saldo: 100 };
    saveDB(db);
    return "🌾 Selamat datang di Harvest Moon!\nKetik: desa info";
  }

  let user = db.users[id];

  if (msg === "desa info") {
    return `🌾 HARVEST MOON\nSaldo: ${user.saldo}`;
  }

  return "❓ Tidak dikenal";
}

// WEBHOOK
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

// ROOT
app.get("/", (req, res) => {
  res.send("BOT AKTIF 🔥");
});

app.listen(PORT, () => {
  console.log("Server jalan");
});
