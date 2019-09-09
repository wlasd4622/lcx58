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
  async init() {

  }

  /**
   *
   * @param {*} flag 0:取消除成都账户精选，1：取消成都账户精选
   */
  async main(flag = 0) {
    this.log(`>>>main`);
    this.log(`flag:${flag}`)
    await this.init();
    for (let index = 0; index < this.userList.length; index++) {
      this.log(`user.index:${index}`)
      let user = this.userList[index];
      //if (user.user_name !== '成都3号') {
      //  continue;
      //}
      this.log(user)
      let sql = `select * from gj_user where username='${user.user_name}'`
      try {
        let userList = await this.execSql(0, sql)
        if (!userList || userList.length == 0) {
          throw new Error('获取用户信息异常')
        }
        user = Object.assign(user, userList[0]);

      } catch (err) {
        this.log(err)
      }
      if (user.session && user.status == 0) {
        if ((flag === 0 && !user.user_name.includes('成都')) || (flag === 1 && user.user_name.includes('成都'))) {
          //重置字段costs
          let sql = `update gj_selected set costs=null WHERE user_name='${user.user_name}'`;
          await this.execSql(0, sql);
          await this.loopHouseHandle(user);
        }
      }
    }
    this.log('END')
  }

  /**
   * 获取下线list
   * @param {*} houseObj
   * @param {*} user
   */
  async getRetainList(sxShopIdList) {
    let retainList = [];
    try {
      for (let i = 0; i < sxShopIdList.length; i++) {
        let sql = `SELECT * from gj_selected WHERE gj_id='${sxShopIdList[i]}'`;
        let result = await this.execSql(0, sql);
        if (result && result.length) {
          let isRetain = result[0].is_retain || '0'; //默认下线
          if (isRetain == 0) {
            retainList.push(sxShopIdList[i]);
          }
        } else {
          retainList.push(sxShopIdList[i]);
        }
      }

    } catch (err) {
      this.log(err);
    }
    return retainList;
  }
  /**
   * 更新到晚上的实际消费
   */
  async updatacosts(sxShopIdList) {
    try {
      this.log(`>>>updatacosts`);
      for (let i = 0; i < sxShopIdList.length; i++) {
        let tid = sxShopIdList[i];
        let obj = await this.page.evaluate((tid) => {
          let preselection = $(`[tid="${tid}"] p:contains("今日预算")`).text().replace('今日预算：', '');
          let actual = $(`[tid="${tid}"] p:contains("剩余预算")`).text().replace('剩余预算：', '');
          let costs = preselection - actual;
          return {
            preselection,
            actual,
            costs
          }
        }, tid);
        this.log(obj);
        let sql = `update gj_selected set costs=${obj.costs},update_time=NOW() where gj_id='${tid}'`;
        try {
          await this.execSql(0, sql)
        } catch (err) {
          this.log(err);
        }
      }
    } catch (err) {
      this.log(err)
    }
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
      await this.closeDialog()
      let sxShopIdList = await this.page.evaluate(() => {
        return $('.date.date-jpzw:contains("编号")').toArray().map(t => {
          return $(t).text().match(/\d+/)[0]
        });
      });
      //下线精选
      if (sxShopIdList && sxShopIdList.length) {
        //更新到晚上的实际消费
        await this.updatacosts(sxShopIdList);
        let retainList = await this.getRetainList(sxShopIdList);

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
        }, retainList);
        this.log(`取消精选`);
        this.log(retainList)
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
