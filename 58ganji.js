let puppeteer = require('puppeteer');
let schedule = require('node-schedule');
var mysql = require('mysql');
class GanJi {
  constructor() {
    this.userList = [];
    this.page = null;
    this.browser = null;
    this.dbConfig = {
      host: '101.201.49.69',
      user: 'refresh',
      password: 'Dianzhijia@1',
      port: '3306',
      database: 'datarefresh',
      useConnectionPooling: true,
    }
  }

  handleDisconnect() {
    console.log(`>>>handleDisconnect`);
    return new Promise((resolve, reject) => {
      this.connection = mysql.createConnection(this.dbConfig);
      this.connection.connect(async function (err) {
        if (err) {
          console.log('error when connecting to db:', err);
          reject()
        } else {
          resolve();
        }
      });
      this.connection.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
          reject()
        } else {
          throw err;
        }
      });
    })
  }

  execSql(sql) {
    console.log(sql);
    return new Promise((resolve, reject) => {
      try {
        this.connection.query(sql, function (err, value) {
          if (err) {
            reject(err)
          } else {
            resolve(value)
          }
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  async runPuppeteer() {
    console.log(`>>>runPuppeteer`);
    try {
      this.close()
    } catch (err) {
      console.log(err);
    }
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--start-maximized', '--disable-infobars']
    });
    this.page = await this.browser.newPage();
    await this.page.setViewport({
      width: 1500,
      height: 800
    })
  }

  sleep(ms = 300) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, ms);
    })
  }
  async close() {
    if (this.browser) await this.browser.close()
  }

  async setCookie(cookies_str = "", domain, page) {
    console.log(`>>>setCookie`);
    let cookies = cookies_str.split(';').map(pair => {
      let name = pair.trim().slice(0, pair.trim().indexOf('='))
      let value = pair.trim().slice(pair.trim().indexOf('=') + 1)
      return {
        name,
        value,
        domain
      }
    });
    return Promise.all(cookies.map(pair => {
      return page.setCookie(pair)
    }));
  }
  async getCookie() {
    console.log(`>>>getCookie`);
    let cookie = await this.page.evaluate(() => {
      return document.cookie
    })
    return cookie
  }


  async task1(user) {
    console.log(`>>>task1`);
    await this.runPuppeteer();
    let url = `http://vip.58ganji.com/user/brokerhomeV2`
    url = `http://vip.58ganji.com/broker/balancedetail/generalize`
    let session = decodeURIComponent(user.session)
    await this.setCookie(session, '.58ganji.com', this.page);
    await this.setCookie(session, '.58.com', this.page);
    await this.setCookie(session, '.vip.58.com', this.page);
    await this.setCookie(session, '.anjuke.com', this.page);
    await this.setCookie(session, '.vip.58ganji.com', this.page);
    await this.sleep(500)
    let username = await this.getUserInfo();
    let cookie = await this.getCookie()
    if (username.toLocaleLowerCase() === user.username.toLocaleLowerCase()) {
      url = `http://vip.58ganji.com/broker/balancedetail/generalize`
      await this.page.goto(url);
      await this.page.waitForSelector('.balance-detail .info-box-item .estate')
      await this.sleep(2000)
      //房产推广币
      let blanceHbg58 = await this.page.evaluate(() => {
        // return $('.account-mod li:eq(1) b').text();
        return $('span:contains(房产推广币)').next('b').text() || ''
      });

      let nickName = await this.page.evaluate(() => {
        return $('a:contains(您好)').text().replace('您好，', '').trim() || ''
      })

      //服务中及预约中的套餐开通及到期时间
      await this.myService(user);
      //推送中，在线购买，还可推送，今日推送到期数量
      await this.yxtgsp58(user);
      // 房产推广币，日期选到两年以后，查询最近3笔的余额到期时间及剩余金额
      await this.myperiod(user);
      //回到首页 获取cookie
      url = `http://vip.58ganji.com/user/brokerhomeV2`
      url = `http://vip.58ganji.com/broker/balancedetail/generalize`
      await this.page.goto(url);
      await this.page.waitForSelector('.balance-detail .info-box-item .estate')
      cookie = await this.getCookie()
      await this.updateUser(user, blanceHbg58, cookie, nickName)
    } else {
      await this.updateUser(user, '', '', '', 5001)
    }
    await this.close()
  }
  async updateUser(user, blanceHbg58, cookie, nickName, status = 0) {
    console.log(`>>>updateUser`);
    if (user && user.id) {
      cookie = encodeURIComponent(cookie)
      let sql = "update `gj_user` set `status`=" + status + ", `nickName`='" + nickName + "',`account`=" + (blanceHbg58.replace(/\,/g, '') || 0) + ",`session`='" + cookie + "',`update_time`=NOW() where id=" + user.id
      if (status) {
        sql = `update \`gj_user\` set \`status\`=${status},\`update_time\`=NOW() where id=${user.id}`
      }
      try {
        await this.execSql(sql)
      } catch (err) {
        console.error(err)
      }
    } else {
      console.error('未处理异常')
      console.log(nickName);
      console.log(JSON.stringify(user));
    }

  }
  async getUserList() {
    console.log(`>>>getUserList`);
    await this.sleep()
    this.userList = [];
    let result = await this.execSql("select * from `gj_user`")
    if (result && result.length) {
      this.userList = result;
      this.userList.sort((user0, user1) => {
        if (!user0.update_time) {
          user0.update_time = new Date('2018-01-01')
        }
        if (!user1.update_time) {
          user1.update_time = new Date('2018-01-01')
        }
        return user0.update_time.getTime() - user1.update_time.getTime()
      })
      console.log(this.userList);
    } else {
      throw "获取用户信息异常"
    }
  }
  async login(user) {
    let loginName = await this.page.$('#loginName')
    if (loginName) {
      await this.page.click('span.login-switch.bar-code.iconfont')
      await this.sleep();
      await this.page.type('#loginName', user.username);
      await this.page.type('#loginPwd', user.password)
      await this.sleep(1000);
      await this.page.click('#loginSubmit')
      console.log(666);
    }
  }


  async clearTable() {
    let sql = `delete FROM gj_push;`
    try {
      await this.execSql(sql)
    } catch (err) {
      console.error(err)
    }
    sql = `delete FROM gj_service;`
    try {
      await this.execSql(sql)
    } catch (err) {
      console.error(err)
    }
    sql = `delete FROM gj_extension;`
    try {
      await this.execSql(sql)
    } catch (err) {
      console.error(err)
    }
  }

  async eachUser() {
    console.log(`>>>eachUser`);
    let list = ['W15810915325'];
    await this.clearTable()
    await this.getUserList()
    if (this.userList.length) {
      for (let index = 0; index < this.userList.length; index++) {
        const user = this.userList[index];
        // if (user.session && list.includes(user.username)) {
          if (user.session) {
          try {
            await this.task1(user);
          } catch (err) {
            console.log(JSON.stringify(user));
            console.error(err)
            //user, blanceHbg58, cookie, nickName
            // await this.login(user);
            this.updateUser(user, '', '', '', 500)
            this.close();
          }
          await this.sleep(1000)
        }
      }
    }
  }
  async mainTask() {
    console.log(`>>>mainTask`);
    try {
      await this.handleDisconnect()
    } catch (err) {
      await this.mainTask()
      return false;
    }
    try {
      await this.eachUser();
    } catch (err) {
      console.log(err);
      await this.sleep(10000)
      await this.mainTask()
    }
  }
  async main() {
    console.log(`>>>main`);
    let that = this;
    await that.mainTask()
    console.log("-Start-");
    schedule.scheduleJob('30 1 * * * *', async function () {
      console.log('scheduleCronstyle:' + new Date());
      await that.mainTask()
      console.log("-END-");
    });
  }

  async getUserInfo() {
    let url = `http://vip.58ganji.com/broker/brokerinfo`
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded'
    })
    await this.page.waitForSelector('.info-header-username')
    let username = await this.page.evaluate(() => {
      return $('.info-header-username').text().trim() || ''
    })
    return username || ''
  }

  //服务中及预约中的套餐开通及到期时间
  async myService(user) {
    console.log(`>>>myService`);
    let url = "http://vip.58ganji.com/thirdredirect/?logintype=wuba&dialog=1/&redirecturl=http://vip.58.com/app/fuwu#/app/wltdingdan/"
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded'
    })
    await this.page.waitForSelector('#ContainerFrame')
    url = await this.page.$eval('#ContainerFrame', ele => ele.src)
    console.log(url);
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded'
    })
    await this.page.waitForSelector('table')

    let serviceArr = await this.page.evaluate(() => {
      function filter() {
        let serviceArr = []
        $('table tr').toArray().map((item, index) => {
          let days = parseInt($(item).find('td:eq(7)').text());
          if (days) {
            //服务状态
            let status = $(item).find('td::eq(4)').text()
            //开通日期
            let start = $(item).find('td::eq(5)').text()
            //到期日期
            let end = $(item).find('td::eq(6)').text()
            serviceArr.push({
              status,
              start,
              end,
              days
            })
          }
        })
        return serviceArr;
      }
      return filter()
    })
    for (let index = 0; index < serviceArr.length; index++) {
      const service = serviceArr[index];
      let sql = "insert into `gj_service`(`user_id`,`username`,`status`,`start`,`end`,`days`,`create_time`) values (" + user.id + ",'" + user.username + "','" + service.status + "','" + service.start + "','" + service.end + "'," + (service.days || '') + ",NOW())"
      try {
        await this.execSql(sql)
      } catch (err) {
        console.error(err)
      }
    }
    return serviceArr
  }
  //推送中，在线购买，还可推送，今日推送到期数量
  async yxtgsp58(user) {
    console.log(`>>>yxtgsp58`);
    let url = `http://vip.58ganji.com/jp58/yxtgsp58`
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded'
    })
    await this.page.waitForSelector('.layout-right')
    let result = await this.page.evaluate(() => {
      function foamat() {
        var data = {}
        $('dt:contains(优先推送)').next().find('>span').toArray().map(item => {
          let info = $(item).text().split('：');
          data[info[0]] = parseInt(info[1])
        })
        let 在线购买 = $('dt:contains(优先推送)').next().find('span:contains(在线购买)').length && $('dt:contains(优先推送)').next().find('span:contains(在线购买)').text().match(/在线购买(\d+)/)[1]
        if (在线购买) {
          在线购买 = parseInt(在线购买)
          data['在线购买'] = 在线购买;
        }
        return data;
      }
      return foamat()
    })
    let sql = "insert into `gj_push`(`user_id`,`username`,`in_progress`,`surplus`,`expire`,`purchase`,`create_time`)" +
      "values(" + user.id + ",'" + user.username + "','" + result['推送中'] + "','" + result['还可推送'] + "','" + result['今日推送到期'] + "','" + result['在线购买'] + "',NOW())"

    try {
      await this.execSql(sql)
    } catch (err) {
      console.error(err)
    }
    return result;
  }

  // 房产推广币，日期选到两年以后，查询最近3笔的余额到期时间及剩余金额
  async myperiod(user) {
    console.log(`>>>myperiod`);
    let url = `https://my.58.com/pro/tuiguangbi/myperiod/`
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded'
    })
    await this.page.waitForSelector('#ContainerFrame')
    url = await this.page.$eval('#ContainerFrame', ele => ele.src)
    console.log(url);
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded'
    })
    await this.page.waitForSelector('#details-ul')
    await this.page.click('#accountkind7')
    await this.page.waitForSelector('#createTimeTos')
    await this.page.evaluate(() => {
      $('#createTimeTos').val('2050-09-04')
    })
    await this.page.click('#btnSubmit')
    await this.sleep(2000)
    let data = await this.page.evaluate(() => {
      function format() {
        return $('table tr:gt(0):lt(3)').toArray().map(item => {
          return {
            '推广币': $(item).find('td:eq(2)').text().trim(),
            '到期时间': $(item).find('td:eq(4)').text().trim(),
            '剩余可用数量': $(item).find('td:eq(5)').text().trim(),
          }
        })
      }
      return format()
    })
    console.log(JSON.stringify(data))
    if (data && data.length) {
      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        let sql = "insert into `gj_extension`(`user_id`,`username`,`account`,`expire`,`quantity`,`create_time`)" +
          "values(" + user.id + ",'" + user.username + "','" + element['推广币'] + "','" + element['到期时间'] + "','" + element['剩余可用数量'] + "',NOW())"

        try {
          await this.execSql(sql)
        } catch (err) {
          console.error(err)
        }
      }
    }
    return data;
  }

}
new GanJi().main();
