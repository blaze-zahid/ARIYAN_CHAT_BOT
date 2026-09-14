const { getPrefix } = global.utils;

module.exports = {
	config: {
		name: "antilink",
		version: "1.0",
		author: "SK HABIBULLA",
		countDown: 5,
		role: 1,
		shortDescription: {
			en: "Enable or disable anti-link",
			bn: "গ্রুপে অ্যান্টি-লিংক চালু বা বন্ধ করুন"
		},
		longDescription: {
			en: "Automatically removes members who send links. Group admins are exempt.",
			bn: "গ্রুপ অ্যাডমিন ছাড়া কেউ লিংক পাঠালে তাকে গ্রুপ থেকে রিমুভ করবে।"
		},
		category: "moderation",
		guide: {
			en: "{pn} on | off",
			bn: "{pn} on | off"
		}
	},

	onStart: async function ({ message, args, event, threadsData }) {
		const threadID = event.threadID;
		const prefix = getPrefix(threadID);

		const option = args[0]?.toLowerCase();

		if (!["on", "off"].includes(option)) {
			return message.reply(
				`╔════════════════════╗
║   🔗 𝗔𝗡𝗧𝗜𝗟𝗜𝗡𝗞   ║
╚════════════════════╝

📌 Usage:
➜ ${prefix}antilink on
➜ ${prefix}antilink off

⚡ ON  = Link দিলে kick
🔕 OFF = Anti-link বন্ধ`
			);
		}

		await threadsData.set(
			threadID,
			option === "on",
			"data.antilink"
		);

		return message.reply(
			option === "on"
				? "╔════════════════════╗\n║ 🔗 𝗔𝗡𝗧𝗜𝗟𝗜𝗡𝗞 𝗢𝗡 ✅ ║\n╚════════════════════╝\n\n⚠️ Admin ছাড়া কেউ link দিলে তাকে group থেকে kick করা হবে."
				: "╔════════════════════╗\n║ 🔗 𝗔𝗡𝗧𝗜𝗟𝗜𝗡𝗞 𝗢𝗙𝗙 ❌ ║\n╚════════════════════╝\n\nAnti-link এখন বন্ধ।"
		);
	},

	onChat: async function ({ event, api, threadsData }) {
		const threadID = event.threadID;

		// Anti-link enabled?
		const threadData = await threadsData.get(threadID);

		if (!threadData?.data?.antilink) return;

		const messageBody = event.body || "";

		// URL detection
		const linkRegex =
			/(https?:\/\/[^\s]+|www\.[^\s]+|(?:https?:\/\/)?(?:www\.)?(facebook|fb|instagram|youtube|youtu\.be|tiktok|telegram|wa\.me|whatsapp|discord|twitter|x\.com|bit\.ly|tinyurl\.com)[^\s]*)/i;

		if (!linkRegex.test(messageBody)) return;

		const senderID = event.senderID;

		if (!senderID) return;

		try {
			// Get group information
			const threadInfo =
				await api.getThreadInfo(threadID);

			const adminIDs =
				threadInfo.adminIDs || [];

			// Check if sender is group admin
			const isAdmin = adminIDs.some(
				admin => String(admin.id) === String(senderID)
			);

			// Admin can send links
			if (isAdmin) return;

			// Delete the link message first
			if (event.messageID) {
				try {
					await api.unsendMessage(
						event.messageID
					);
				} catch (e) {}
			}

			// Kick member
			await api.removeUserFromGroup(
				senderID,
				threadID
			);

			return api.sendMessage(
				`🚫 | Link detected!\n\n👤 Member: ${event.senderID}\n⚡ Action: Kicked\n🔗 Reason: Sending link is not allowed.`,
				threadID
			);

		} catch (error) {
			console.error(
				"[ANTILINK ERROR]",
				error
			);

			return api.sendMessage(
				"❌ | Link detect হয়েছে, কিন্তু member-কে kick করা যায়নি। Bot-এর group admin permission আছে কিনা check করুন.",
				threadID
			);
		}
	}
};
