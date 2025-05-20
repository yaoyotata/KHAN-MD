const config = require('../config');
const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "ig",
    alias: ["igdl", "insta", "instagram", "igimg", "igvid"],
    react: "📷",
    desc: "Download Instagram videos or images",
    category: "downloader",
    use: '.ig <Instagram URL>',
    filename: __filename
},
async (conn, mek, m, { from, prefix, quoted, q, reply, waitForReply }) => {
    try {
        if (!q) return await reply("✳️ Please provide an Instagram URL\nExample: " + prefix + "ig <Instagram URL>");

        // Show waiting reaction
        await conn.sendMessage(from, {
            react: { text: "⏳", key: m.key }
        });

        const response = await fetch("https://delirius-apiofc.vercel.app/download/instagram?url=" + encodeURIComponent(q));
        if (!response.ok) throw "Failed to fetch from Instagram API";

        const data = await response.json();

        // Show success reaction
        await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });

        for (const item of data.data) {
            if (item.url.includes('.mp4')) {
                await conn.sendMessage(from, { 
                    video: { url: item.url }, 
                    caption: `╭━━━〔 *KHAN-MD* 〕━━━┈⊷\n┃▸ *Instagram Video*\n╰────────────────┈⊷\n> *© Pᴏᴡᴇʀᴇᴅ Bʏ KʜᴀɴX-Aɪ ♡*` 
                }, { quoted: mek });
            } else {
                await conn.sendMessage(from, { 
                    image: { url: item.url }, 
                    caption: `╭━━━〔 *KHAN-MD* 〕━━━┈⊷\n┃▸ *Instagram Image*\n╰────────────────┈⊷\n> *© Pᴏᴡᴇʀᴇᴅ Bʏ KʜᴀɴX-Aɪ ♡*` 
                }, { quoted: mek });
            }
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
