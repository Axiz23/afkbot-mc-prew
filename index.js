const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public")); // Folder untuk frontend

// Konfigurasi bot Minecraft
const bot = mineflayer.createBot({
    host: "gold.magmanode.com", // Ganti dengan IP server
    port: 29206, // Port server (default: 25565)
    username: "BotKu", // Username bot
    version: "1.20.1", // Sesuaikan versi Minecraft
});

bot.loadPlugin(pathfinder);

// Event saat bot terhubung ke server
bot.once("spawn", () => {
    console.log("Bot berhasil masuk ke server!");

    // Plugin Pathfinder
    const mcData = require("minecraft-data")(bot.version);
    const defaultMove = new Movements(bot, mcData);
    bot.pathfinder.setMovements(defaultMove);
});

// Event saat bot menerima pesan di chat
bot.on("chat", (username, message) => {
    if (username === bot.username) return;

    // Format perintah: "@BotKu jalan ke x y z"
    if (message.startsWith("@BotKu jalan ke")) {
        const coords = message.match(/(\d+),\s*(-?\d+),\s*(-?\d+)/);
        if (coords) {
            const x = parseInt(coords[1]);
            const y = parseInt(coords[2]);
            const z = parseInt(coords[3]);
            bot.pathfinder.setGoal(new goals.GoalBlock(x, y, z));
            bot.chat(`Menuju ke ${x} ${y} ${z}`);
        }
    }

    // Format perintah: "@BotKu /command"
    if (message.startsWith("@BotKu /")) {
        const command = message.slice(7);
        bot.chat(`Menjalankan perintah: ${command}`);
        bot.chat(`/` + command);
    }
});

// Event saat bot terputus
bot.on("end", () => {
    console.log("Bot terputus! Mencoba reconnect...");
    setTimeout(() => {
        bot.connect();
    }, 5000);
});

// WebSocket untuk komunikasi dengan frontend
io.on("connection", (socket) => {
    console.log("User terhubung ke WebSocket");

    // Kirim command ke bot dari Web UI
    socket.on("command", (command) => {
        console.log(`Perintah dari Web: ${command}`);
        bot.chat(command);
    });

    // Perintah untuk bergerak ke koordinat dari Web UI
    socket.on("moveTo", (coords) => {
        const { x, y, z } = coords;
        bot.pathfinder.setGoal(new goals.GoalBlock(x, y, z));
        bot.chat(`Menuju ke ${x} ${y} ${z}`);
    });
});

const PORT = 4000;
server.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});