// https://docs.chatie.io/v/zh/
const {
  Wechaty,
  ScanStatus,
  log
} = require("wechaty");

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



async function findAll(roomName, bot) {
  let roomReg = eval(`/${roomName}/i`);
  return await bot.Room.findAll({
    topic: roomReg
  });
}

async function send() {

}

async function getList() {

}
async function start(name) {
  let bot = null;
  return new Promise(async (resolve, reject) => {
    try {
      bot = new Wechaty({
        name: name || 'wechaty'
      })
      bot.on('scan', onScan)
      bot.on('login', user => {
        log.info('StarterBot', '%s login', user)
        resolve({
          name,
          user,
          bot
        })
      })
      bot.on('logout', onLogout)
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
  getList,
  findAll,
  send
}
