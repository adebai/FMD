let levelling = require('../lib/levelling')
let fs = require('fs')
let path = require('path')
let fetch = require('node-fetch')
let moment = require('moment-timezone')
const defaultMenu = {
  before: `
┌─〔 %me 〕
├ *%ucapan %name*
│
├ Left *%limit Limit*
├ Role *%role*
├ Level *%level (%exp / %maxexp)* [%xp4levelup]
├ %totalexp XP in Total
│
├ Date: *%week %weton, %date*
├ Time: *%time*
│
├ Uptime: *%uptime (%muptime)*
├ Database: %rtotalreg dari %totalreg
├ 
└────
%readmore`.trim(),
  header: '┌─〔 %category 〕',
  body: '├ %cmd %islimit %isPremium',
  footer: '└────\n',
  after: `
*%npmname@^%version*
${'```%npmdesc```'}
`,
}
let handler = async (m, { conn, usedPrefix: _p, args, command }) => {

  let tags
  let teks = `${args[0]}`.toLowerCase()
  let arrayMenu = ['all', 'game', 'xp', 'stiker', 'magicclams', 'quotes', 'admin', 'group', 'premium', 'internet', 'anonymous', 'write', 'downloader', 'tools', 'fun', 'database', 'audio', 'sobot', 'info', 'withoutcategories', 'owner']
  if (!arrayMenu.includes(teks)) teks = '404'
  if (teks == 'all') tags = {
    'main': 'MAIN',
    'game': 'Game',
    'rpg': 'RPG',
    'xp': 'Exp & Limit',
    'sticker': 'Sticker',
    'magicclams': 'Magic Clams',
    'quotes': 'Quotes',
    'group': 'Group',
    'premium': 'Premium',
    'internet': 'Internet',
    'anonymous': 'Anonymous Chat',
    'write': 'Writing Mager & Logo',
    'downloader': 'Downloader',
    'tools': 'Tools',
    'fun': 'Fun',
    'database': 'Database',
    'vote': 'Voting',
    'absent': 'Absent',
    'audio': 'Voice Changer',
    'sobot': 'So Bot',
    'info': 'Info',
    '': 'Without categories',
  }
  if (teks == 'game') tags = {
    'game': 'Game',
    'rpg': 'RPG'
  }
  if (teks == 'xp') tags = {
    'xp': 'Exp & Limit'
  }
  if (teks == 'sticker') tags = {
    'sticker': 'Sticker'
  }
  if (teks == 'magicclams') tags = {
    'magicclams': 'Magic Clams'
  }
  if (teks == 'quotes') tags = {
    'quotes': 'Quotes'
  }
  if (teks == 'grup') tags = {
    'group': 'Group'
  }
  if (teks == 'premium') tags = {
    'premium': 'Premium'
  }
  if (teks == 'internet') tags = {
    'internet': 'Internet'
  }
  if (teks == 'anonymous') tags = {
    'anonymous': 'Anonymous Chat'
  }
  if (teks == 'write') tags = {
    'write': 'Writing Mager & Logo'
  }
  if (teks == 'downloader') tags = {
    'downloader': 'Downloader'
  }
  if (teks == 'tools') tags = {
    'tools': 'Tools'
  }
  if (teks == 'fun') tags = {
    'fun': 'Fun'
  }
  if (teks == 'database') tags = {
    'database': 'Database'
  }
  if (teks == 'vote') tags = {
    'vote': 'Voting',
    'absent': 'Absent'
  }
  if (teks == 'audio') tags = {
    'audio': 'Voice Changer'
  }
  if (teks == 'sobot') tags = {
    'sobot': 'So Bot'
  }
  if (teks == 'info') tags = {
    'info': 'Info'
  }
  if (teks == 'withoutcategories') tags = {
    '': 'Without Categories'
  }
  if (teks == 'owner') tags = {
    'owner': 'Owner',
    'host': 'Host',
    'advanced': 'Advanced'
  }



  try {
    let package = JSON.parse(await fs.promises.readFile(path.join(__dirname, '../package.json')).catch(_ => '{}'))
    let { exp, limit, age, money, level, role, registered } = global.db.data.users[m.sender]
    let { min, xp, max } = levelling.xpRange(level, global.multiplier)
    let umur = `*${age == '-1' ? 'Belum Daftar*' : age + '* Thn'}`
    let name = registered ? global.db.data.users[m.sender].name : conn.getName(m.sender)
    let d = new Date(new Date + 3600000)
    let locale = 'id'
    // d.getTimeZoneOffset()
    // Offset -420 is 18.00
    // Offset    0 is  0.00
    // Offset  420 is  7.00
    let weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(d / 84600000) % 5]
    let week = d.toLocaleDateString(locale, { weekday: 'long' })
    let date = d.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    let dateIslamic = Intl.DateTimeFormat(locale + '-TN-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d)
    let time = d.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    })
    let _uptime = process.uptime() * 1000
    let _muptime
    if (process.send) {
      process.send('uptime')
      _muptime = await new Promise(resolve => {
        process.once('message', resolve)
        setTimeout(resolve, 1000)
      }) * 1000
    }
    let muptime = clockString(_muptime)
    let uptime = clockString(_uptime)
    global.jam = time
    let totalreg = Object.keys(global.db.data.users).length
    let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length
    let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
      return {
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
        limit: plugin.limit,
        premium: plugin.premium,
        enabled: !plugin.disabled,
      }
    })
    if (teks == '404') {
      let judul = `${global.ucapan}, ${name}`.trim()
      const sections = [
      {
        title: 'List Menu ' + namabot,
        rows: [
          { title: 'All commands', rowId: `${_p}? all` },
          { title: 'Game', rowId: `${_p}? game` },
          { title: 'XP', rowId: `${_p}? xp` },
          { title: 'Stiker', rowId: `${_p}? stiker` },
          { title: 'Quotes', rowId: `${_p}? quotes` },
          { title: 'Group', rowId: `${_p}? group` },
          { title: 'Premium', rowId: `${_p}? premium` },
          { title: 'Internet', rowId: `${_p}? internet` },
          { title: 'Anonymous', rowId: `${_p}? anonymous` },
          { title: 'Downloader', rowId: `${_p}? downloader` },
          { title: 'Tools', rowId: `${_p}? tools` },
          { title: 'Fun', rowId: `${_p}? fun`},
          { title: 'Database', rowId: `${_p}? database` },
          { title: 'Vote & Absence', rowId: `${_p}? vote` },
          { title: 'Voice Changer', rowId: `${_p}? audio` },
          { title: 'So Bot', rowId: `${_p}? sobot` },
          { title: 'Info', rowId: `${_p}? info` },
          { title: 'Without Categories', rowId: `${_p}? withoutcategories` },
          { title: 'Owner', rowId: `${_p}? owner` },
        ]
      }
    ]
    const listMessage = {
      text: judul,
      footer: wm,
      mentions: await conn.parseMention(judul),
      title: '',
      buttonText: "Click Here",
      sections
    }
    return conn.sendMessage(m.chat, listMessage, { quoted: m, mentions: await conn.parseMention(judul), contextInfo: { forwardingScore: 99999, isForwarded: true }})
    
    }

    let groups = {}
    for (let tag in tags) {
      groups[tag] = []
      for (let plugin of help)
        if (plugin.tags && plugin.tags.includes(tag))
          if (plugin.help) groups[tag].push(plugin)
    }
    conn.menu = conn.menu ? conn.menu : {}
    let before = conn.menu.before || defaultMenu.before
    let header = conn.menu.header || defaultMenu.header
    let body = conn.menu.body || defaultMenu.body
    let footer = conn.menu.footer || defaultMenu.footer
    let after = conn.menu.after || (conn.user.jid == global.conn.user.jid ? '' : `Powered by https://wa.me/${global.conn.user.jid.split`@`[0]}`) + defaultMenu.after
    let _text = [
      before,
      ...Object.keys(tags).map(tag => {
        return header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => {
            return menu.help.map(help => {
              return body.replace(/%cmd/g, menu.prefix ? help : '%p' + help)
                .replace(/%islimit/g, menu.limit ? '(Limit)' : '')
                .replace(/%isPremium/g, menu.premium ? '(Premium)' : '')
                .trim()
            }).join('\n')
          }),
          footer
        ].join('\n')
      }),
      after
    ].join('\n')
    text = typeof conn.menu == 'string' ? conn.menu : typeof conn.menu == 'object' ? _text : ''
    let replace = {
      '%': '%',
      ucapan: global.ucapan,
      p: _p, uptime, muptime,
      me: conn.user.name,
      npmname: package.name,
      npmdesc: package.description,
      version: package.version,
      exp: exp - min,
      maxexp: xp,
      totalexp: exp,
      xp4levelup: max - exp <= 0 ? `Siap untuk *${_p}levelup*` : `${max - exp} XP lagi untuk levelup`,
      github: package.homepage ? package.homepage.url || package.homepage : '[unknown github url]',
      level, limit, name, umur, money, age, weton, week, date, dateIslamic, time, totalreg, rtotalreg, role,
      readmore: readMore
    }
    text = text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'), (_, name) => '' + replace[name])
    await conn.send3TemplateButtonImg(m.chat, fla + teks, text.trim(), wm, `🏅Owner`, `${_p}owner`, `🎖ThanksTo`, `${_p}tqto`, `🎗   🎗`, `${_p}infobot`)
  } catch (e) {
    conn.reply(m.chat, 'Sorry, menu has an error', m)
    throw e
  }
}
handler.help = ['menu', 'help', '?']
handler.tags = ['main']
handler.command = /^(m(enu)?|help|\?)$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null
handler.exp = 3

module.exports = handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
function ucapan() {
  const time = moment.tz('Africa/Lagos').format('HH')
  res = "Good morning"
  if (time >= 0) {
    res = "Good morning"
  }
  if (time >= 12) {
    res = "Good afternoon"
  }
  if (time >= 18) {
    res = "Good evening"
  }
  return res
}
