let Util = require('../common/util')
let getPixels = require("get-pixels")
let path = require('path')
let fs = require('fs')
var base64Img = require('base64-img');
var images = require("images");
var cjy = require('../common/cjy')
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
    url = `https://callback.58.com/firewall/verifycode?serialId=c348af788a49ca27ab63bf29f8e998ba_24b81a988b824f2caf826fba3bd03a21&code=22&sign=e00f3edec10939a78d819120ed072c70&namespace=fangchan_business_pc&url=https%3A%2F%2Fsh.58.comangpucz%2Fpn2%2F`
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
      await this.sleep(1000);
      let clip = await this.screenshot();
      let coordinate = await this.getCoordinate();
      await this.mouseMoveHandle(clip, coordinate)
    }
  }

  /**
   * 截图
   */
  async screenshot() {
    let clip = await this.page.evaluate(() => {
      return {
        x: document.getElementById('dvc-captcha__canvas').getBoundingClientRect().left,
        y: document.getElementById('dvc-captcha__canvas').getBoundingClientRect().top,
        width: parseInt(document.getElementById('dvc-captcha__canvas').getAttribute('width')),
        height: parseInt(document.getElementById('dvc-captcha__canvas').getAttribute('height')),
      };
    })
    await this.page.screenshot({
      clip,
      type: 'png',
      path: path.join(__dirname, '../temp/vtemp.png')
    })
    await this.sleep(1000);
    return clip;
  }

  /**
   *获取坐标
   */
  async getCoordinate() {
    let img = images(path.join(__dirname, '../temp/vtemp.png'));
    images(path.join(__dirname, '../temp/vBg.png')).draw(img, 0, 0)
      .save(path.join(__dirname, '../temp/output.png'), {
        quality: 100
      });
    img = base64Img.base64Sync(path.join(__dirname, '../temp/output.png'));
    let local = null;
    do {
      try {
        local = await cjy(img)
      } catch (err) {
        this.log(err)
        this.sleep(1000)
      }
    } while (!local)
    this.log(local)
    return local;
  }

  async mouseMoveHandle(clip, coordinate) {
    for (let i = 0; i < coordinate.length; i++) {
      if (i === 0) {
        await this.page.mouse.move(parseInt(coordinate[i].x) + clip.x, parseInt(coordinate[i].y) + clip.y)
        await this.page.mouse.down();
      } else {
        await this.page.mouse.move(parseInt(coordinate[i].x) + clip.x, parseInt(coordinate[i].y) + clip.y, {
          steps: 30
        });
      }
      if (i === coordinate.length - 1) {
        await this.page.mouse.up()
      }
    }
  }

  async main() {
    this.log('>>>main')
    await this.runPuppeteer();
    await this.monitor()
  }
}
new Verification().main();
