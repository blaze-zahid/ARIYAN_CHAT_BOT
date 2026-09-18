module.exports = {
  config: {
    name: "kickall",
    version: "3.0",
    author: "NEXXO",
    countDown: 10,
    role: 2,
    shortDescription: {
      en: "Remove group members"
    },
    longDescription: {
      en: "Remove group members except the bot"
    },
    category: "owner",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, message }) {
    const threadID = event.threadID;

    try {
      const botID = String(api.getCurrentUserID());

      const info = await api.getThreadInfo(threadID);

      if (!info) {
        return message.reply("❌ Cannot get group information.");
      }

      // Get admin IDs
      const adminIDs = (info.adminIDs || []).map(admin =>
        String(typeof admin === "object" ? admin.id : admin)
      );

      // Check bot admin
      if (!adminIDs.includes(botID)) {
        return message.reply(
          "❌ BOT IS NOT ADMIN\n\n" +
          "Make the bot account an admin of this group and try again."
        );
      }

      // Get participants
      const participants = (info.participantIDs || []).map(String);

      // Don't remove bot
      const targets = participants.filter(id => id !== botID);

      if (!targets.length) {
        return message.reply("❌ No members found.");
      }

      await message.reply(
        `⚠️ Starting...\n\n` +
        `👥 Total member: ${targets.length}\n` +
        `🤖 Bot: protected`
      );

      let success = 0;
      let failed = 0;

      for (const userID of targets) {
        try {
          await new Promise((resolve, reject) => {
            api.removeUserFromGroup(
              userID,
              threadID,
              err => {
                if (err) reject(err);
                else resolve();
              }
            );
          });

          success++;

          // Prevent requests from being sent too quickly
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (err) {
          failed++;

          console.log(
            `[KICKALL] Failed ${userID}:`,
            err?.message || err
          );
        }
      }

      return message.reply(
        `✅ KICKALL FINISHED\n\n` +
        `👤 Removed: ${success}\n` +
        `❌ Failed: ${failed}`
      );

    } catch (err) {
      console.error("[KICKALL ERROR]", err);

      return message.reply(
        `❌ ERROR\n\n${err?.message || err}`
      );
    }
  }
};
