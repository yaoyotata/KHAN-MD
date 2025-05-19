const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "np",
  desc: "Search for a package on npm and get integrity hash.",
  react: '📦',
  category: "convert",
  filename: __filename,
  use: ".npm <package-name> [version]"
}, async (conn, mek, msg, { from, args, reply }) => {
  try {
    if (!args.length) {
      return reply("Please provide the npm package name. Example: `.npm @whiskeysockets/baileys 6.7.17`");
    }

    const packageName = args[0];
    const version = args[1] || "latest"; // Default to latest if version is not provided
    const apiUrl = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;

    const response = await axios.get(apiUrl);
    if (response.status !== 200) {
      throw new Error("Package not found or an error occurred.");
    }

    const packageData = response.data;
    const latestVersion = packageData["dist-tags"].latest;
    const selectedVersion = version === "latest" ? latestVersion : version;
    const versionData = packageData.versions[selectedVersion];

    if (!versionData) {
      return reply(`Version *${selectedVersion}* not found for *${packageName}*.`);
    }

    const description = versionData.description || "No description available.";
    const npmUrl = `https://www.npmjs.com/package/${packageName}/v/${selectedVersion}`;
    const license = versionData.license || "Unknown";
    const repository = versionData.repository ? versionData.repository.url : "Not available";
    const integrity = versionData.dist?.integrity || "Not available";

    const message = `
*📦 NPM PACKAGE SEARCH*

*🔰 Package:* ${packageName}
*📄 Description:* ${description}
*🔄 Version:* ${selectedVersion} ${version === "latest" ? "(latest)" : ""}
*🔒 Integrity Hash:* ${integrity}
*🪪 License:* ${license}
*🪩 Repository:* ${repository}
*🔗 NPM URL:* ${npmUrl}
`;

    await conn.sendMessage(from, { text: message }, { quoted: mek });

  } catch (error) {
    console.error("Error:", error);
    const errorMessage = `
*❌ NPM Command Error Logs*

*Error:* ${error.message}
*Stack Trace:* ${error.stack || "Not available"}
*Timestamp:* ${new Date().toISOString()}
`;
    await conn.sendMessage(from, { text: errorMessage }, { quoted: mek });
    reply("An error occurred while fetching npm package details.");
  }
});
