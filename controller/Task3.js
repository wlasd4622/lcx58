let puppeteer = require('puppeteer');
let fs = require('fs')
let moment = require('moment');
let config = require('../config.js')
let mysql = require('mysql');
let Util = require('../common/util.js')
/**
 *
 */
class Task3 extends Util {
  constructor() {
    super();
    this.taskName = 'task3'
  }
  init() {
    if (!fs.existsSync('./house.json')) {
      fs.writeFileSync('./house.json', JSON.stringify({}));
    }
    this.houseMap = JSON.parse(fs.readFileSync('./house.json').toString());
  }

  async main() {
    this.log(`>>main`);
    this.init();
    for (let index = 0; index < this.userList.length; index++) {
      this.log(`user.index:${index}`)
      let user = this.userList[index];
      this.log(user)
      let sql = `select * from gj_user where username='${user.user_name}'`
      try {
        let userList = await this.execSql(0, sql)
        user = Object.assign(user, userList[0])
      } catch (err) {
        this.log(err)
      }
      if (user.session && user.status == 0) {
        let houseIdMap = await this.getHouseListByDB(user)
        let houseIdList = Object.keys(houseIdMap)
        if (houseIdList && houseIdList.length) {
          await this.setHighQuality(user, houseIdMap);
        }
      }
    }
    this.log(`task2-END`)
  }

  /**
   * 设置精选
   * @param {*} user
   */
  async setHighQuality(user) {
    this.log(user)
    try {
      await this.runPuppeteer({
        headless: false
      });
      let session = decodeURIComponent(user.session)
      this.setPageCookie(session, this.page);
      await this.sleep(10)
      let url = `http://vip.58ganji.com/sydchug/list/sydc`;
      await this.page.goto(url, {
        waitUntil: 'domcontentloaded'
      });
      await this.page.waitForSelector('table.ui-table.sydc-table');
      let houseList = await this.task2GetHouseList(this.page);
      if (houseList && houseList.length) {
        for (let index = 0; index < houseList.length; index++) {
          const house = houseList[index];
          let shopId = house.unityInfoId
          if (!this.houseMap[`b_${shopId}`]) {
            let houseUrl = await this.task2Get58HouseUrl(house, this.page)
            let houseId = houseUrl.match(/\d{8,}/)[0];
            this.houseMap[`a_${houseId}`] = shopId;
            this.houseMap[`b_${shopId}`] = houseId;
            fs.writeFileSync('./house.json', JSON.stringify(this.houseMap));
          }
        }
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
      houseList = await this.page.evaluate(() => {
        function getHouseList() {
          return new Promise((resolve, reject) => {
            try {
              let houseList = []
              $.ajax({
                url: `http://vip.58ganji.com/separation/houselist/search?pageIndex=1&pageSize=500&cateId=20`,
                contentType: 'applicaiton/json',
                success: function (res) {
                  let data = JSON.parse(res);
                  if (data.data && data.data.infos && data.data.infos.length) {
                    houseList = data.data.infos;
                  }
                  resolve(houseList)
                },
                error: function (err) {
                  reject(err)
                }
              });
            } catch (error) {
              reject(error)
            }
          })
        }
        return getHouseList()
      });
    } catch (error) {
      this.log(error)
    }
    return houseList;
  }

  async task2Get58HouseUrl(house) {
    let detailUrl = '',
      houseUrl = '';
    try {
      detailUrl = `http://vip.58ganji.com/sydchug/detail/sydc?houseId=${house.unityInfoId}`
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
module.exports = Task3;
