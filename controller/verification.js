let mysql = require('mysql');
let config = require('../config.js')
let Util = require('../common/util')
let axios = require('axios')
let getPixels = require("get-pixels")
let path = require('path')
let fs = require('fs')
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

  /**
   * 特征提取，先从政府图片的中间找出指定区间相同像素的地方
   */
  async featureExtraction(pixels) {
    let width = pixels.shape[0];
    let height = pixels.shape[1];
    let chaetArr = 'abcdefghijklmnopqrstuvwxyz'.split('');
    let countArr = [];
    //提取图片中间一列的样本信息放到数组里
    let samplePixelsArr = [];
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let arr = this.getColor(pixels, x, y);
        let chartIndex = parseInt((arr[0] + arr[1] + arr[2]) / 50);
        let chart = chaetArr[chartIndex]
        //统计出现的次数
        countArr[chartIndex] = countArr[chartIndex] ? countArr[chartIndex] + 1 : 1
        if (!samplePixelsArr[x]) {
          samplePixelsArr[x] = []
        }
        samplePixelsArr[x].push(chart);
      }
    }
    console.log(JSON.stringify(countArr));
    let 可能chartArr = [];
    for (let i = 0; i < countArr.length; i++) {
      if (countArr[i] > 1500 && countArr[i] < 2500) {
        // console.log(chaetArr[i]);
        可能chartArr.push(chaetArr[i])
        // await this.searchRoute(i, pixels);
      }
    }
    // //符合特征位置
    let accordArr = [];

    for (let y = 0; y < samplePixelsArr.length; y++) {
      //轮询查找匹配特征
      let accordCode = ''
      let accordCount = 0;
      let samplePixels = samplePixelsArr[y]
      accordArr[y] = []
      //分析样本信息放,提取8-15像素的特征
      for (let i = 0; i < samplePixels.length; i++) {
        if (i === 0) {
          accordCode = samplePixels[i]
        }
        if (samplePixels[i] === accordCode) {
          accordCount++
        } else {
          //判断accordCount是否在6-13区间
          if (accordCount >= 6 && accordCount <= 15 && 可能chartArr.includes(accordCode)) {
            accordArr[y].push([i - accordCount, i])
          }
          accordCount = 0;
          accordCode = samplePixels[i]
        }
      }
    }
    //生成可能的路线code数字，开始尝试连线，然后找出最优线路
    if (accordArr.length) {
      console.log(accordArr);
    }
    // console.log(JSON.stringify(accordArr));
    fs.writeFileSync(path.join(__dirname, '../temp/log1.js'), JSON.stringify(accordArr))

    this.view(accordArr)
  }
  async view(accordArr) {
    let log = ``;
    for (let y = 0; y < 155; y++) {
      for (let x = 0; x < accordArr.length; x++) {
        if (!accordArr[x].length) {
          log += `1`
        } else {
          let flag = false;
          for (let i = 0; i < accordArr[x].length; i++) {
            if (y >= accordArr[x][i][0] && y <= accordArr[x][i][1]) {
              flag = true;
              break;
            }
          }
          if (flag) {
            log += 'o'
          } else {
            log += `1`
          }
        }
      }
      log += '\n'
    }
    fs.writeFileSync(path.join(__dirname, '../temp/log2.log'), log)
  }

  /**
   * 查找路线
   */
  async searchRoute(index, pixels, _x = 0, _y = 0) {
    let width = pixels.shape[0];
    let height = pixels.shape[1];
    for (let x = _x; x < width; x++) {
      for (let y = _y; y < height; y++) {
        let arr = this.getColor(pixels, x, y);
        let chartIndex = parseInt((arr[0] + arr[1] + arr[2]) / 50);
        if (chartIndex === index) {
          console.log(`x:${x},y:${y}`);
          console.log(666);
          await this.searchRoute(index, pixels, x, y)
        }
      }
    }
    let chaetArr = 'abcdefghijklmnopqrstuvwxyz'.split('');
    let countArr = [];
    //提取图片中间一列的样本信息放到数组里
    let samplePixelsArr = [];
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let arr = this.getColor(pixels, x, y);
        let chartIndex = parseInt((arr[0] + arr[1] + arr[2]) / 50);
        let chart = chaetArr[chartIndex]
        //统计出现的次数
        countArr[chartIndex] = countArr[chartIndex] ? countArr[chartIndex] + 1 : 1
        if (!samplePixelsArr[x]) {
          samplePixelsArr[x] = []
        }
        samplePixelsArr[x].push(chart);
      }
    }
  }

  async find() {
    let pixels = await this.readImg(path.join(__dirname, '../temp/v1.png'));
    await this.featureExtraction(pixels);
    let width = pixels.shape[0];
    let height = pixels.shape[1];
    let log = ``;
    let zmArr = 'abcdefghijklmnopqrstuvwxyz'.split('')
    let samplePixelsArr = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let arr = this.getColor(pixels, x, y);
        let chart = zmArr[parseInt((arr[0] + arr[1] + arr[2]) / 50)];
        if (!samplePixelsArr[y]) {
          samplePixelsArr[y] = [];
        }
        samplePixelsArr[y].push(chart)
        log += `${chart}`
      }
      log += `\n`
    }
    fs.writeFileSync(path.join(__dirname, '../temp/log3.log'), log)
    // await this.searchRoute();
    // console.log(JSON.stringify(samplePixelsArr[0]));
  }

  getColor(pixels, x, y) {
    let r = pixels.get(x, y, 0);
    let g = pixels.get(x, y, 1);
    let b = pixels.get(x, y, 2);
    let a = pixels.get(x, y, 3);
    return [r, g, b, a];
  }

  readImg(imgSrc) {
    return new Promise((resolve, reject) => {
      getPixels(imgSrc, function (err, pixels) {
        if (err) {
          reject(err);
        } else {
          resolve(pixels);
        }
      });
    });
  }
  async main() {
    this.log('>>>main')
    // await this.runPuppeteer();
    // await this.monitor()
    this.find();
  }
}
new Verification().main();
