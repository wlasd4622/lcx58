let puppeteer = require('puppeteer');
let fs = require('fs')
let moment = require('moment');
let config = require('../config.js')
let mysql = require('mysql');
let Util = require('../common/util.js')
/**
 *监听精选 是否超过当前设置的预算
 */
class Task4 extends Util {
  constructor() {
    super();
    this.taskName = 'task4'
  }
  init() {

  }

  checkTime() {
    let currHours = new Date().getHours();
    return (currHours >= 10 && currHours <= 18);
  }

  async main() {
    this.log(`>>>main`);
    if (!this.checkTime()) {
      return false;
    }
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
        // if (user.user_name != '重庆店之家') {
        //   continue;
        // }
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
    this.log(`>>>loopHouseHandle`);

    try {
      let houseList = await this.getHouseListByDB(user); //0：刷新，1：重新推送，2：精选
      this.log(houseList)
      let houseIdKeys = Object.keys(houseList);
      if (!houseIdKeys.length) {
        return false;
      }
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
      let sxCount = await this.page.evaluate(() => {
        return $('i:contains("预算已达上限")').toArray().length
      })
      if (sxCount && sxCount > 0) {
        this.log(`查找超额数据:${sxCount}`)
      }
      let excessShopList = await this.page.evaluate(() => {
        var shopList = $('i:contains("预算已达上限")').toArray().map(t => {
          return $(t).parents('[tid]')
        }).map(tr => {
          return $(tr).attr('tid');
        });
        return shopList || [];
      })
      let excessShopMap = {};
      for (let i = 0; i < excessShopList.length; i++) {
        let gjId = excessShopList[i];
        let sql = `SELECT * from gj_selected WHERE gj_id ='${gjId}'`;
        let result = await this.execSql(0, sql);
        if (result && result.length && result[0].maximum) {
          excessShopMap[gjId] = result[0].maximum;
        } else {
          excessShopMap[gjId] = 35;
        }
      }
      //当预算已达上限修改  预算
      let logs = await this.page.evaluate((excessShopMap) => {
        let logs = [];
        let shopList = Object.keys(excessShopMap);
        for (let i = 0; i < shopList.length; i++) {
          try {
            var infoid = shopList[i];
            var id = $('[tid="' + infoid + '"]').attr('tgid');
            var budget = $('[tid="' + infoid + '"] p:contains(今日预算)').text().match(/\d+/)[0];
            var maximum = excessShopMap[infoid] || 35;
            if (parseInt(budget) >= maximum) {
              continue;
            }
            budget = parseInt(budget) + 5;
            if (budget > maximum) {
              budget = maximum;
            }
            console.log(infoid);
            console.log(id);
            console.log(budget);
            logs.push(`infoid:${infoid},budget:${budget}`);
            $.ajax({
              type: 'post',
              url: 'http://vip.58ganji.com/ajax/spread/houseinfo58',
              data: {
                id,
                infoid,
                dailyBudget: budget,
                cateId: 20,
                act: 'reset_budget',
              }
            });
          } catch (err) {
            console.log(err);
          }
        }
        return logs;
      }, excessShopMap);
      if (logs && logs.length) {
        logs.map(log => {
          this.log(log);
        })
      }
      await this.sleep(2000)
    } catch (err) {
      let len = await this.waitElement('.login-mod')
      if (len) {
        this.log('账户session失效')
      }
      this.log(err)
    }
  }
}
module.exports = Task4;
