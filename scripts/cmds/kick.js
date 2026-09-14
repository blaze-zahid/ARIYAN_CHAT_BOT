module.exports = {
	config: {
		name: "kick",
		version: "2.0",
		author: "NTKhang | Fixed by SK HABIBULLA",
		countDown: 5,
		role: 1,

		description: {
			vi: "Kick thành viên khỏi box chat",
			en: "Kick member out of the chat"
		},

		category: "owner",

		guide: {
			vi: "   {pn} @tags: kick người được tag\n"
				+ "   {pn}: reply tin nhắn của người cần kick",

			en: "   {pn} @tags: kick tagged members\n"
				+ "   {pn}: reply to the message of the member you want to kick"
		}
	},

	langs: {
		vi: {
			needAdmin:
				"❌ Bot cần quyền quản trị viên để sử dụng lệnh này.",

			noTarget:
				"❌ Vui lòng tag thành viên hoặc reply tin nhắn của thành viên cần kick.",

			success:
				"✅ Đã kick thành viên khỏi nhóm.",

			error:
				"❌ Không thể kick thành viên. Hãy kiểm tra quyền admin của bot.",

			self:
				"❌ Không thể kick chính bot."
		},

		en: {
			needAdmin:
				"❌ Bot must be a group admin to use this command.",

			noTarget:
				"❌ Please tag a member or reply to their message.",

			success:
				"✅ Member has been kicked from the group.",

			error:
				"❌ Unable to kick the member. Please check the bot's admin permission.",

			self:
				"❌ I can't kick myself."
		}
	},

	onStart: async function ({
		message,
		event,
		threadsData,
		api,
		getLang
	}) {

		const threadID = event.threadID;
		const botID = api.getCurrentUserID();

		// ==========================================
		// CHECK BOT ADMIN
		// ==========================================

		const adminIDs =
			await threadsData.get(
				threadID,
				"adminIDs"
			);

		if (
			!Array.isArray(adminIDs) ||
			!adminIDs.includes(botID)
		) {
			return message.reply(
				getLang("needAdmin")
			);
		}

		// ==========================================
		// TARGET USER LIST
		// ==========================================

		let targetIDs = [];

		// ==========================================
		// REPLY METHOD
		// ==========================================

		if (event.messageReply) {

			const targetID =
				event.messageReply.senderID;

			if (targetID) {
				targetIDs.push(targetID);
			}
		}

		// ==========================================
		// MENTION METHOD
		// ==========================================

		const mentions =
			event.mentions || {};

		const mentionIDs =
			Object.keys(mentions);

		if (mentionIDs.length > 0) {
			targetIDs.push(...mentionIDs);
		}

		// ==========================================
		// REMOVE DUPLICATES
		// ==========================================

		targetIDs = [
			...new Set(targetIDs)
		];

		// ==========================================
		// NO TARGET
		// ==========================================

		if (targetIDs.length === 0) {
			return message.reply(
				getLang("noTarget")
			);
		}

		// ==========================================
		// DON'T KICK BOT
		// ==========================================

		targetIDs =
			targetIDs.filter(
				uid =>
					String(uid) !==
					String(botID)
			);

		if (targetIDs.length === 0) {
			return message.reply(
				getLang("self")
			);
		}

		// ==========================================
		// KICK USERS
		// ==========================================

		let successCount = 0;
		let failedCount = 0;

		for (const uid of targetIDs) {

			try {

				await api.removeUserFromGroup(
					uid,
					threadID
				);

				successCount++;

			} catch (error) {

				console.error(
					`[KICK] Failed to kick ${uid}:`,
					error.message
				);

				failedCount++;
			}
		}

		// ==========================================
		// RESULT MESSAGE
		// ==========================================

		if (
			successCount === 0 &&
			failedCount > 0
		) {
			return message.reply(
				getLang("error")
			);
		}

		if (failedCount === 0) {

			return message.reply(
				`╔════════════════════╗
║     ⚡ 𝗞𝗜𝗖𝗞𝗘𝗗 ⚡     ║
╚════════════════════╝

✅ Successfully kicked: ${successCount}

👮 Action: Group Moderation
🤖 Bot: Online`
			);
		}

		return message.reply(
			`╔════════════════════╗
║    ⚡ 𝗞𝗜𝗖𝗞 𝗥𝗘𝗦𝗨𝗟𝗧 ⚡    ║
╚════════════════════╝

✅ Kicked: ${successCount}
❌ Failed: ${failedCount}`
		);
	}
};
