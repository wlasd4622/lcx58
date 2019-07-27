let puppeteer = require('puppeteer');
let fs = require('fs')
let moment = require('moment');
let config = require('../config.js')
let mysql = require('mysql');
let Util = require('../common/util.js')
/**
 *精选
 */
class Task4 extends Util {
  constructor() {
    super();
    this.taskName = 'task4'
  }
  init() {

  }

  async main() {
    this.log(`>>>main`);
    await this.init();
    for (let index = 0; index < this.userList.length; index++) {
      this.log(`user.index:${index}`)
      let user = this.userList[index];
      // if (this.userType(user) === 0 || user.user_name === '廊坊010号') {
      //   continue;
      // }
      this.log(user)
      let sql = `select * from gj_user where username='${user.user_name}'`
      try {
        let userList = await this.execSql(0, sql)
        if (!userList || userList.length == 0) {
          throw new Error('获取用户信息异常')
        }
        user = Object.assign(user, userList[0])

      } catch (err) {
        this.log(err)
      }
      if (user.session && user.status == 0) {
        await this.loopHouseHandle(user);
      }
    }
    this.log('END')
  }
  async popularizeHandle(houseObj, user, sxShopIdList) {
    this.log(`>>>popularizeHandle`);
    try {
      if (houseObj.shopId && houseObj.type.includes(2) && !sxShopIdList.includes(houseObj.shopId)) {
        //跳转推广页面
        let url = `http://vip.58ganji.com/biz58/jinpai58/set/${houseObj.shopId}`;
        console.log(url);
        await this.page.goto(url, {
          waitUntil: 'domcontentloaded'
        });
        await this.sleep(1000);
        let popularizeCode = await this.page.evaluate(() => {
          if ($('.result-dts-info:contains("房源已推广")').length) {
            return 1
          } else if ($('[name="budget"]').length) {
            return 2
          } else {
            return 3
          }
        });
        if (popularizeCode === 1) {
          //房源已推广
          this.log('房源已推广');
        } else if (popularizeCode === 3) {
          //throw new Error('未处理异常')
        } else if (popularizeCode === 2) {
          let budget = await this.page.$('[name="budget"]');
          await budget.type('15');
          await this.sleep(300);
          //点击立即推广
          let submitBtn = await this.page.$('.ui-form #btnPromote');
          await submitBtn.click();
          await this.sleep(1000);
          this.log('推广成功！');
        }
      }
    } catch (error) {
      this.log(error)
    }
  }
  async loopHouseHandle(user) {
    this.log(`>>>popularizeHandle`);

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
      //当预算已达上限修改  预算
      await this.page.evaluate(() => {
        var shopList = $('i:contains("预算已达上限")').toArray().map(t => {
          return $(t).parents('[tid]')
        }).map(tr => {
          return $(tr).attr('tid');
        });
        for (let i = 0; i < shopList.length; i++) {
          try {
            var infoid = shopList[i];
            var id = $('[tid="' + infoid + '"]').attr('tgid');
            var budget = $('[tid="' + infoid + '"] p:contains(今日预算)').text().match(/\d+/)[0];
            if(parseInt(budget)>=25){
                continue;
            }
            budget = parseInt(budget) + 5;
            if (budget > 25) {
                budget=25;
            }
            console.log(infoid);
            console.log(id);
            console.log(budget);
            $.ajax({
              type: 'post',
              url: 'http://vip.58ganji.com/ajax/spread/houseinfo58',
              data: {
                id,
                infoid,
                dailyBudget:budget,
                cateId: 20,
                act: 'reset_budget',
              }
            });
          } catch (err) {
            console.log(err);
          }
        }
      });
      await this.sleep(1000)
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
