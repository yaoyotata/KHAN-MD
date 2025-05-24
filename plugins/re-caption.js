const { cmd } = require("../command");

cmd({
  pattern: "caption",
  alias: ["cap", "recaption", "c"],
  react: '✏️',
  desc: "Add or change caption of media/document",
  category: "utility",
  filename: __filename
}, async (client, message, match, { from }) => {
  try {
    if (!message.quoted) {
      return await client.sendMessage(from, {
        text: "*🍁 Please reply to a media message (image/video/document) to add caption!*\n\n*Usage:*\n- Reply to media with .caption [your text]\n- Or just .caption [text] to add caption to previous media"
      }, { quoted: message });
    }

    const quotedMsg = message.quoted;
    if (!quotedMsg || !quotedMsg.download) {
      return await client.sendMessage(from, {
        text: "❌ The quoted message is not valid media"
      }, { quoted: message });
    }

    const buffer = await quotedMsg.download();
    const mtype = quotedMsg.mtype;
    
    // Safely extract caption text
    const newCaption = typeof match === 'string' ? match.trim() : '';
    // Alternative method if match isn't working:
    // const newCaption = message.body.split(' ').slice(1).join(' ').trim();

    if (!buffer) {
      return await client.sendMessage(from, {
        text: "❌ Failed to download the media"
      }, { quoted: message });
    }

    let messageContent = {
      caption: newCaption,
      mimetype: quotedMsg.mimetype,
      quoted: message
    };

    switch (mtype) {
      case "imageMessage":
        messageContent.image = buffer;
        messageContent.mimetype = messageContent.mimetype || "image/jpeg";
        break;
      case "videoMessage":
        messageContent.video = buffer;
        messageContent.mimetype = messageContent.mimetype || "video/mp4";
        break;
      case "documentMessage":
        messageContent.document = buffer;
        break;
      case "audioMessage":
        messageContent.audio = buffer;
        messageContent.mimetype = messageContent.mimetype || "audio/mp4";
        messageContent.ptt = quotedMsg.ptt || false;
        break;
      default:
        return await client.sendMessage(from, {
          text: "❌ Only image, video, document and audio messages can be recaptioned"
        }, { quoted: message });
    }

    await client.sendMessage(from, messageContent);
  } catch (error) {
    console.error("Caption Error:", error);
    await client.sendMessage(from, {
      text: "❌ Error adding caption:\n" + (error.message || error.toString())
    }, { quoted: message });
  }
});
