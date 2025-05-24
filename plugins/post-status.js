const { cmd } = require("../command");
const fs = require('fs');
const { getContentType } = require('@fizzxydev/baileys-pro');

cmd({
  pattern: "status",
  alias: ["upstatus", "story", "repost", "reshare"],
  react: "🔄",
  desc: "Update your WhatsApp status",
  category: "utility",
  filename: __filename
}, async (client, message, match) => {
  try {
    // Check if user replied to media
    const quotedMsg = message.quoted;
    const isMedia = quotedMsg?.mtype && ["imageMessage", "videoMessage", "audioMessage"].includes(quotedMsg.mtype);
    
    // Determine content type
    let statusContent = {};
    
    if (isMedia) {
      // Handle media status
      const buffer = await quotedMsg.download();
      
      switch (quotedMsg.mtype) {
        case "imageMessage":
          statusContent = {
            image: buffer,
            caption: match || "",
            mimetype: quotedMsg.mimetype || "image/jpeg"
          };
          break;
          
        case "videoMessage":
          statusContent = {
            video: buffer,
            caption: match || "",
            mimetype: quotedMsg.mimetype || "video/mp4",
            seconds: quotedMsg.seconds || 30 // Default duration
          };
          break;
          
        case "audioMessage":
          statusContent = {
            audio: buffer,
            ptt: true, // Mark as voice message
            mimetype: quotedMsg.mimetype || "audio/ogg; codecs=opus",
            seconds: quotedMsg.seconds || 30 // Default duration
          };
          break;
      }
    } else if (match) {
      // Text-only status
      statusContent = {
        text: match
      };
    } else {
      return await message.reply("Please provide text or reply to media (image/video/audio) for status");
    }

    // Upload status using baileys-pro
    const statusUpdate = await client.updateStatus(statusContent);
    
    if (statusUpdate.status === 200) {
      await message.reply("✅ Status updated successfully!");
    } else {
      await message.reply("❌ Failed to update status");
    }

  } catch (error) {
    console.error("Status Error:", error);
    await message.reply(`❌ Failed to update status: ${error.message}`);
  }
});
