let Util = require('../common/util')
let getPixels = require("get-pixels")
let path = require('path')
let fs = require('fs')
var base64Img = require('base64-img');
var images = require("images");
var cjy = require('../common/cjy')
/**
 * 破解58验证码
 *
 */
class Verification extends Util {
  constructor() {
    super();
    this.taskName = "verification"
    this.verifyPicturesPath = path.join(__dirname, '../temp/verifyPictures')
    this.init()
  }
  init() {
    this.log(`>>>init`);

    if (!fs.existsSync(path.join(__dirname, '../temp'))) {
      fs.mkdirSync(path.join(__dirname, '../temp'))
    }
    if (!fs.existsSync(this.verifyPicturesPath)) {
      fs.mkdirSync(this.verifyPicturesPath)
    }
  }
  async monitor(url = 'https://sh.58.com/shangpucz/pn2') {
    this.log(`>>>monitor`)
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded'
    })
    await this.page.waitForSelector('body')
    await this.sleep(1000)
    let result = await this.page.evaluate(() => {
      return document.title.includes('请输入验证码')
    })
    if (result) {
      await this.tips();
      await this.page.click('#btnSubmit')
      await this.sleep(1000);
      let clip = await this.screenshot();
      let coordinate = await this.getCoordinate();
      await this.mouseMoveHandle(clip, coordinate)
      await this.sleep(1000 * 2);
      await this.monitor();
    } else {
      this.log('58正常')
    }
  }

  async tips() {
    this.log(`>>>tips`)
    await this.page.evaluate(() => {
      let msg = `<div style="position: fixed;
      width: 500px;
      background: #fff;
      height: 100px;
      top: 10px;
      z-index: 99000;
      left: 50%;
      margin-left: -250px;
      box-shadow: 2px 2px 3px 3px rgba(0, 0, 0, 0.278);
      text-align: center;
      line-height: 100px;">正在尝试破解验证码,请稍后...</div>`
      $('body').append(msg)
    });
  }

  /**
   * 截图
   */
  async screenshot() {
    this.log(`>>>screenshot`)
    let clip = await this.page.evaluate(() => {
      return {
        x: document.getElementById('dvc-captcha__canvas').getBoundingClientRect().left,
        y: document.getElementById('dvc-captcha__canvas').getBoundingClientRect().top,
        width: parseInt(document.getElementById('dvc-captcha__canvas').getAttribute('width')),
        height: parseInt(document.getElementById('dvc-captcha__canvas').getAttribute('height')),
      };
    })
    this.vImage = path.join(this.verifyPicturesPath, `${new Date().getTime()}.png`);
    await this.page.screenshot({
      clip,
      type: 'png',
      path: this.vImage
    })
    await this.sleep(500);
    return clip;
  }

  /**
   *获取坐标
   */
  async getCoordinate() {
    this.log(`>>>getCoordinate`)
    let local = null;
    try {
      images(path.join(__dirname, '../temp/vBg.png')).draw(images(this.vImage), 0, 0)
        .save(path.join(__dirname, '../temp/output.png'), {
          quality: 100
        });
      let img = base64Img.base64Sync(path.join(__dirname, '../temp/output.png'));
      do {
        try {
          this.log(`>>>cjy`)
          local = await cjy(img)
        } catch (err) {
          this.log(err)
          this.sleep(1000)
        }
      } while (!local)
      this.log(local)
    } catch (err) {
      this.log(err)
    }
    return local;
  }

  async mouseMoveHandle(clip, coordinate) {
    this.log(`>>>mouseMoveHandle`)
    for (let i = 0; i < coordinate.length; i++) {
      if (i === 0) {
        await this.page.mouse.move(parseInt(coordinate[i].x) + clip.x, parseInt(coordinate[i].y) + clip.y)
        await this.page.mouse.down();
      } else {
        await this.page.mouse.move(parseInt(coordinate[i].x) + clip.x, parseInt(coordinate[i].y) + clip.y, {
          steps: 50
        });
      }
      if (i === coordinate.length - 1) {
        await this.page.mouse.up()
      }
    }
  }

  async main() {
    this.log('>>>main')
    await this.runPuppeteer({
      headless: true
    });
    // await this.monitor('https://callback.58.com/firewall/verifycode?serialId=c348af788a49ca27ab63bf29f8e998ba_24b81a988b824f2caf826fba3bd03a21&code=22&sign=e00f3edec10939a78d819120ed072c70&namespace=fangchan_business_pc&url=https%3A%2F%2Fsh.58.comangpucz%2Fpn2%2F')
    await this.monitor();
    await this.closePuppeteer();
  }
}
// module.exports = Verification;
new Verification().main();
