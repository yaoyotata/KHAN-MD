const { cmd } = require("../command");

cmd({
  pattern: "upstatus",
  alias: ["uploadstatus", "pstatus", "status", "post"],
  react: "📤",
  desc: "Upload replied media/text as status (with optional group mentions or 'all' for all groups)",
  category: "utility",
  filename: __filename
}, async (client, message, match, { from, isQuoted, quoted }) => {
  try {
    // Check if there's a quoted message
    if (!isQuoted) {
      return await client.sendMessage(from, {
        text: "*🍁 Please reply to a message (text/media) to upload as status!*"
      }, { quoted: message });
    }

    let jids = [];
    const allGroupsFlag = match.toLowerCase().includes("all");

    // Get all group JIDs if 'all' flag is used
    if (allGroupsFlag) {
      const chats = await client.fetchGroupMetadataFromWA();
      jids = chats.map(chat => chat.id);
      
      if (jids.length === 0) {
        return await client.sendMessage(from, {
          text: "*❌ Bot is not in any groups!*"
        }, { quoted: message });
      }
    } else {
      // Parse the group JIDs from the match (if any)
      jids = match.split(" ").filter(jid => 
        jid.endsWith("@g.us") || jid.endsWith("@s.whatsapp.net")
      );
    }

    let statusContent = {};
    const mtype = quoted.mtype;

    // Handle different media types
    if (mtype === "imageMessage") {
      const buffer = await quoted.download();
      statusContent = {
        image: buffer,
        caption: quoted.text || '',
        mimetype: quoted.mimetype || "image/jpeg"
      };
    } 
    else if (mtype === "videoMessage") {
      const buffer = await quoted.download();
      
      if (quoted.seconds > 60) {
        return await client.sendMessage(from, {
          text: "*❌ Video duration should be 1 minute or less*"
        }, { quoted: message });
      }
      
      statusContent = {
        video: buffer,
        caption: quoted.text || '',
        mimetype: quoted.mimetype || "video/mp4"
      };
    } 
    else if (mtype === "audioMessage") {
      const buffer = await quoted.download();
      
      if (quoted.seconds > 60) {
        return await client.sendMessage(from, {
          text: "*❌ Audio duration should be 1 minute or less*"
        }, { quoted: message });
      }
      
      statusContent = {
        audio: buffer,
        mimetype: "audio/ogg; codecs=opus",
        ptt: quoted.ptt || false
      };
    } 
    else if (quoted.text) {
      statusContent = {
        text: quoted.text
      };
    } 
    else {
      return await client.sendMessage(from, {
        text: "*❌ Only text, image, video, and audio messages are supported*"
      }, { quoted: message });
    }

    // Upload status
    if (jids.length > 0) {
      await client.StatusMentions(statusContent, jids);
      await client.sendMessage(from, {
        text: `*✅ Status uploaded to ${jids.length} ${allGroupsFlag ? 'groups (all)' : 'groups/users'}!*\n` +
              `Type: ${mtype === "audioMessage" ? (statusContent.ptt ? "Voice Message" : "Audio") : mtype}`
      }, { quoted: message });
    } else {
      await client.sendStatus(statusContent);
      await client.sendMessage(from, {
        text: `*✅ Status uploaded successfully!*\n` +
              `Type: ${mtype === "audioMessage" ? (statusContent.ptt ? "Voice Message" : "Audio") : mtype}`
      }, { quoted: message });
    }

  } catch (error) {
    console.error("upstatus Error:", error);
    await client.sendMessage(from, {
      text: "❌ Error uploading status:\n" + error.message
    }, { quoted: message });
  }
});
