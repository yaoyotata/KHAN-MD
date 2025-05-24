const { cmd } = require("../command");
const { getContentType } = require('@whiskeysockets/baileys');

cmd({
  pattern: "upstatus",
  alias: ["uploadstatus", "statusup"],
  react: "📤",
  desc: "Upload replied media/text as status (with optional group mentions or 'all' for all groups)",
  category: "utility",
  filename: __filename
}, async (Void, message, match, { isQuoted, quoted }) => {
  try {
    if (!isQuoted) {
      return await Void.sendMessage(message.chat, {
        text: "*🍁 Please reply to a message (text/media) to upload as status!*"
      }, { quoted: message });
    }

    let jids = [];
    const allGroupsFlag = match.toLowerCase().includes("all");

    // Get all group JIDs if 'all' flag is used
    if (allGroupsFlag) {
      const groupMetadata = await Void.groupFetchAllParticipating();
      jids = Object.keys(groupMetadata).filter(jid => {
        // Filter out groups where bot is not present or is muted
        const metadata = groupMetadata[jid];
        return metadata && 
               !metadata.announce && // Not announcement groups (often muted)
               metadata.participants.find(p => p.id === Void.user.id); // Bot is participant
      });
      
      if (jids.length === 0) {
        return await Void.sendMessage(message.chat, {
          text: "*⚠️ No available groups found (bot might be muted or not in groups)*"
        }, { quoted: message });
      }
    } else {
      // Parse the group JIDs from the match (if any)
      jids = match.split(" ").filter(jid => 
        jid.endsWith("@g.us") || jid.endsWith("@s.whatsapp.net")
      );
    }

    let statusContent = {};
    const mtype = getContentType(quoted.message);

    // Handle different media types
    if (mtype === "imageMessage") {
      const buffer = await Void.downloadMediaMessage(quoted);
      statusContent = {
        image: buffer,
        caption: quoted.message?.imageMessage?.caption || '',
        mimetype: quoted.message?.imageMessage?.mimetype || "image/jpeg"
      };
    } 
    else if (mtype === "videoMessage") {
      const buffer = await Void.downloadMediaMessage(quoted);
      const seconds = quoted.message?.videoMessage?.seconds || 0;
      
      if (seconds > 60) {
        return await Void.sendMessage(message.chat, {
          text: "*❌ Video duration should be 1 minute or less*"
        }, { quoted: message });
      }
      
      statusContent = {
        video: buffer,
        caption: quoted.message?.videoMessage?.caption || '',
        mimetype: quoted.message?.videoMessage?.mimetype || "video/mp4"
      };
    } 
    else if (mtype === "audioMessage") {
      const buffer = await Void.downloadMediaMessage(quoted);
      const seconds = quoted.message?.audioMessage?.seconds || 0;
      
      if (seconds > 60) {
        return await Void.sendMessage(message.chat, {
          text: "*❌ Audio duration should be 1 minute or less*"
        }, { quoted: message });
      }
      
      statusContent = {
        audio: buffer,
        mimetype: "audio/ogg; codecs=opus",
        ptt: quoted.message?.audioMessage?.ptt || false
      };
    } 
    else if (mtype === "conversation" || mtype === "extendedTextMessage") {
      statusContent = {
        text: quoted.message?.conversation || quoted.message?.extendedTextMessage?.text || ''
      };
    } 
    else {
      return await Void.sendMessage(message.chat, {
        text: "*❌ Only text, image, video, and audio messages are supported*"
      }, { quoted: message });
    }

    // Upload status
    if (jids.length > 0) {
      let successCount = 0;
      const failedJids = [];
      
      // Send to each group individually to handle failures
      for (const jid of jids) {
        try {
          await Void.sendMessage(jid, statusContent, {
            ...(mtype === "audioMessage" && statusContent.ptt ? { audio: { ptt: true } } : {})
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to send to ${jid}:`, error);
          failedJids.push(jid);
        }
      }
      
      let resultMessage = `*✅ Status uploaded to ${successCount} groups/users!*`;
      if (failedJids.length > 0) {
        resultMessage += `\n*❌ Failed to send to ${failedJids.length} groups (might be muted)*`;
      }
      resultMessage += `\nType: ${mtype === "audioMessage" ? (statusContent.ptt ? "Voice Message" : "Audio") : mtype}`;
      
      await Void.sendMessage(message.chat, {
        text: resultMessage
      }, { quoted: message });
    } else {
      await Void.updateProfileStatus(statusContent.text || '');
      await Void.sendMessage(message.chat, {
        text: `*✅ Status uploaded successfully!*\n` +
              `Type: ${mtype === "audioMessage" ? (statusContent.ptt ? "Voice Message" : "Audio") : mtype}`
      }, { quoted: message });
    }

  } catch (error) {
    console.error("upstatus Error:", error);
    await Void.sendMessage(message.chat, {
      text: "❌ Error uploading status:\n" + error.message
    }, { quoted: message });
  }
});
