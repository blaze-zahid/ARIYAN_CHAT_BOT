module.exports = {
  config: {
    name: "kickall",
    version: "2.0",
    author: "NEXXO",
    countDown: 10,
    role: 2,
    shortDescription: {
      en: "Kick all members from the group"
    },
    longDescription: {
      en: "Remove all group members except the command user and the bot"
    },
    category: "owner",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const threadID = event.threadID;
    const senderID = event.senderID;

    try {
      const botID = api.getCurrentUserID();
      const threadInfo = await api.getThreadInfo(threadID);

      // Check whether the bot is a group admin
      const adminIDs = (threadInfo.adminIDs || []).map(admin =>
        typeof admin === "object" ? String(admin.id) : String(admin)
      );

      if (!adminIDs.includes(String(botID))) {
        return api.sendMessage(
          "❌ Bot must be a group admin before using this command.",
          threadID
        );
      }

      // Members who will NOT be removed
      const protectedIDs = [
        String(senderID),
        String(botID)
      ];

      // Get members to remove
      const membersToKick = (threadInfo.participantIDs || [])
        .map(String)
        .filter(id => !protectedIDs.includes(id));

      if (membersToKick.length === 0) {
        return api.sendMessage(
          "❌ There are no members available to kick.",
          threadID
        );
      }

      await api.sendMessage(
        `⚠️ Starting kickall...\n👥 Members to remove: ${membersToKick.length}`,
        threadID
      );

      let success = 0;
      let failed = 0;

      // Remove members one by one
      for (const userID of membersToKick) {
        try {
          await api.removeUserFromGroup(userID, threadID);
          success++;

          // Small delay to reduce rate-limit problems
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          failed++;
          console.log(
            `Failed to remove ${userID}:`,
            error?.message || error
          );
        }
      }

      return api.sendMessage(
        `✅ Kickall finished.\n\n` +
        `👤 Removed: ${success}\n` +
        `❌ Failed: ${failed}\n` +
        `🛡️ Protected: You + Bot`,
        threadID
      );

    } catch (error) {
      console.error("kickall error:", error);

      return api.sendMessage(
        `❌ Kickall failed.\n\n` +
        `Reason: ${error?.message || "Unknown error"}`,
        threadID
      );
    }
  }
};

Important: "role: 2" means only the bot owner/admin level defined by your GoatBot system can execute "kickall"; it does not make the bot a Facebook group admin. The bot's Facebook account itself must have group-admin privileges for "removeUserFromGroup()" to work.

Also, this version intentionally protects the command sender and the bot, so it won't remove either of them.
