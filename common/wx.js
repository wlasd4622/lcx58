// https://docs.chatie.io/v/zh/
const {
  Wechaty,
  ScanStatus,
  log
} = require("wechaty");

async function findAll(roomName, bot) {
  let roomReg = eval(`/${roomName}/i`);
  return await bot.Room.findAll({
    topic: roomReg
  });
}

async function start(name, remarks) {
  let bot = null;
  return new Promise(async (resolve, reject) => {
    try {
      bot = new Wechaty({
        name: name || 'wechaty'
      })

      bot.on('scan', (qrcode, status) => {
        console.log(`${name}:请用${remarks}微信账号扫码登录`);
        require('qrcode-terminal').generate(qrcode)
      })

      bot.on('login', user => {
        log.info('StarterBot', '%s login', user)
        resolve({
          name,
          user,
          bot
        })
      })

      bot.on('logout', user => {
        log.info('StarterBot', '%s logout', user)
      })

      bot.on('message', msg => {
        log.info('StarterBot', msg.toString())
      })

      await bot.start()

    } catch (err) {
      console.log(err);
      reject(err)
    }
  })
}

module.exports = {
  start,
  findAll
}
