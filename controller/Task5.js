let puppeteer = require('puppeteer');
let fs = require('fs')
let moment = require('moment');
let config = require('../config.js')
let mysql = require('mysql');
let Util = require('../common/util.js')
/**
 *下架精选
 */
class Task5 extends Util {
  constructor() {
    super();
    this.taskName = 'Task5'
  }
  init() {

  }

  async main() {
    this.log(`>>>main`);
    await this.init();
    for (let index = 0; index < this.userList.length; index++) {
      this.log(`user.index:${index}`)
      let user = this.userList[index];
      this.log(user)
      let sql = `select * from gj_user where username='${user.user_name}'`
      try {
        let userList = await this.execSql(0, sql)
        if (!userList || userList.length == 0) {
          throw new Error('获取用户信息异常')
        }
        user = Object.assign(user, userList[0])
        var now = new Date();
        var day = now.getDay();
        if (day === 0) {
          day = 7
        }

        //晚上是否下线,默认下线0，1：不下线
        if (user.is_retain === 1) {
          break;
        }

      } catch (err) {
        this.log(err)
      }
      if (user.session && user.status == 0) {
        await this.loopHouseHandle(user);
      }
    }
    this.log('END')
  }

  async loopHouseHandle(user) {
    this.log(`>>>popularizeHandle`);

    try {
      await this.closePuppeteer();
      await this.runPuppeteer({
        headless: false
      });
      let session = decodeURIComponent(user.session)
      await this.setCookie(session, '.58ganji.com', this.page);
      await this.setCookie(session, '.58.com', this.page);
      await this.setCookie(session, '.vip.58.com', this.page);
      await this.setCookie(session, '.anjuke.com', this.page);
      await this.setCookie(session, '.vip.58ganji.com', this.page);
      await this.sleep(500)
      let url = `http://vip.58ganji.com/jp58/list/sp`;
      await this.page.goto(url, {
        waitUntil: 'domcontentloaded'
      });
      await this.page.waitForSelector('.ui-boxer.ui-boxer-default.ui-boxer-fang');
      await this.sleep(500);
      let sxShopIdList = await this.page.evaluate(() => {
        return $('.date.date-jpzw:contains("编号")').toArray().map(t => {
          return $(t).text().match(/\d+/)[0]
        });
      });
      //下线精选
      if (sxShopIdList && sxShopIdList.length) {
        await this.page.evaluate((sxShopIdList) => {
          function get(id) {
            return new Promise((resolve, reject) => {
              try {
                $.ajax({
                  type: 'get',
                  url: `http://vip.58ganji.com/biz58/ajax/jinpai58/cancle?infoId=${id}&cateId=20&_=${new Date().getTime()}`,
                  success() {
                    resolve();
                  },
                  error() {
                    resolve();
                  }
                })
              } catch (err) {
                resolve()
              }
            })

          }
          return new Promise(async (resolve, reject) => {
            try {
              for (let i = 0; i < sxShopIdList.length; i++) {
                const id = sxShopIdList[i];
                console.log(id);
                await get(id);
              }
              setTimeout(() => {
                resolve()
              }, 2000);
            } catch (err) {
              resolve()
            }
          })
        }, sxShopIdList)
      }
    } catch (err) {
      let len = await this.waitElement('.login-mod')
      if (len) {
        this.log('账户session失效')
      }
      this.log(err)
    }
  }
}
module.exports = Task5;
