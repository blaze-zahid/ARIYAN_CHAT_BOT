const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

// ===============================
// SETTINGS
// ===============================

const cacheDir = path.join(__dirname, "cache");
const imagePath = path.join(cacheDir, "help_avatar.jpg");

// Facebook UID
const TARGET_UID = "100028959431665";

// ⚠️ নিজের valid token ব্যবহার করো
const FB_ACCESS_TOKEN =
	"6628568379|c1e620fa708a1d5696fb991c1bde5662";

// Auto delete time
const AUTO_UNSEND_TIME = 80000;

// Create cache folder
if (!fs.existsSync(cacheDir)) {
	fs.mkdirSync(cacheDir, { recursive: true });
}

// ===============================
// COMMAND CONFIG
// ===============================

module.exports = {
	config: {
		name: "help",
		version: "3.0",
		author: "SK HABIBULLA",

		countDown: 5,
		role: 0,

		shortDescription: {
			en: "View command usage and command list",
			bn: "কমান্ডের তালিকা এবং ব্যবহার দেখুন",
			vi: "Xem danh sách và cách sử dụng lệnh"
		},

		longDescription: {
			en: "View all available commands or get detailed information about a specific command.",
			bn: "সব available কমান্ডের তালিকা দেখুন অথবা নির্দিষ্ট কোনো কমান্ডের বিস্তারিত তথ্য দেখুন।",
			vi: "Xem tất cả lệnh có sẵn hoặc thông tin chi tiết về một lệnh cụ thể."
		},

		category: "info",

		guide: {
			en: "{pn} [command]",
			bn: "{pn} [কমান্ড]",
			vi: "{pn} [tên lệnh]"
		},

		priority: 1
	},

	// ===============================
	// ON START
	// ===============================

	onStart: async function ({
		message,
		args,
		event,
		threadsData,
		role
	}) {
		const { threadID } = event;

		// ===============================
		// THREAD DATA
		// ===============================

		const threadData = await threadsData.get(threadID);

		const prefix = getPrefix(threadID);

		const langCode =
			threadData?.data?.lang ||
			global.GoatBot?.config?.language ||
			"en";

		// ===============================
		// LOAD AVATAR
		// ===============================

		let attachment = [];

		try {
			const avatarUrl =
				`https://graph.facebook.com/${TARGET_UID}/picture` +
				`?width=720&height=720&access_token=${FB_ACCESS_TOKEN}`;

			const res = await axios.get(avatarUrl, {
				responseType: "arraybuffer",
				timeout: 15000
			});

			await fs.writeFile(
				imagePath,
				Buffer.from(res.data)
			);

			attachment = [
				fs.createReadStream(imagePath)
			];

		} catch (error) {
			console.log(
				"[HELP] Avatar load failed:",
				error.message
			);

			attachment = [];
		}

		// ===============================
		// MAIN HELP LIST
		// ===============================

		if (args.length === 0) {
			const categories = {};

			for (const [name, command] of commands) {
				if (!command || !command.config) continue;

				const category =
					command.config.category ||
					"Uncategorized";

				if (!categories[category]) {
					categories[category] = [];
				}

				if (!categories[category].includes(name)) {
					categories[category].push(name);
				}
			}

			let msg = "";

			// Header
			msg +=
				"╔════════════════════════════╗\n" +
				"║     ⚡ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗟𝗜𝗦𝗧 ⚡     ║\n" +
				"╚════════════════════════════╝\n";

			// Categories
			const sortedCategories =
				Object.keys(categories).sort();

			for (const category of sortedCategories) {
				const names =
					categories[category].sort(
						(a, b) =>
							a.localeCompare(b)
					);

				msg +=
					`\n┏━━━ 『 ${category.toUpperCase()} 』 ━━━┓\n`;

				for (const commandName of names) {
					msg +=
						`┃ ✦ ${commandName}\n`;
				}

				msg +=
					"┗━━━━━━━━━━━━━━━━━━━━━━┛\n";
			}

			// Total command count
			const totalCommands = commands.size;

			let helpHint;

			if (langCode === "bn") {
				helpHint =
					`বিস্তারিত দেখতে ${prefix}help <কমান্ড> লিখুন।`;
			} else if (langCode === "vi") {
				helpHint =
					`Nhập ${prefix}help <lệnh> để xem chi tiết.`;
			} else {
				helpHint =
					`Type ${prefix}help <command> to see details.`;
			}

			msg +=
				"\n┌──────────────────────────┐\n" +
				`│ 📦 Total Commands : ${totalCommands}\n` +
				`│ 💡 ${helpHint}\n` +
				"└──────────────────────────┘\n\n";

			// Footer
			msg +=
				"╭──────────────────────────╮\n" +
				"│ ♡ ADMIN : — 𝚳 𝚨 Ꭱ 𝐂 𝚶 ⤹ ☕\n" +
				"│ ☎ WHATSAPP : 8801863229224\n" +
				"╰──────────────────────────╯";

			// Send message
			try {
				const sentMessage =
					await message.reply({
						body: msg,
						attachment
					});

				// Auto unsend
				setTimeout(() => {
					message
						.unsend(sentMessage.messageID)
						.catch(() => {});
				}, AUTO_UNSEND_TIME);

			} catch (error) {
				console.error(
					"[HELP] Message Error:",
					error
				);

				await message.reply(msg);
			}

			return;
		}

		// ===============================
		// SINGLE COMMAND INFORMATION
		// ===============================

		const commandName =
			args[0].toLowerCase();

		let command =
			commands.get(commandName);

		// Check aliases
		if (!command) {
			const aliasTarget =
				aliases.get(commandName);

			if (aliasTarget) {
				command =
					commands.get(aliasTarget);
			}
		}

		// Command not found
		if (!command) {
			let notFound;

			if (langCode === "bn") {
				notFound =
					`❌ | "${commandName}" নামে কোনো কমান্ড পাওয়া যায়নি।\n\n` +
					`💡 ${prefix}help লিখে সব কমান্ড দেখুন।`;
			} else if (langCode === "vi") {
				notFound =
					`❌ | Không tìm thấy lệnh "${commandName}".\n\n` +
					`💡 Nhập ${prefix}help để xem tất cả lệnh.`;
			} else {
				notFound =
					`❌ | Command "${commandName}" not found.\n\n` +
					`💡 Type ${prefix}help to view all commands.`;
			}

			return message.reply(notFound);
		}

		const config = command.config;

		// ===============================
		// LANGUAGE LABELS
		// ===============================

		const labels = {
			bn: {
				name: "নাম",
				alias: "ডাকনাম",
				desc: "বর্ণনা",
				author: "লেখক",
				guide: "নির্দেশনা",
				category: "ক্যাটাগরি",
				version: "ভার্সন",
				role: "অনুমতি",
				none: "নেই",
				unknown: "অজানা"
			},

			en: {
				name: "NAME",
				alias: "ALIASES",
				desc: "DESCRIPTION",
				author: "AUTHOR",
				guide: "GUIDE",
				category: "CATEGORY",
				version: "VERSION",
				role: "ROLE",
				none: "None",
				unknown: "Unknown"
			},

			vi: {
				name: "Tên",
				alias: "Tên khác",
				desc: "Mô tả",
				author: "Tác giả",
				guide: "Hướng dẫn",
				category: "Danh mục",
				version: "Phiên bản",
				role: "Quyền hạn",
				none: "Không có",
				unknown: "Không xác định"
			}
		};

		const lb =
			labels[langCode] ||
			labels.en;

		// ===============================
		// DESCRIPTION
		// ===============================

		const desc =
			config.description?.[langCode] ||
			config.description?.en ||
			config.shortDescription?.[langCode] ||
			config.shortDescription?.en ||
			config.longDescription?.[langCode] ||
			config.longDescription?.en ||
			lb.none;

		// ===============================
		// GUIDE
		// ===============================

		const guideBody =
			config.guide?.[langCode] ||
			config.guide?.en ||
			"";

		const usage =
			guideBody
				.replace(
					/{pn}/g,
					prefix + config.name
				)
				.replace(
					/{p}/g,
					prefix
				)
				.replace(
					/{n}/g,
					config.name
				);

		// ===============================
		// ALIASES
		// ===============================

		let aliasText = lb.none;

		if (
			Array.isArray(config.aliases) &&
			config.aliases.length > 0
		) {
			aliasText =
				config.aliases.join(", ");
		}

		// ===============================
		// CATEGORY
		// ===============================

		const category =
			config.category ||
			"Uncategorized";

		// ===============================
		// ROLE
		// ===============================

		const roleText =
			roleTextToString(
				config.role,
				langCode
			);

		// ===============================
		// COMMAND INFO MESSAGE
		// ===============================

		const response =
			"╔══════════════════════════╗\n" +
			"║   ⚡ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗜𝗡𝗙𝗢 ⚡   ║\n" +
			"╚══════════════════════════╝\n\n" +

			`┌─ ${lb.name}\n` +
			`│  ➜ ${config.name}\n` +

			`├─ ${lb.alias}\n` +
			`│  ➜ ${aliasText}\n` +

			`├─ ${lb.desc}\n` +
			`│  ➜ ${desc}\n` +

			`├─ ${lb.author}\n` +
			`│  ➜ ${config.author || lb.unknown}\n` +

			`├─ ${lb.category}\n` +
			`│  ➜ ${category}\n` +

			`├─ ${lb.guide}\n` +
			`│  ➜ ${usage || prefix + config.name}\n` +

			`├─ ${lb.version}\n` +
			`│  ➜ ${config.version || "1.0"}\n` +

			`├─ ${lb.role}\n` +
			`│  ➜ ${roleText}\n` +

			"└──────────────────────────";

		// ===============================
		// SEND COMMAND INFO
		// ===============================

		try {
			const helpMessage =
				await message.reply({
					body: response,
					attachment
				});

			setTimeout(() => {
				message
					.unsend(
						helpMessage.messageID
					)
					.catch(() => {});
			}, AUTO_UNSEND_TIME);

		} catch (error) {
			console.error(
				"[HELP] Command info error:",
				error
			);

			await message.reply(response);
		}
	}
};

// ===============================
// ROLE TEXT
// ===============================

function roleTextToString(role, lang) {
	const roles = {
		bn: [
			"সব ইউজার",
			"গ্রুপ অ্যাডমিন",
			"বোট অ্যাডমিন",
			"ডেভেলপার (Dev)",
			"ভিআইপি (VIP)",
			"NSFW ইউজার"
		],

		en: [
			"All users",
			"Group Admin",
			"Bot Admin",
			"Developer",
			"VIP User",
			"NSFW User"
		],

		vi: [
			"Tất cả người dùng",
			"Quản trị viên nhóm",
			"Admin bot",
			"Người phát triển",
			"Người dùng VIP",
			"Người dùng NSFW"
		]
	};

	const r =
		roles[lang] ||
		roles.en;

	if (
		typeof role === "number" &&
		role >= 0 &&
		role <= 5
	) {
		return `${role} (${r[role]})`;
	}

	return `${role ?? 0} (Unknown)`;
				}
