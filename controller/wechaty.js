// https://docs.chatie.io/v/zh/
const {
  Wechaty,
  ScanStatus,
  log,
} = require('wechaty')



function onScan(qrcode, status) {
  require('qrcode-terminal').generate(qrcode)
}

async function onLogin(user) {
  log.info('StarterBot', '%s login', user)

  const oldRoom = await bot.Room.find({
    name: '美食'
  })
  console.log(oldRoom);
}

function onLogout(user) {
  log.info('StarterBot', '%s logout', user)
}

async function onMessage(msg) {
  log.info('StarterBot', msg.toString())
}

const bot = new Wechaty({
  name: 'wechaty'
})

bot.on('scan', onScan)
bot.on('login', onLogin)
bot.on('logout', onLogout)
bot.on('message', onMessage)

async function main() {
  await bot.start()
    .then(() => log.info('StarterBot', 'Starter Bot Started.'))
    .catch(e => log.error('StarterBot', e))
  const roomList = await bot.Room.findAll() // get the room list of the bot
  roomList = await bot.Room.findAll({
    topic: 'wechaty'
  })
}

main();
