module.exports = {
	config: {
		name: "ping",
		version: "1.0",
		author: "SK HABIBULLA",
		countDown: 5,
		role: 0,
		shortDescription: {
			en: "Check bot response speed",
			bn: "বটের রেসপন্স স্পিড দেখুন"
		},
		longDescription: {
			en: "Check the bot's response speed and latency.",
			bn: "বটের রেসপন্স স্পিড এবং লেটেন্সি চেক করুন।"
		},
		category: "system",
		guide: {
			en: "{pn}",
			bn: "{pn}"
		}
	},

	onStart: async function ({ message, event }) {
		const start = Date.now();

		const sent = await message.reply("🏓 | Pinging...");

		const latency = Date.now() - start;

		const msg =
			"╔════════════════════╗\n" +
			"║    🏓 𝗣𝗢𝗡𝗚! ⚡    ║\n" +
			"╚════════════════════╝\n\n" +
			`⚡ Response : ${latency}ms\n` +
			"🤖 Status   : Online\n" +
			"🚀 Bot      : Active\n\n" +
			"✦ ───────────── ✦";

		return message.reply(msg);
	}
};
