const os = require("os");

module.exports = {
  config: {
    name: "uptime",
    version: "4.0",
    author: "〲MAMUNツ࿐ T.T o.O",
    countDown: 5,
    role: 0,
    shortDescription: "Premium bot system status",
    longDescription: "Display detailed bot uptime, ping, CPU and RAM information",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    const start = Date.now();

    // ───────────── UPTIME ─────────────
    const uptime = process.uptime();

    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const uptimeText =
      `${days}d ${hours}h ${minutes}m ${seconds}s`;

    // ───────────── MEMORY ─────────────
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const totalGB = (totalMem / 1024 ** 3).toFixed(2);
    const usedGB = (usedMem / 1024 ** 3).toFixed(2);
    const freeGB = (freeMem / 1024 ** 3).toFixed(2);

    const ramPercent = ((usedMem / totalMem) * 100).toFixed(1);

    // ───────────── CPU ─────────────
    const cpu = os.cpus();
    const cpuModel = cpu[0]?.model || "Unknown";
    const cpuCores = cpu.length;

    // ───────────── PING ─────────────
    const ping = Date.now() - start;

    let pingStatus;

    if (ping < 100) {
      pingStatus = "🟢 Excellent";
    } else if (ping < 300) {
      pingStatus = "🟡 Good";
    } else {
      pingStatus = "🔴 Slow";
    }

    // ───────────── PLATFORM ─────────────
    const platform = os.platform();
    const arch = os.arch();
    const nodeVersion = process.version;

    // ───────────── MESSAGE ─────────────
    const msg = `
╭━━━━━━━━━━━━━━━━━━━━━━╮
      ✦ 𝙋𝙊𝙊𝙆𝙄𝙀 𝙎𝙔𝙎𝙏𝙀𝙈 ✦
        𝙋𝙍𝙀𝙈𝙄𝙐𝙈 𝙎𝙏𝘼𝙏𝙐𝙎
╰━━━━━━━━━━━━━━━━━━━━━━╯

🤖 𝘽𝙤𝙩
   └─ 𝙋𝙊𝙊𝙆𝙄𝙀 ᥫ᭡🎀🙂

👑 𝙊𝙬𝙣𝙚𝙧
   └─ 𝐙𝐚𝐡𝐢𝐝 𝐓𝐚𝐥𝐮𝐤𝐝𝐚𝐫 ❤️‍🩹

⏱️ 𝙐𝙥𝙩𝙞𝙢𝙚
   └─ ${uptimeText}

⚡ 𝙋𝙞𝙣𝙜
   └─ ${ping} ms
   └─ ${pingStatus}

💻 𝘾𝙋𝙐
   └─ ${cpuModel}
   └─ ${cpuCores} Cores

💾 𝙍𝘼𝙈
   └─ Used : ${usedGB} GB
   └─ Free : ${freeGB} GB
   └─ Total: ${totalGB} GB
   └─ Usage: ${ramPercent}%

📡 𝙎𝙮𝙨𝙩𝙚𝙢
   └─ ${platform} / ${arch}

🟢 𝙉𝙤𝙙𝙚.𝙟𝙨
   └─ ${nodeVersion}

━━━━━━━━━━━━━━━━━━━━━━━━
       ✦ 𝙎𝙔𝙎𝙏𝙀𝙈 𝙊𝙉𝙇𝙄𝙉𝙀 ✦
━━━━━━━━━━━━━━━━━━━━━━━━
`;

    return message.reply(msg);
  },

  onChat: async function ({ event, message }) {
    if (!event.body) return;

    if (event.body.toLowerCase().trim() !== "uptime") return;

    const uptime = process.uptime();

    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const ramPercent =
      ((usedMem / totalMem) * 100).toFixed(1);

    const msg = `
╭━━━━━━━━━━━━━━━━━━━━╮
     ✦ 𝙋𝙊𝙊𝙆𝙄𝙀 𝙐𝙋𝙏𝙄𝙈𝙀 ✦
╰━━━━━━━━━━━━━━━━━━━━╯

⏰ 𝙐𝙥𝙩𝙞𝙢𝙚
➜ ${days}d ${hours}h ${minutes}m ${seconds}s

💾 𝙍𝘼𝙈 𝙐𝙨𝙖𝙜𝙚
➜ ${ramPercent}%

🟢 𝙎𝙩𝙖𝙩𝙪𝙨
➜ 𝙊𝙉𝙇𝙄𝙉𝙀

╰━━━━━━━━━━━━━━━━━━━━╯
       𝙋𝙊𝙊𝙆𝙄𝙀 ᥫ᭡🎀
`;

    return message.reply(msg);
  }
};
