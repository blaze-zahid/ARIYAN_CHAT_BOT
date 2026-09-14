module.exports = {
	config: {
		name: "kick",
		version: "2.0",
		author: "SK HABIBULLA",
		countDown: 5,
		role: 1,

		description: {
			bn: "গ্রুপ থেকে সদস্য রিমুভ করুন",
			en: "Kick member out of the group"
		},

		category: "owner",

		guide: {
			bn: "{pn} @mention অথবা মেসেজে reply করে",
			en: "{pn} @mention or reply to a message"
		}
	},

	langs: {
		bn: {
			needAdmin: "❌ | Bot-এর গ্রুপ অ্যাডমিন পারমিশন নেই।",
			noTarget: "❌ | যাকে kick করতে চান তাকে @mention করুন অথবা তার মেসেজে reply করুন।",
			success: "✅ | সদস্যকে গ্রুপ থেকে রিমুভ করা হয়েছে।",
			failed: "❌ | সদস্যকে রিমুভ করা যায়নি।",
			cannotKickAdmin: "⚠️ | গ্রুপ অ্যাডমিনকে kick করা যাবে না।"
		},

		en: {
			needAdmin: "❌ | Bot is not a group admin.",
			noTarget: "❌ | Mention a member or reply to their message.",
			success: "✅ | Member removed from the group.",
			failed: "❌ | Failed to remove member.",
			cannotKickAdmin: "⚠️ | Group admins cannot be kicked."
		}
	},

	onStart: async function ({
		message,
		event,
		api,
		getLang
	}) {
		const threadID = event.threadID;
		const botID = api.getCurrentUserID();

		// =====================================
		// CHECK BOT GROUP ADMIN
		// =====================================

		let threadInfo;

		try {
			threadInfo = await api.getThreadInfo(threadID);
		} catch (error) {
			console.error("[KICK] Thread info error:", error);

			return message.reply(
				getLang("needAdmin")
			);
		}

		const adminIDs = (threadInfo.adminIDs || [])
			.map(admin => String(admin.id));

		if (!adminIDs.includes(String(botID))) {
			return message.reply(
				getLang("needAdmin")
			);
		}

		// =====================================
		// FIND TARGET USER
		// =====================================

		let targetUID = null;

		// Reply message
		if (event.messageReply) {
			targetUID = event.messageReply.senderID;
		}

		// Mention
		else if (
			event.mentions &&
			Object.keys(event.mentions).length > 0
		) {
			targetUID =
				Object.keys(event.mentions)[0];
		}

		// No target
		if (!targetUID) {
			return message.reply(
				getLang("noTarget")
			);
		}

		targetUID = String(targetUID);

		// =====================================
		// DON'T KICK BOT
		// =====================================

		if (targetUID === String(botID)) {
			return message.reply(
				"⚠️ | আমি নিজেকে kick করতে পারি না।"
			);
		}

		// =====================================
		// DON'T KICK GROUP ADMIN
		// =====================================

		if (adminIDs.includes(targetUID)) {
			return message.reply(
				getLang("cannotKickAdmin")
			);
		}

		// =====================================
		// REMOVE USER
		// =====================================

		try {
			await api.removeUserFromGroup(
				targetUID,
				threadID
			);

			return message.reply(
				getLang("success")
			);

		} catch (error) {
			console.error(
				"[KICK ERROR]",
				error
			);

			return message.reply(
				getLang("failed")
			);
		}
	}
};
