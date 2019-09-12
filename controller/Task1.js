var mysql = require('mysql');
let config = require('../config.js')
let Util = require('../common/util')

/**
 * 上架
 */
class Task1 extends Util {
  constructor() {
    super();
    this.taskName = "task1"
    this.userList = config.user;
    this.db = config.db;
  }
  async init() {
    try {
      this.log(`>>>init`);
      this.userList && this.userList.map(user => {
        if (user.db1 && !user.db4) {
          user.db4 = user.db1
        }
        if (user.db1 && !user.db5) {
          user.db5 = user.db1
        }
        return user;
      })
      let keys = Object.keys(this.db)
      for (let index = 0; index < keys.length; index++) {
        const dbName = keys[index];
        let dbConfig = this.db[dbName]
        dbConfig.useConnectionPooling = true;
        this.db[dbName].pool = mysql.createPool(dbConfig);
      }
    } catch (error) {
      this.log(error)
    }
  }

  /**
   *  主任务
   */
  async main() {
    this.log(`>>>main`);
    await this.init();
    for (let index = 0; index < this.userList.length; index++) {
      this.log(`user.index:${index}`)
      let user = this.userList[index];
      // if (user.user_name !== 'bjdzj1') {
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

  async getCookie() {
    this.log(`>>>getCookie`);
    let cookie = await this.page.evaluate(() => {
      return document.cookie
    })
    return cookie
  }

  /**
   * 获取58上架端口数据
   */
  async search58() {
    return await this.page.evaluate(() => {
      return new Promise((resolve, reject) => {
        try {
          $('li[data-val=58taocan]').click();
          $('button.ui-button.ui-button-small.search-btn').click()
          var ids = [];

          function getIds() {
            setTimeout(() => {
              ids = [...ids, ...$('.phase span:contains(编号)').toArray().map(item => {
                let span = $(item).text();
                return span.match(/\d{10,}/)[0]
              })]
              if ($('.next:not(.disabled):visible').length) {
                $('.next:not(.disabled):visible').click()
                getIds();
              } else {
                resolve(ids)
              }
            }, 3000);
          }
          getIds();
        } catch (err) {
          reject(err)
        }
      })
    });
  }

  /**
   * 廊坊地区上架
   * @param {*} houseId
   * @param {*} user
   * @param {*} result
   * @param {*} shopId
   */
  async LFHousePushHandle(houseId, user, result, shopId) {
    this.log(`>>>LFHousePushHandle`)
    try {
      //判断是否正常推送中
      let isPushIn = await this.page.evaluate((shopId) => {
        return $(`[data-unityinfoid=${shopId}] td:eq(2)`).text().trim().replace('-', '') == '58'
      }, shopId);
      if (isPushIn) {
        //正常推送中
        this.log('正常推送中')
        result = {
          status: 200,
          msg: '正常推送中'
        }
      } else {
        //非正常推送中
        //获取剩余推送时间
        let surplusDays = await this.page.evaluate(() => {
          return $('.taocanshengyu:visible:eq(0)').text().match(/\d+/)[0] || 0;
        });
        this.log('非正常推送中')
        this.log(`surplusDays:${surplusDays}`);
        if (surplusDays > 0) {
          result = {
            status: 300,
            msg: '非正常推送中'
          }
          //检查剩余可推广数
          let surplusCount = await this.page.evaluate(() => {
            return $('[original-title="套餐剩余可推广资源"]').text().match(/\d+/)[0];
          })
          if (surplusCount <= 0) {
            result = {
              status: 489,
              msg: '套餐剩余可推广资源为0'
            }
            throw new Error(489)
          }
          await this.page.click(`[data-unityinfoid='${shopId}'] [original-title="上架"]`)
          await this.sleep(1500)
          let isSucc = await this.page.evaluate(() => {
            return !!$('h2:contains(上架结果)').length
          });
          if (isSucc) {
            //上架成功
            result = {
              status: 0,
              msg: '上架成功'
            }
            throw new Error('0')
          }
          let dy = await this.page.evaluate(() => {
            return !!$('td:contains(58):visible').length
          })
          if (!dy) {
            throw new Error('未找到上架平台58端口')
          }
          let selectList = [15, 7, 5, 3, 1]; //15, 7, 5, 3, 1
          let selectedDays = 0;
          for (let i = 0; i < selectList.length; i++) {
            let days = selectList[i];
            if (surplusDays >= days) {
              selectedDays = days;
              break;
            }
          }
          if (selectedDays > 3) {
            selectedDays=3
          }
          if (selectedDays) {
            let trIndex = await this.page.evaluate((days) => {
              let td = $('.on-shelf-table tbody td:contains(58):eq(0)');
              td.parent().find(`[data-val=${days}]`).click();
              return td.parent().index();
            }, selectedDays)
            await this.sleep(200);
            let checkboxArr = await this.page.$$('.onshelf-body tr.wb-platform [type="checkbox"]');
            if (checkboxArr && checkboxArr[trIndex]) {
              await checkboxArr[trIndex].click();
            } else {
              console.log();
            }

            await this.sleep(300)
            await this.page.click('[value="确认上架"]');
            await this.sleep(1000)
            let pushResult = await this.page.evaluate(() => {
              return $('.iconfont.secc-icon:visible').length || 0
            });
            if (pushResult) {
              //上架成功
              result = {
                status: 0,
                msg: '上架成功'
              }
            } else {
              //上架失败
              let msg = await this.page.evaluate(() => {
                let msg = $('td:contains("上架失败")').text() || $('.result-detail').text().trim().replace(/[\n\s]/g, '') || ''
                if (msg) {
                  msg = msg.replace('：', '')
                }
                return msg;
              })
              result = {
                status: 456,
                msg: `上架失败${msg}`
              }
            }
          } else {
            throw new Error('剩余天数为空')
          }
        } else {
          //套餐天数不足
          this.log('套餐天数不足')
          result = {
            status: 306,
            msg: '套餐天数不足'
          }
        }
      }
    } catch (error) {
      if (!['0', '489'].includes(error.message)) {
        this.log(error)
      } else {
        console.log(666);
      }
    }
    return result;
  }


  async houseRefreshHandle(houseObj, user) {
    this.log(`>>>houseRefreshHandle`)
    let houseId = houseObj.id
    this.log(`houseId:${houseId},type:${houseObj.type.map(i => {
      return ['刷新', '重新推送', '精选'][i]
    })}`);
    let url = `http://vip.58ganji.com/sydchug/list/sydc`
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded'
    });
    await this.page.waitForSelector('table.ui-table.sydc-table')
    await this.page.evaluate(() => {
      $('#houselist').remove();
      $('table.ui-table.sydc-table tbody tr').remove();
    })
    let result = {
      status: 0,
      msg: ''
    };
    try {
      let houseElement = null;
      if (houseObj.shopId) {
        await this.page.type('#shop_search_num', `${houseObj.shopId}`)
        await this.sleep(1000);
        await this.page.evaluate(() => {
          $('[data-val=no_paltfrom_limit]').click();
          $('button.search-btn').trigger('click');

          function searchDone() {
            return new Promise((resolve, reject) => {
              let trimer = setInterval(() => {
                if ($('td.no-list,[data-unityinfoid]').length && $('td.no-list,[data-unityinfoid]').length === 1) {
                  clearInterval(trimer);
                  resolve();
                } else {
                  $('button.search-btn').trigger('click');
                }
              }, 1000);
            });
          }
          return searchDone();
        })
        await this.page.waitForSelector('table.ui-table.sydc-table')
        houseElement = await this.page.$(`tr[data-unityinfoid='${houseObj.shopId}']`);
      }

      if (houseElement) {
        result = await this.LFHousePushHandle(houseId, user, result, houseObj.shopId);
      } else {
        result = {
          status: 304,
          msg: `未找到此房源`
        }
      }
    } catch (error) {
      this.log(error)
    }
    this.log(`------------------------------------`)
    this.log(result);
    this.log(`------------------------------------`)
    //更新数据库
    await this.updateHouseStatus(Object.assign({}, JSON.parse(JSON.stringify(user)), result, {
      houseId
    }))
  }

