let puppeteer = require('puppeteer');
let fs = require('fs')
let moment = require('moment');
let config = require('../config.js')
let mysql = require('mysql');
let Util = require('../common/util.js')
/**
 *设置成精选
 */
class Task3 extends Util {
  constructor() {
    super();
    this.taskName = 'task3'
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
        var now = new Date();
        var day = now.getDay();
        if (day === 0) {
          day = 7
        }
        user.nowWeek = day;
      } catch (err) {
        this.log(err)
      }
      if (user.session && user.status == 0) {
        await this.loopHouseHandle(user);
      }
    }
    this.log('END')
  }

  /**
   * 是否设置精选
   * @param {*} houseObj
   * @param {*} user
   */
  async isSelected(houseObj, user) {
    try {
      //精选日期,空或者1,2,3,4,5,6,7  判断数据库是否设置了selected_date，如果设置再判断是否包含当天日期
      let sql = `SELECT * from gj_selected
                  WHERE gj_id='${houseObj.shopId}'`;
      let result = await this.execSql(0, sql);
      if (result && result.length) {
        let selected_date = result[0].selected_date || '1,2,3,4,5,6,7';
        if (selected_date.includes(user.nowWeek.toString())) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    } catch (err) {
      this.log(err);
      return true;
    }
  }

  async popularizeHandle(houseObj, user, sxShopIdList) {
    this.log(`>>>popularizeHandle`);
    try {
      if (houseObj.shopId && houseObj.type.includes(2) && !sxShopIdList.includes(houseObj.shopId) && await this.isSelected(houseObj, user)) {
        //跳转推广页面
        let url = `http://vip.58ganji.com/biz58/jinpai58/set/${houseObj.shopId}`;
        console.log(url);
        await this.page.goto(url, {
          waitUntil: 'domcontentloaded'
        });
        await this.sleep(1000);
        await this.closeDialog()
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
      await this.closeDialog()
      let sxShopIdList = await this.page.evaluate(() => {
        return $('.date.date-jpzw:contains("编号")').toArray().map(t => {
          return $(t).text().match(/\d+/)[0]
        });
      });
      //精选
      for (let index = 0; index < houseIdKeys.length; index++) {
        if (houseList[houseIdKeys[index]].type.includes(2)) {
          await this.popularizeHandle(Object.assign({
            id: houseIdKeys[index],
            shopId: houseList[houseIdKeys[index]].shopId,
            type: houseList[houseIdKeys[index]].type
          }), user, sxShopIdList);
        }
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
module.exports = Task3;
