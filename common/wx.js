// https://docs.chatie.io/v/zh/
const {
  Wechaty,
  ScanStatus,
  log
} = require("wechaty");

let bot = null;

async function onScan(qrcode, status) {
  require('qrcode-terminal').generate(qrcode)
}

async function onLogin(user) {
  log.info('StarterBot', '%s login', user)

  // const oldRoom = await bot.Room.find({
  //   name: '美食'
  // })
  // console.log(oldRoom);
}

async function onLogout(user) {
  log.info('StarterBot', '%s logout', user)
}

async function onMessage(msg) {
  log.info('StarterBot', msg.toString())
}



async function findAll(roomName) {
  let roomReg = eval(`/${roomName}/i`);
  return await bot.Room.findAll({
    topic: roomReg
  });
}

async function send() {

}

async function getList() {

}
async function start() {

  return new Promise(async (resolve, reject) => {
    try {
      bot = new Wechaty({
        name: 'wechaty'
      })
      bot.on('scan', onScan)
      bot.on('login', user => {
        log.info('StarterBot', '%s login', user)
        resolve(user)
      })
      bot.on('logout', onLogout)
      bot.on('message', msg => {
        console.log();
      })
      await bot.start()
    } catch (err) {
      console.log(err);
    }
  })
}
module.exports = {
  bot,
  start,
  getList,
  findAll,
  send
}