  async updateHouseStatus(user) {
    this.log(`>>>updateHouseStatus`)
    if (['正常推送中', '上架成功', '', '修改保存异常'].includes(user.msg)) {
      return false;
    }
    let sql = `INSERT INTO \`gj_refresh_house_log\` (
              \`user_id\`,
              \`user_name\`,
              \`house_id\`,
              \`status\`,
              \`message\`,
              \`create_time\`
              )
              VALUES
                (
                ${user.id},
                '${user.user_name}',
                '${user.houseId}',
                '${user.status}',
                '${user.msg}',
                NOW()
                )`;
    try {
      await this.execSql(0, sql)
    } catch (error) {
      this.log(error)
    }
  }

  /**
   * 启动浏览器，setcookie,循环房屋信息
   * @param {*} user
   */
  async loopHouseHandle(user) {
    this.log(`>>>loopHouseHandle`)
    this.log(user)
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
      // let url = `http://vip.58ganji.com/jp58/kcfysp58`
      let session = decodeURIComponent(user.session)
      await this.setCookie(session, '.58ganji.com', this.page);
      await this.setCookie(session, '.58.com', this.page);
      await this.setCookie(session, '.vip.58.com', this.page);
      await this.setCookie(session, '.anjuke.com', this.page);
      await this.setCookie(session, '.vip.58ganji.com', this.page);
      await this.sleep(500)
      let url = `http://vip.58ganji.com/sydchug/list/sydc`
      await this.page.goto(url, {
        waitUntil: 'domcontentloaded'
      });
      await this.page.waitForSelector('table.ui-table.sydc-table')
      await this.page.evaluate(() => {
        $('#houselist').remove();
        $('table.ui-table.sydc-table tbody tr').remove();
      })
      await this.closeDialog();
      let ids58 = await this.search58();
      //刷新
      for (let index = 0; index < houseIdKeys.length; index++) {
        if (houseList[houseIdKeys[index]].shopId && houseList[houseIdKeys[index]].type.includes(1) && !ids58.includes(houseList[houseIdKeys[index]].shopId)) {
          await this.houseRefreshHandle(Object.assign({
            id: houseIdKeys[index],
            shopId: houseList[houseIdKeys[index]].shopId,
            type: houseList[houseIdKeys[index]].type
          }), user);
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
module.exports = Task1
