let puppeteer = require('puppeteer');
let fs = require('fs')
let moment = require('moment');
let config = require('./../config.js')
let mysql = require('mysql');
let Util = require('../common/util.js')
class Task2 extends Util {
  constructor() {
    super();
    this.taskName = 'task2'
  }
  init() {}

  async main() {
    this.log(`>>main`);
    this.init();
    for (let index = 0; index < this.userList.length; index++) {
      this.log(`user.index:${index}`)
      let user = this.userList[index];
      // if (user.user_name != 'anjuke5') {
      //   continue;
      // }
      if (this.userType(user) === 1) {
        this.log(user)
        let sql = `select * from gj_user where username='${user.user_name}'`
        try {
          let userList = await this.execSql(0, sql)
          user = Object.assign(user, userList[0])
        } catch (err) {
          this.log(err)
        }
        if (user.session && user.status == 0) {
          await this.get58HouseId(user);
        }
      }
    }
    this.log(`task2-END`)
  }

  async getPushInfo(infoIdList = []) {
    let pushMap = {};
    pushMap = await this.page.evaluate((infoIdList) => {
      let pushMap = {};
      infoIdList.map(id => {
        pushMap[id] = $(`[data-unityinfoid=${id}] td:eq(2)`).text().trim().includes('58');
      })
      return pushMap;
    }, infoIdList)
    return pushMap;
  }

  /**
   * 获取58店铺id
   * @param {*} user
   */
  async get58HouseId(user) {
    this.log(user)
    try {
      await this.runPuppeteer({
        headless: false
      });
      let session = decodeURIComponent(user.session)
      this.setPageCookie(session, this.page);
      await this.sleep(1000)
      let url = `http://vip.58ganji.com/sydchug/list/sydc`;
      await this.page.goto(url, {
        waitUntil: 'domcontentloaded'
      });
      await this.sleep(1100)
      url = `http://vip.58ganji.com/sydchug/list/sydc`;
      await this.page.goto(url, {
        waitUntil: 'domcontentloaded'
      });
      await this.sleep(1000)
      await this.page.waitForSelector('table.ui-table.sydc-table');
      let houseList = [];
      let pushInfoMap = {};
      let nextDisabled = null;
      do {
        try {
          await this.sleep(900)
          let list = await this.task2GetHouseList(this.page);
          houseList = houseList.concat(list);
          pushInfoMap = {
            ...pushInfoMap,
            ...await this.getPushInfo(list)
          }
          let nextBtn = await this.page.$('#pager .next');
          nextDisabled = await this.page.$('#pager .next.disabled');
          await nextBtn.click()
        } catch (err) {
          this.log(err)
        }
      } while (!nextDisabled)
      houseList = this.unique(houseList)
      if (houseList && houseList.length) {
        for (let index = 0; index < houseList.length; index++) {
          const house = houseList[index];
          let shopId = house
          let sql = `SELECT * from gj_house_id
                    where gj_id='${shopId}'`
          let result = await this.execSql(0, sql)
          if (!result.length) {
            let houseUrl = await this.task2Get58HouseUrl(shopId)
            let houseId = houseUrl.match(/\d{8,}/)[0];
            sql = `insert into \`gj_house_id\` (\`house_id\`,\`gj_id\`,\`create_time\`,\`user_id\`,\`user_name\`)
                 values ('${houseId}','${shopId}',now(),${user.id},'${user.user_name}')`
            await this.execSql(0, sql)
          }
          await this.sleep(300);
        }
      }
      //更新 推送状态
      let pushInfoIds = Object.keys(pushInfoMap || {});
      for (let i = 0; i < pushInfoIds.length; i++) {
        console.log(`>>>>>>>>>>>${i}`);
        const infoId = pushInfoIds[i];
        console.log(infoId);
        let sql = `UPDATE gj_house_id
                  SET is_push = ${pushInfoIds[i] ? 1 : 0}
                  WHERE
                    gj_id = '${infoId}'`;
        await this.execSql(0, sql);
      }
    } catch (err) {
      let len = await this.waitElement('.login-mod', this.page)
      if (len) {
        this.log('账户session失效')
      }
      this.log(err)
    }
    await this.closePuppeteer();
  }

  /**
   *  task2 获取house列表
   */
  async task2GetHouseList() {
    let houseList = [];
    try {
      // houseList = await this.page.evaluate(() => {
      //   function getHouseList() {
      //     return new Promise((resolve, reject) => {
      //       try {
      //         let houseList = []
      //         $.ajax({
      //           url: `http://vip.58ganji.com/separation/houselist/search?pageIndex=1&pageSize=20&cateId=20`,
      //           contentType: 'applicaiton/json',
      //           success: function (res) {
      //             let data = JSON.parse(res);
      //             if (data.data && data.data.infos && data.data.infos.length) {
      //               houseList = data.data.infos;
      //             }
      //             resolve(houseList)
      //           },
      //           error: function (err) {
      //             reject(err)
      //           }
      //         });
      //       } catch (error) {
      //         reject(error)
      //       }
      //     })
      //   }
      //   return getHouseList()
      // });
      // if (houseList.length > 490) {
      //   throw new Error('获取的数据超过490条，请确认是否还有下一页')
      // }
      //获取HouseList
      houseList = await this.page.evaluate(() => {
        return $('.phase span:contains(编号)').toArray().map(s => {
          return $(s).text().match(/\d+/)[0]
        })
      })
    } catch (error) {
      this.log(error)
    }
    return houseList;
  }

  async task2Get58HouseUrl(id) {
    let detailUrl = '',
      houseUrl = '';
    try {
      detailUrl = `http://vip.58ganji.com/sydchug/detail/sydc?houseId=${id}`
      this.log(detailUrl)
      await this.page.goto(detailUrl, {
        waitUntil: 'domcontentloaded'
      })
      await this.page.waitForSelector('.status-part a')
      houseUrl = await this.page.evaluate(() => {
        return $('.status-part a:eq(0)').attr('href');
      })
    } catch (error) {
      this.log(error)
    }
    return houseUrl;
  }

}
module.exports = Task2;
