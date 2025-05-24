const { cmd } = require("../command");

cmd({
  pattern: "caption",
  alias: ["cap", "addcaption", "c", "recaption"],
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
    const buffer = await quotedMsg.download();
    const mtype = quotedMsg.mtype;
    
    // Extract the caption text (everything after the command)
    const newCaption = message.body.slice(message.prefix.length + 'caption'.length).trim();

    let messageContent = {};
    switch (mtype) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption: newCaption,
          mimetype: quotedMsg.mimetype || "image/jpeg"
        };
        break;
      case "videoMessage":
        messageContent = {
          video: buffer,
          caption: newCaption,
          mimetype: quotedMsg.mimetype || "video/mp4"
        };
        break;
      case "documentMessage":
        messageContent = {
          document: buffer,
          caption: newCaption,
          mimetype: quotedMsg.mimetype
        };
        break;
      default:
        return await client.sendMessage(from, {
          text: "❌ Only image, video and document messages can be recaptioned"
        }, { quoted: message });
    }

    await client.sendMessage(from, messageContent, { quoted: message });
  } catch (error) {
    console.error("Caption Error:", error);
    await client.sendMessage(from, {
      text: "❌ Error adding caption:\n" + error.message
    }, { quoted: message });
  }
});
