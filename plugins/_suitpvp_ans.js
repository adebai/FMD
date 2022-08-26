let handler = m => m
handler.before = async function (m) {
  this.suit = this.suit ? this.suit : {}
  if (db.data.users[m.sender].suit < 0) db.data.users[m.sender].suit = 0
  let room = Object.values(this.suit).find(room => room.id && room.status && [room.p, room.p2].includes(m.sender))
  if (room) {
    let win = ''
    let tie = false
    if (m.sender == room.p2 && /^(acc(ept)?|receive|gas|okay?|reject|later)/i.test(m.text) && m.isGroup && room.status == 'wait') {
      if (/^(reject|later)/i.test(m.text)) {
        this.reply(m.chat, `@${room.p2.split`@`[0]} refuse suit, suit cancelled`, m)
        delete this.suit[room.id]
        return !0
      }
      room.status = 'play'
      room.asal = m.chat
      clearTimeout(room.waktu)
      //delete room[room.id].waktu
      m.reply(`Suit has been sent to chat
@${room.p.split`@`[0]} and 
@${room.p2.split`@`[0]}

Please select suit in each chat"
click wa.me/${conn.user.jid.split`@`[0]}`, m.chat, {
        contextInfo: {
          mentionedJid: [room.p, room.p2]
        }
      })

      if (!room.pilih) this.send3Button(room.p, 'Please select', `Win +${room.poin}XP\nLost -${room.poin_lose}XP\nBonus +${room.poin_bot}`, 'Stone🗿', 'Stone', 'Paper📄', 'Paper', 'Scissors✂️', 'Scissors', m)
      if (!room.pilih2) this.send3Button(room.p2, 'Please select', `Win +${room.poin}XP\nLost -${room.poin_lose}XP\nBonus +${room.poin_bot}`, 'Stone🗿', 'Stone', 'Paper📄', 'Paper', 'Scissors✂️', 'Scissors', m)
      room.waktu_milih = setTimeout(() => {
        if (!room.pilih && !room.pilih2) this.sendButton(m.chat, `Both players have no intention of playing,\nLost cancelled`, wm, 'Menu', '.menu', m)
        else if (!room.pilih || !room.pilih2) {
          win = !room.pilih ? room.p2 : room.p
          this.sendButton(m.chat, `@${(room.pilih ? room.p2 : room.p).split`@`[0]} do not choose a suit, game end`.trim(), wm, 'Menu', '.menu', m)
          db.data.users[win == room.p ? room.p : room.p2].exp += room.poin
          db.data.users[win == room.p ? room.p : room.p2].exp += room.poin_bot
          db.data.users[win == room.p ? room.p2 : room.p].exp -= room.poin_lose
        }
        delete this.suit[room.id]
        return !0
      }, room.timeout)
    }
    let jwb = m.sender == room.p
    let jwb2 = m.sender == room.p2
    let g = /scissors/i
    let b = /stone/i
    let k = /paper/i
    let reg = /^(scissors|stone|paper)/i
    if (jwb && reg.test(m.text) && !room.pilih && !m.isGroup) {
      room.pilih = reg.exec(m.text.toLowerCase())[0]
      room.text = m.text
      m.reply(`You have chosen ${m.text} ${!room.pilih2 ? `\n\nWaiting for the opponent to choose` : ''}`)
      if (!room.pilih2) this.reply(room.p2, '_The opponent has already chosen_\nNow its your turn', 0)
    }
    if (jwb2 && reg.test(m.text) && !room.pilih2 && !m.isGroup) {
      room.pilih2 = reg.exec(m.text.toLowerCase())[0]
      room.text2 = m.text
      m.reply(`You've chosen ${m.text} ${!room.pilih ? `\n\nWaiting for the opponent to choose` : ''}`)
      if (!room.pilih) this.reply(room.p, '_The opponent has already chosen_\nNow its your turn', 0)
    }
    let stage = room.pilih
    let stage2 = room.pilih2
    if (room.pilih && room.pilih2) {
      clearTimeout(room.waktu_milih)
      if (b.test(stage) && g.test(stage2)) win = room.p
      else if (b.test(stage) && k.test(stage2)) win = room.p2
      else if (g.test(stage) && k.test(stage2)) win = room.p
      else if (g.test(stage) && b.test(stage2)) win = room.p2
      else if (k.test(stage) && b.test(stage2)) win = room.p
      else if (k.test(stage) && g.test(stage2)) win = room.p2
      else if (stage == stage2) tie = true
      this.reply(room.asal, `
_*Suit Results*_${tie ? '\nBE AND' : ''}

@${room.p.split`@`[0]} (${room.text}) ${tie ? '' : room.p == win ? ` Win \n+${room.poin}XP\nBonus +${room.poin_bot}` : ` Lost \n-${room.poin_lose}XP`}
@${room.p2.split`@`[0]} (${room.text2}) ${tie ? '' : room.p2 == win ? ` Win \n+${room.poin}XP\nBonus +${room.poin_bot}` : ` Lost \n-${room.poin_lose}XP`}
`.trim(), m, { contextInfo: { mentionedJid: [room.p, room.p2] } })
      if (!tie) {
        db.data.users[win == room.p ? room.p : room.p2].exp += room.poin
        db.data.users[win == room.p ? room.p : room.p2].exp += room.poin_bot
        db.data.users[win == room.p ? room.p2 : room.p].exp += room.poin_lose

      }
      delete this.suit[room.id]
    }
  }
  return !0
}
handler.exp = 0

module.exports = handler

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
