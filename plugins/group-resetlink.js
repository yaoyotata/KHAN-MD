const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('../lib/functions')

cmd({
    pattern: "revoke",
    react: "🖇️",
    alias: ["revokegrouplink", "resetglink", "revokelink", "f_revoke"],
    desc: "To Reset the group link",
    category: "group",
    use: '.revoke',
    filename: __filename
},
async(conn, mek, m, {
    from, l, quoted, body, isCmd, command, args, q, isGroup,
    sender, senderNumber, botNumber2, botNumber, pushname,
    isMe, isOwner, groupMetadata, groupName, participants,
    groupAdmins, isBotAdmins, isCreator, isDev, isAdmins, reply
}) => {
    try {
        const msr = {
            only_gp: "❌ *This command only works in groups.*",
            you_adm: "❌ *You must be an admin to use this command.*",
            give_adm: "❌ *I need to be an admin to do that!*"
        };

        if (!isGroup) return reply(msr.only_gp)
        if (!isAdmins && !isDev) return reply(msr.you_adm, { quoted: mek })
        if (!isBotAdmins) return reply(msr.give_adm)

        await conn.groupRevokeInvite(from)
        await conn.sendMessage(from, { text: `*Group link Reseted* ⛔` }, { quoted: mek })

    } catch (e) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        console.log(e)
        reply(`❌ *Error Occurred !!*\n\n${e}`)
    }
})
