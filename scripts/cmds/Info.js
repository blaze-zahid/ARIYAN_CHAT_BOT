const moment = require("moment-timezone");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "info",
    aliases: ["admininfo", "botinfo", "mamun", "ownerinfo", "owner"],
    version: "1.5",
    author: "— 𝚳 𝚨 Ꭱ 𝐂 𝚶 ⤹ ☕",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Show bot & owner info" },
    longDescription: { en: "Display detailed information about the bot and owner" },
    category: "owner",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message, api }) {

    // ========== OWNER INFO ==========
    const authorName = "— 𝚳 𝚨 Ꭱ 𝐂 𝚶 ⤹ ☕";
    const ownAge = "18+";
    const messenger = "https://m.me/Bhodro.habib";
    const authorFB = "Zahid Talukdar";
    const authorNumber = "8801863229224";
    const Status = "Single";

    // Facebook Profile ID (এখানে তোমার FB ID দাও)
    const OWNER_FB_ID = "100077365033183";

    // ========== TIME ==========
    const now = moment().tz("Asia/Dhaka");
    const date = now.format("MMMM Do YYYY");
    const time = now.format("h:mm:ss A");

    // ========== UPTIME ==========
    const uptime = process.uptime();
    const seconds = Math.floor(uptime % 60);
    const minutes = Math.floor((uptime / 60) % 60);
    const hours = Math.floor((uptime / 3600) % 24);
    const days = Math.floor(uptime / 86400);
    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const text =
`✨《 BOT & OWNER INFORMATION 》🎀

🤖 Bot Name: ${global.GoatBot.config.nickNameBot}

👾 Prefix: ${global.GoatBot.config.prefix}

💙 Owner Name: ${authorName}

💕 Relationship: ${Status}

📞 WhatsApp: ${authorNumber}

🌍 Facebook: ${authorFB}

🗓 Date: ${date}

⏰ Time: ${time}

🔰 Contact Owner: ${messenger}

📛 Bot Uptime: ${uptimeString}

==============================`;

    // ========== IMAGE LOAD (Facebook DP) ==========
    let attachment = null;
    try {
      const imgUrl = `https://graph.facebook.com/${OWNER_FB_ID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const res = await axios.get(imgUrl, {
        responseType: "arraybuffer",
        timeout: 12000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      });

      const tempPath = path.join(__dirname, "cache", "owner_info.jpg");
      await fs.ensureDir(path.dirname(tempPath));
      await fs.writeFile(tempPath, Buffer.from(res.data));
      attachment = fs.createReadStream(tempPath);
    } catch (err) {
      console.log("[info] Image load failed:", err.message);
    }

    // ========== SEND ==========
    if (attachment) {
      return message.reply({
        body: text,
        attachment
      });
    } else {
      return message.reply(text + "\n\n⚠️ Image load failed");
    }
  },

  onChat: async function ({ event, message }) {
    if (event.body?.toLowerCase() === "info") {
      return this.onStart({ message });
    }
  }
};
