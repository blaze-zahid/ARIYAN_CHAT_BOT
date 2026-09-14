const { getPrefix } = global.utils;

module.exports = {
	config: {
		name: "antilink",
		version: "2.0",
		author: "SK HABIBULLA",
		countDown: 3,
		role: 1,

		shortDescription: {
			en: "Anti-link protection",
			bn: "গ্রুপে লিংক পাঠানো বন্ধ করুন"
		},

		longDescription: {
			en: "Automatically removes and kicks members who send links. Group admins are ignored.",
			bn: "গ্রুপ অ্যাডমিন ছাড়া কেউ লিংক পাঠালে তার মেসেজ ডিলিট করে তাকে kick করবে।"
		},

		category: "moderation",

		guide: {
			en: "{pn} on/off",
			bn: "{pn} on/off"
		}
	},

	langs: {
		en: {
			on: "🔗 Anti-link has been turned ON.",
			off: "🔗 Anti-link has been turned OFF.",
			usage: "Usage: {pn} on / {pn} off",
			botAdmin: "❌ Bot must be a group admin.",
			error: "❌ Something went wrong."
		},

		bn: {
			on: "🔗 Anti-link চালু করা হয়েছে।\n\n⚠️ Admin ছাড়া কেউ link দিলে তাকে kick করা হবে।",
			off: "🔗 Anti-link বন্ধ করা হয়েছে।",
			usage: "ব্যবহার করুন: {pn} on / {pn} off",
			botAdmin: "❌ Bot-কে আগে Group Admin করতে হবে।",
			error: "❌ কোনো সমস্যা হয়েছে।"
		}
	},

	// =====================================
	// ON / OFF
	// =====================================

	onStart: async function ({
		message,
		args,
		event,
		threadsData,
		api,
		getLang
	}) {
		const threadID = event.threadID;
		const prefix = getPrefix(threadID);

		const option = args[0]?.toLowerCase();

		if (!["on", "off"].includes(option)) {
			return message.reply(
				getLang("usage")
					.replace("{pn}", prefix + "antilink")
			);
		}

		// Check bot admin
		try {
			const threadInfo =
				await api.getThreadInfo(threadID);

			const botID =
				String(api.getCurrentUserID());

			const adminIDs =
				(threadInfo.adminIDs || [])
					.map(admin => String(admin.id));

			if (!adminIDs.includes(botID)) {
				return message.reply(
					getLang("botAdmin")
				);
			}
		} catch (error) {
			console.error(
				"[ANTILINK] Admin check:",
				error
			);

			return message.reply(
				getLang("botAdmin")
			);
		}

		// Save setting
		try {
			await threadsData.set(
				threadID,
				option === "on",
				"data.antilink"
			);

			return message.reply(
				option === "on"
					? getLang("on")
					: getLang("off")
			);

		} catch (error) {
			console.error(
				"[ANTILINK] Save error:",
				error
			);

			return message.reply(
				getLang("error")
			);
		}
	},

	// =====================================
	// LINK DETECTION
	// =====================================

	onChat: async function ({
		event,
		api,
		threadsData
	}) {
		const threadID = event.threadID;
		const senderID = event.senderID;

		if (!senderID || !event.body)
			return;

		// Check Anti-link status
		let enabled = false;

		try {
			const threadData =
				await threadsData.get(threadID);

			enabled =
				threadData?.data?.antilink === true;

		} catch (error) {
			console.error(
				"[ANTILINK] Get data error:",
				error
			);
			return;
		}

		if (!enabled)
			return;

		// =====================================
		// LINK REGEX
		// =====================================

		const linkRegex =
			/(https?:\/\/|www\.|[a-zA-Z0-9-]+\.(com|net|org|me|io|co|xyz|top|site|online|live|tk|ml|ga|cf|gg|ly|be|cc)(\/|\b))/i;

		if (!linkRegex.test(event.body))
			return;

		// =====================================
		// GET GROUP ADMINS
		// =====================================

		let threadInfo;

		try {
			threadInfo =
				await api.getThreadInfo(threadID);
		} catch (error) {
			console.error(
				"[ANTILINK] Thread info error:",
				error
			);
			return;
		}

		const adminIDs =
			(threadInfo.adminIDs || [])
				.map(admin => String(admin.id));

		// Admins are allowed to send links
		if (
			adminIDs.includes(
				String(senderID)
			)
		) {
			return;
		}

		// =====================================
		// DELETE LINK MESSAGE
		// =====================================

		if (event.messageID) {
			try {
				await api.unsendMessage(
					event.messageID
				);
			} catch (error) {
				console.log(
					"[ANTILINK] Cannot delete message:",
					error.message
				);
			}
		}

		// =====================================
		// KICK MEMBER
		// =====================================

		try {
			await api.removeUserFromGroup(
				senderID,
				threadID
			);

			await api.sendMessage(
				"╔════════════════════╗\n" +
				"║   🚫 𝗔𝗡𝗧𝗜𝗟𝗜𝗡𝗞   ║\n" +
				"╚════════════════════╝\n\n" +
				"⚠️ Link পাঠানো নিষিদ্ধ!\n" +
				"👤 Member removed from group.\n" +
				"🔗 Reason: Sending link.",
				threadID
			);

		} catch (error) {
			console.error(
				"[ANTILINK] Kick error:",
				error
			);

			try {
				await api.sendMessage(
					"⚠️ Link detected!\n" +
					"❌ Member-কে kick করা যায়নি।\n" +
					"Bot-এর Group Admin permission check করুন.",
					threadID
				);
			} catch (e) {}
		}
	}
};
