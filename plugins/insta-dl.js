const config = require('../config');
const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "igvid",
    alias: ["igvideo", "insta", "igdl", "instagram"],
    react: "🎥",
    desc: "Download Instagram videos only",
    category: "downloader",
    use: '.igvid <Instagram URL>',
    filename: __filename
},
async (conn, mek, m, { from, prefix, quoted, q, reply, waitForReply }) => {
    try {
        if (!q) return await reply("✳️ Please provide an Instagram URL\nExample: " + prefix + "igvid <Instagram URL>");

        // Show waiting reaction
        await conn.sendMessage(from, {
            react: { text: "⏳", key: m.key }
        });

        const response = await fetch("https://delirius-apiofc.vercel.app/download/instagram?url=" + encodeURIComponent(q));
        if (!response.ok) throw "Failed to fetch from Instagram API";

        const data = await response.json();
        const videos = data.data.filter(item => item.url.includes('.mp4'));

        if (videos.length === 0) {
            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return await reply("No videos found in this Instagram post");
        }

        // Show success reaction
        await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });

        for (const video of videos) {
            await conn.sendMessage(from, { 
                video: { url: video.url }, 
                caption: `╭━━━〔 *KHAN-MD* 〕━━━┈⊷\n┃▸ *Instagram Video*\n╰────────────────┈⊷\n> *© Pᴏᴡᴇʀᴇᴅ Bʏ KʜᴀɴX-Aɪ ♡*`,
                mimetype: "video/mp4"
            }, { quoted: mek });
        }
    } catch (e) {
        console.log(e);
        // Show error reaction
        await conn.sendMessage(from, {
            react: { text: "❌", key: m.key }
        });
        await reply("❎ An error occurred while processing your request");
    }
});
