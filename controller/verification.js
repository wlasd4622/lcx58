let mysql = require('mysql');
let config = require('../config.js')
let Util = require('../common/util')
let axios = require('axios')
/**
 * 刷新,推送 houseInfo
 */
class Verification extends Util {
  constructor() {
    super();
    this.taskName = "verification"
  }
  async init() {
    this.log(`>>>init`);

  }
  async monitor() {
    let url = `https://sh.58.com/shangpucz/pn2`;
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded'
    })
    await this.page.waitForSelector('body')
    await this.sleep(1000)
    let result = await this.page.evaluate(() => {
      return document.title.includes('请输入验证码')
    })
    if (result) {
      await this.page.click('#btnSubmit')
    }
    await this.sleep(1000);
    await this.mouseHandle()

  }
  async mouseHandle() {
    await this.page.mouse.move(505, 395)
    await this.page.mouse.down();
    await this.page.mouse.move(605, 395, {
      steps: 30
    });
    await this.page.mouse.move(605, 385, {
      steps: 30
    });
    await this.page.mouse.move(625, 385, {
      steps: 30
    });
    await this.page.mouse.up()
    await this.sleep(555555)
    console.log(666);
  }

  async main() {
    this.log('>>>main')
    await this.runPuppeteer();
    await this.monitor()
  }
}
new Verification().main();
