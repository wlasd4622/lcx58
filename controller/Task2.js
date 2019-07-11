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
  init() {
  }

  async main() {
    this.log(`>>main`);
    this.init();
    for (let index = 0; index < this.userList.length; index++) {
      this.log(`user.index:${index}`)
      let user = this.userList[index];
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

  /**
   * 获取58店铺id
   * @param {*} user
   */
  async get58HouseId(user) {
    this.log(user)
    try {
      await this.runPuppeteer({
        headless: true
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
          let sql = `SELECT * from gj_house_id
                    where gj_id='${shopId}'`
          let result = await this.execSql(0, sql)
          if (!result.length) {
            let houseUrl = await this.task2Get58HouseUrl(house, this.page)
            let houseId = houseUrl.match(/\d{8,}/)[0];
            sql = `insert into \`gj_house_id\` (\`house_id\`,\`gj_id\`,\`create_time\`,\`user_id\`,\`user_name\`)
                 values ('${houseId}','${shopId}',now(),${user.id},'${user.user_name}')`
            await this.execSql(0, sql)
          }
          await this.sleep(300);
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
      if (houseList.length > 490) {
        throw new Error('获取的数据超过490条，请确认是否还有下一页')
      }
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
