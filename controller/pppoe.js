let fs = require('fs')
let util = require('../common/util')
let axios = require('axios')
const isOnline = require('is-online');

function Base64() {
  // private property
  _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  // public method for encoding
  this.encode = function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
    input = _utf8_encode(input);
    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output = output +
        _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
        _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
    }
    return output;
  }

  // public method for decoding
  this.decode = function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < input.length) {
      enc1 = _keyStr.indexOf(input.charAt(i++));
      enc2 = _keyStr.indexOf(input.charAt(i++));
      enc3 = _keyStr.indexOf(input.charAt(i++));
      enc4 = _keyStr.indexOf(input.charAt(i++));
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
      output = output + String.fromCharCode(chr1);
      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }
    }
    output = _utf8_decode(output);
    return output;
  }

  // private method for UTF-8 encoding
  _utf8_encode = function (string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";
    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }

    }
    return utftext;
  }

  // private method for UTF-8 decoding
  _utf8_decode = function (utftext) {
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;
    while (i < utftext.length) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if ((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    return string;
  }
}
class SwitchIP extends util {
  constructor() {
    super(0)
    this.taskName = "switchIP"
    this.ip = ""
    this.user = "admin";
    this.password = "19801201";
    this.base64 = new Base64();
    this.Authorization = `Basic ` + this.base64.encode(`${this.user}:${this.password}`)
  }

  /**
   * 获取商户页面内容，检查是否访问过于频繁，
   */
  async getShangPuHtml() {
    console.log(`>>>getShangPuHtml`);
    let url = `https://sh.58.com/shangpucz/pn2`;
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded'
    })
    await this.page.waitForSelector('body')
    await this.sleep(1000)
    let result = await this.page.evaluate(() => {
      return document.title.includes('请输入验证码')
    })
    return result;

  }
  //连 接
  async doConnect() {
    this.log(`>>>doConnect`)
    let url = `http://192.168.0.1/userRpm/StatusRpm.htm?Connect=%C1%AC%20%BD%D3&wan=1`;
    return axios.get(url, {
      headers: {
        Authorization: this.Authorization
      }
    });
  };
  //断 线
  async doDisConnect() {
    this.log('>>>doDisConnect')
    let url = `http://192.168.0.1/userRpm/StatusRpm.htm?Disconnect=%B6%CF%20%CF%DF&wan=1`
    return axios.get(url, {
      headers: {
        Authorization: this.Authorization
      }
    });
  };

  async task1() {
    try {
      let ip = null;
      try {
        ip = await this.getIP();
      } catch (err) {
        this.log(err)
      }
      this.log(`断开前IP:${ip}`);
      this.log(`>>>task1:${new Date().getTime()}`)
      await this.doDisConnect()
      await this.sleep(1000)
      await this.doConnect();
      await this.sleep(10000)
      try {
        ip = await this.getIP();
      } catch (err) {
        this.log(err)
      }
      this.log(`断开后IP:${ip}`);
    } catch (err) {
      this.log(err)
    }
  };

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
        resovle(this.ip)
      }).catch(err => {
        reject(err)
      })
    })
  }
  async watch58() {
    this.log(`>>>watch58`)
    do {
      try {
        let result = await this.getShangPuHtml();
        if (result) {
          this.log('58：请输入验证码')
          await this.task1();
        }
      } catch (err) {
        this.log(err)
      }
      await this.sleep(1000 * 15)
    } while (true)
  }

  async watchOnline() {
    this.log(`>>>isOnline`)
    do {
      try {
        let result = await isOnline()
        this.log('网络状态：'+result)
        if (!result) {
          await this.task1();
          await this.sleep(1000*10)
        }
      } catch (err) {
        this.log(err)
      }
      await this.sleep(1000)
    } while (true)
  }
  async main() {
    this.log(`>>>main`);
    await this.runPuppeteer({
      headless: true
    });
    this.watchOnline()
    this.watch58();
    //早上4点到8点需要不换Ip，其他时间每隔15分钟换Ip，路由器设置，
    setInterval(async () => {
      try {
        if (this.checkHandle()) {
          await this.task1()
        }
      } catch (error) {
        this.log(error)
      }
    }, 1000 * 60 * 15);
  }
}



new SwitchIP().main();
