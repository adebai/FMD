//const { MessageType } = require("@adiwajshing/baileys")
let fetch = require('node-fetch')
async function handler(m, { command, usedPrefix }) {
    if (!global.db.data.settings[this.user.jid].anon) throw `This feature is off`
    command = command.toLowerCase()
    this.anonymous = this.anonymous ? this.anonymous : {}
    switch (command) {
        //case 'next':
        //case 'skip':
        case 'leave': {
            let room = Object.values(this.anonymous).find(room => room.check(m.sender))
            if (!room) {
                await this.sendButton(m.chat, '_You\'re not in anonymous chat_', 'Want to find a chat partner?', 'Start', `${usedPrefix}start`, m)
                throw false
            }
            this.send2Button(m.chat, '_You left the anonymous chat room_', 'Want to play anonymous again?', 'Yes', `${usedPrefix}start`, 'No', `${usedPrefix} Ok, thank you for using Anonymous Chat Bot, if you want to play again, you can click the *Yes* button above or you can type *.start*!`, m)
            let other = room.other(m.sender)
            if (other) await this.sendButton(other, '_Partner left the chat_', 'Want to play anonymous again?', 'Yes', `${usedPrefix}start`, m)
            delete this.anonymous[room.id]
            if (command === 'leave') break
        }
        case 'start': {
            if (Object.values(this.anonymous).find(room => room.check(m.sender))) {
                await this.sendButton(m.chat, '_You\'re still in anonymous chat_', 'Want to exit?', 'Yes', `${usedPrefix}leave`, m)
                throw false
            }
            let room = Object.values(this.anonymous).find(room => room.state === 'WAITING' && !room.check(m.sender))
            if (room) {
                await this.sendButton(room.a, '_Partner found!_', 'Please chat🤗', 'Hello', 'Hello 👋', m)
                room.b = m.sender
                room.state = 'CHATTING'
                await this.sendButton(room.b, '_Partner found!_', 'Please chat🤗', 'Hey', 'Hey 👋', m)
            } else {
                let id = + new Date
                this.anonymous[id] = {
                    id,
                    a: m.sender,
                    b: '',
                    state: 'WAITING',
                    check: function (who = '') {
                        return [this.a, this.b].includes(who)
                    },
                    other: function (who = '') {
                        return who === this.a ? this.b : who === this.b ? this.a : ''
                    },
                }
                await this.sendButton(m.chat, '_Waiting for a partner..._', 'If you\'re tired of waiting, click below to exit!!', 'Exit', `${usedPrefix}leave`, m)
            }
            break
        }
    }
}
handler.help = ['start', 'leave']
handler.tags = ['anonymous']
handler.command = ['start', 'leave']//, 'next', 'skip']

handler.private = true

module.exports = handler
