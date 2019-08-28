let fs = require('fs')
let moment = require('moment');
let mysql = require('mysql');
let Util = require('../common/util.js')
let configList = require('../imConfig.js')
/**
 *设置成精选
 */
class IM extends Util {


  constructor() {
    super();
    this.taskName = "im"
  }

  async getUserList() {
    this.log(`>>>getUserList`);
    await this.sleep()
    this.userList = [];
    let result = await this.execSql(0, "select * from `gj_user`")
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
      this.log(this.userList);
    } else {
      throw "获取用户信息异常"
    }
  }

  async gotoImPage(user, puppeteer) {
    await this.setPageCookie(decodeURIComponent(user.session), puppeteer.page)
    let url = 'http://vip.58ganji.com/sydchug/list/sydc';
    await puppeteer.page.goto(url, {
      waitUntil: 'domcontentloaded'
    });
    await puppeteer.page.waitForSelector('.sydc-hug')
    await this.sleep(500)
    url = `http://vip.58ganji.com/thirdredirect/?logintype=wuba&dialog=1/&redirecturl=http://vip.58.com/app/fuwu#/app/wltdingdan/`
    await puppeteer.page.goto(url, {
      waitUntil: 'domcontentloaded'
    });
    await this.page.waitForSelector('#ContainerFrame')
    await this.sleep(500)
    url = `https://webim.58.com/index`
    await puppeteer.page.goto(url, {
      waitUntil: 'domcontentloaded'
    });
    await this.page.waitForSelector('.im-center-bg')
    await this.sleep(500)
    await this.page.evaluate((user) => {
      $('body').append(`<div id="user" style="    position: fixed;
      top: 0;
      left: 0;
      background: #3b497b;
      z-index: 999;
      padding: 10px;
      color: #ffffff;">
        <p>${user.nickname}</p>
        <p>${user.username}</p>
      </div>`)
    }, user)

  }

  async main() {
    try {
      await this.getUserList();
      for (let i = 0; i < configList.length; i++) {
        let config = configList[i];
        if (config.enable) {
          let user = this.userList.find(item => {
            return item.username === config.user_name
          })
          let puppeteer = await this.runPuppeteer()
          await this.gotoImPage(user, puppeteer);
          console.log(user);
        }
      }
    } catch (err) {
      this.log(err)
    }
  }
}


new IM().main()
