let puppeteer = require('puppeteer');
let schedule = require('node-schedule');
let fs = require('fs')
const moment = require('moment');
let u = require('../common/util')
let axios = require('axios')
class SwitchIP {
  constructor() {
    this.ip = ""
    this.getIP();
  }
  async task1() {
    u.log(`IP:${this.ip}`);
    u.log(`>>>task1:${new Date().getTime()}`)
    try {
      await this.page.goto('http://192.168.0.1/', {
        waitUntil: 'domcontentloaded'
      })
    } catch (err) {
      this.log(err)
    }
    u.sleep(2000)
    await this.page.evaluate(() => {
      function doConnect(n) {
        var s = "&wan=" + n;
        let url = "/userRpm/StatusRpm.htm?Connect=连 接" + s;
        console.log(url);
        return url
      }

      function doDisConnect(n) {
        var s = "&wan=" + n;
        let url = "/userRpm/StatusRpm.htm?Disconnect=断 线" + s;
        console.log(url);
        return url
      }

      function loadJquery() {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//cdn.bootcss.com/jquery/2.1.2/jquery.min.js';
        document.getElementsByTagName('head')[0].appendChild(script);
      }

      function createIframe() {
        let iframe = $('<iframe>');
        $('html').append(iframe)
        return iframe
      }

      (function () {
        loadJquery();
        setTimeout(function () {
          window.iframe = createIframe();
          iframe.attr('src', doDisConnect(1));
          setTimeout(function () {
            iframe.attr('src', doConnect(1));
          }, 1000)
        }, 2000)
      })();
    })
    await u.sleep(10000)
    await this.getIP()
  }
  /**
   * 检查时间段
   * 早上4点到8点需要不换Ip，其他时间每隔15分钟换Ip，路由器设置，
   */
  checkHandle() {
    let currHours = new Date().getHours();
    if (currHours >= 4 && currHours < 8) {
      return false;
    }
    return true;
  }

  getIP() {
    return new Promise((resovle, reject) => {
      axios.get('http://200019.ip138.com/').then(res => {
        this.ip = res.data.match(/\d+\.\d+\.\d+\.\d+/)[0];
        resovle()
      }).catch(err => {
        reject(err)
      })
    })
  }
  async main() {
    u.log(`>>>main`);
    await u.runPuppeteer.call(this)
    await u.goto.call(this, 'http://192.168.0.1/')
    await u.sleep(5000)
    await this.page.addScriptTag({
      url: '//cdn.bootcss.com/jquery/2.1.2/jquery.min.js'
    })

    //早上4点到8点需要不换Ip，其他时间每隔15分钟换Ip，路由器设置，
    setInterval(() => {
      try {
        if (this.checkHandle()) {
          this.getIP()
          this.task1()
        }
      } catch (error) {
        u.log(error)
      }
    }, 1000 * 60 * 15);
  }
}



new SwitchIP().main();
