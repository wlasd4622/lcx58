let puppeteer = require('puppeteer');
let schedule = require('node-schedule');
var mysql = require('mysql');
let fs = require('fs')
let config = require('./../config.js')
const moment = require('moment');
class Refresh {
  constructor() {
    this.userList = config.user;
    this.db = config.db
  }
  async init() {
    this.log(`>>>init`);
    this.userList && this.userList.map(user => {
      if (user.db1 && !user.db4) {
        user.db4 = user.db1
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
  }

  getConnection(name) {
    let that = this;
    this.log(`>>>getConnection`);
    return new Promise((resolve, reject) => {
      this.db[name].pool.getConnection(function (err, connection) {
        if (err) {
          that.log(err);
          reject(err)
        } else {
          resolve(connection)
        }
      });
    })
  }

  /**
   *
   * @param {*} name 0:datarefresh,1:bjhyty,2:dianzhijia,3:bs
   * @param {*} sql
   */
  async execSql(nameIndex, sql) {
    let that = this;
    let name = ['datarefresh', 'bjhyty', 'dianzhijia', 'bs'][nameIndex];
    this.log('>>>execSql');
    this.log(name);
    this.log(sql)
    let connection = await this.getConnection(name)
    return new Promise((resolve, reject) => {
      try {
        connection.query(sql, function (err, value) {
          if (err) {
            reject(err)
          } else {
            // that.log(`查询到${value.length}条数据`)
            resolve(value)
          }
        })
        connection.release();
      } catch (err) {
        reject(err)
      }
    })
  }

  log(T) {
    let info = ''
    try {
      if (T instanceof Error) {
        console.error(T)
        info = T.message
        debugger;
      } else {
        info = JSON.stringify(T).replace(/^\"+/, '').replace(/\"+$/, '')
      }
      info = moment().format('YYYY-MM-DD HH:mm:ss') + ' ' + info
      console.log(info);
      if (info.length > 200) {
        info = info.substr(0, 200) + '...'
      }
      fs.appendFileSync(`./logs/${moment().format('YYYY-MM-DD')}.log`, info + '\n')

    } catch (error) {
      console.error(error);
    }
  }

  /**
   *  主任务
   */
  async task1() {
    this.log(`>>>task`);
    for (let index = 0; index < this.userList.length; index++) {
      this.log(`user.index:${index}`)
      let user = this.userList[index];

      if (this.userType(user) !== 0) {
        continue;
      }
      this.log(user)
      let sql = `select * from gj_user where username='${user.user_name}'`
      try {
        let userList = await this.execSql(0, sql)
        user = Object.assign(user, userList[0])

      } catch (err) {
        this.log(err)
      }
      if (user.session) {
        await this.loopHouseHandle(user);
      }
    }
  }

  sleep(ms = 300) {
    this.log(`>>>sleep:${ms}`)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, ms);
    })
  }

  async setCookie(cookies_str = "", domain, page) {
    this.log(`>>>setCookie`);
    let cookies = cookies_str.split(';').map(pair => {
      let name = pair.trim().slice(0, pair.trim().indexOf('='))
      let value = pair.trim().slice(pair.trim().indexOf('=') + 1)
      return {
        name,
        value,
        domain
      }
    });
    return Promise.all(cookies.map(pair => {
      return page.setCookie(pair)
    }));
  }
  async getCookie() {
    this.log(`>>>getCookie`);
    let cookie = await this.page.evaluate(() => {
      return document.cookie
    })
    return cookie
  }


  async runPuppeteer() {
    this.log(`>>>runPuppeteer`);
    try {
      this.close()
    } catch (err) {
      this.log(err);
    }
    this.browser = await puppeteer.launch({
      headless: false,
      args: ['--start-maximized', '--disable-infobars']
    });
    this.page = await this.browser.newPage();
    // await this.page.setViewport({
    //   width: 1500,
    //   height: 800
    // })
  }
  async close() {
    this.log('>>>close');
    try {
      if (this.browser) await this.browser.close()
    } catch (error) {
      this.log(error)
    }
  }

  /**
   * 房屋编辑保存
   * @param {*} houseId
   * @param {*} user
   */
  async houseEditHandle(houseId, user) {
    this.log(`>>>houseEditHandle`)
    let result = ''
    let editPage = null;
    try {
      let jqueryExist = false;
      do {
        this.log(`do:jqueryExist:${jqueryExist}`)
        await this.sleep()
        jqueryExist = await this.page.evaluate(() => {
          return typeof window.jQuery === 'function'
        })
      } while (!jqueryExist)
      let editUrl = await this.page.evaluate((houseId) => {
        return jQuery(`tr[tid='${houseId}'] a:contains("编辑")`).attr('href')
      }, houseId)
      this.log(editUrl)
      // await this.page.click(`tr[tid='${houseId}'] #edit`);
      // await this.sleep(1000)
      let pages = await this.browser.pages()
      editPage = pages[0];
      await editPage.bringToFront()

      let clickStatus = false
      for (let index = 0; index < 5; index++) {
        this.log(`for:${index}`)

        let url = ""
        await editPage.goto(editUrl, {
          waitUntil: 'domcontentloaded'
        })
        await this.sleep(1000)

        let submitBtnElement = await editPage.evaluate(() => {
          let submitBtnElement = ''
          try {
            window.scrollTo(0, 90000)
          } catch (error) {
            console.log(error);
          }
          if ($('#publish-jpshop-add').length) {
            submitBtnElement = '#publish-jpshop-add'
          } else if ($('#publish-jpoffice-add').length) {
            submitBtnElement = '#publish-jpoffice-add'
          }
          return submitBtnElement;
        })
        if (!submitBtnElement) {
          throw "没找到编辑页面提交按钮"
        }
        this.log('click:' + submitBtnElement)
        await this.sleep(600);
        let submitBtn = await editPage.$(submitBtnElement);
        if (submitBtn) {
          await submitBtn.click()
        }
        await this.sleep(1000);
        url = editPage.url()
        this.log(url)
        if (url.includes('publish/result') || url.includes('house/result')) {
          clickStatus = true;
          break;
        }
        //判断提交是否异常
        let message = '修改保存异常'
        let submitMessage = await this.checkSaveDataHandle(editPage);
        if (submitMessage) {
          message = message + ':' + submitMessage
          throw message
        }
      }
      if (!clickStatus) {
        let message = '修改保存异常'
        let submitMessage = await this.checkSaveDataHandle(editPage);
        if (submitMessage) {
          message = message + ':' + submitMessage
        }
        throw message
      }

      let len = await this.waitElement('.result-title:contains(保存成功),dt:contains(编辑成功)', editPage)
      if (len) {
        //保存成功
        this.log('保存成功')
      } else {
        //保存失败
        this.log('保存失败')
      }
    } catch (error) {
      let result = {
        status: 500
      }
      if (typeof error == 'string') {
        result.msg = error;
      } else {
        result.msg = error.message
      }
      //更新数据库
      await this.updateHouseStatus(Object.assign({}, JSON.parse(JSON.stringify(user)), result, {
        houseId
      }))
    }
    await this.sleep(600)
    await this.page.bringToFront()
  }

  /**
   * 检查是否保存成功，并返回错误信息
   * @param {*} editPage
   */
  async checkSaveDataHandle(editPage) {
    let message = ""
    try {
      let errArr = await editPage.evaluate(() => {
        return $('.ui-tips-fail-noborder').toArray().map(item => {
          return $(item).text().replace('', '') || []
        })
      })

      if (errArr && errArr.length) {
        message = errArr.toString();
      }
    } catch (error) {
      this.log(error)
    }
    return message;
  }

  /**
   * house push
   * @param {*} houseId
   * @param {*} user
   */
  async housePushHandle(houseId, user, result) {
    //判断是否正常推送中
    let grey = await this.page.$(`tr[tid='${houseId}'] .grey`);
    if (grey) {
      //正常推送中
      this.log('正常推送中')
      result = {
        status: 200,
        msg: '正常推送中'
      }
    } else {
      //非正常推送中
      this.log('非正常推送中')
      if (user.status == 306) {
        //余额不足
        this.log('余额不足')
        result = {
          status: 306,
          msg: '余额不足'
        }
      } else {
        result = {
          status: 300,
          msg: '非正常推送中'
        }
        let batchproyx = await this.page.$(`tr[tid='${houseId}'] .opt-link.batchproyx`);
        await batchproyx.click();
        await this.sleep(500)
        let timeContList = await this.page.$('.time-cont label:last-child')
        if (timeContList) {
          await timeContList.click();
        }
        await this.sleep(500)
        await this.page.click('.ui-dialog-content .btn-ok');
        //查找 点击确定推送反馈结果弹窗
        let len = await this.waitElement('.ui-alert-mainMsg:visible')
        if (len) {
          len = await this.waitElement('.ui-alert-subMsg:visible')
          if (len) {
            let content = await this.page.evaluate(() => {
              return $('.ui-alert-subMsg:visible').text();
            })
            if (content.includes('推送成功')) {
              //推送成功
              this.log('推送成功')
              result = {
                status: 202,
                msg: '推送成功'
              }
            } else {
              //推送失败
              this.log(`推送失败:${content}`)
              result = {
                status: 303,
                msg: `推送失败:${content}`
              }
            }
          } else {
            this.log('未处理异常，没有找到点击推送后消息内容')
            result = {
              status: 302,
              msg: '未处理异常，没有找到点击推送后消息内容'
            }
          }
        } else {
          let len = await this.waitElement('span:contains(余额不足，请):visible')
          if (len) {
            user.status = 306;
            this.log('余额不足')
            result = {
              status: 306,
              msg: '余额不足'
            }
          } else {
            this.log('未处理异常，没有找到点击推送后结果弹窗')
            result = {
              status: 301,
              msg: '未处理异常，没有找到点击推送后结果弹窗'
            }
          }
        }
      }
      await this.sleep(500)
    }
    return result;
  }

  async houseRefreshHandle(houseObj, user) {
    let houseId = houseObj.id
    this.log(`houseId:${houseId},type:${houseObj.type.map(i => {
      return ['刷新', '重新推送', '精选'][i]
    })}`);

    let result = {
      status: 0,
      msg: ''
    };
    try {
      let url = this.userType(user) === 0 ? `http://vip.58ganji.com/jp58/kcfysp58` : `http://vip.58ganji.com/sydchug/list/sydc`
      await this.page.goto(url, {
        waitUntil: 'domcontentloaded'
      });
      if (this.userType(user) === 0) {
        await this.page.waitForSelector('.ui-boxer-title')
      } else {
        await this.page.waitForSelector('table.ui-table.sydc-table')
      }

      await this.page.evaluate(() => {
        $('#houselist').remove();
        $('table.ui-table.sydc-table tbody tr').remove();
      })
      await this.page.type(this.userType(user) === 0 ? '#search-name' : '#shop_search_num', houseId)
      await this.page.click(this.userType(user) === 0 ? 'input[type=submit]' : 'button.ui-button.ui-button-small.search-btn')
      await this.page.waitForSelector(this.userType(user) == 0 ? '#houselist' : 'table.ui-table.sydc-table')
      let houseElement = await this.page.$(this.userType(user) == 0 ? `tr[tid='${houseId}']` : `tr[data-unityinfoid='${houseId}']`);
      if (houseElement) {
        //重新发布信息
        // let isAdd = await this.addHouseInfo(houseId, user);
        // if (isAdd) {
        //   return false;
        // }
        if (houseObj.type.includes(0)) {
          //编辑保存-->>刷新
          this.log(`编辑保存-->>刷新`)
          await this.houseEditHandle(houseId, user);
        }
        if (houseObj.type.includes(1)) {
          //推送--->重新推送
          this.log(`推送--->重新推送`)
          result = await this.housePushHandle(houseId, user, result);
        }

      } else {
        this.log('未找到此房源')
        result = {
          status: 304,
          msg: `未找到此房源`
        }
      }
    } catch (error) {
      this.log(error)
      result = {
        status: 305,
        msg: `未处理异常:${error.message}`
      }
    }
    this.log(result);
    //更新数据库
    await this.updateHouseStatus(Object.assign({}, JSON.parse(JSON.stringify(user)), result, {
      houseId
    }))
  }

  async updateHouseStatus(user) {
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
   * 获取用户类型
   * 0：正常用户
   * 1：石家庄，廊坊用户
   * @param {*} user
   */
  userType(user) {
    let type = 0
    if (user.user_name.includes('石家庄') || user.user_name.includes('廊坊')) {
      type = 1
    }
    return type;
  }

  /**
   * 启动浏览器，setcookie,循环房屋信息
   * @param {*} user
   */
  async loopHouseHandle(user) {
    this.log(user)
    try {
      let houseList = await this.getHouseListByDB(user); //0：刷新，1：重新推送，2：精选
      this.log(houseList)
      let houseIdKeys = Object.keys(houseList);
      if (!houseIdKeys.length) {
        return false;
      }
      await this.runPuppeteer();
      // let url = `http://vip.58ganji.com/jp58/kcfysp58`
      let session = decodeURIComponent(user.session)
      await this.setCookie(session, '.58ganji.com', this.page);
      await this.setCookie(session, '.58.com', this.page);
      await this.setCookie(session, '.vip.58.com', this.page);
      await this.setCookie(session, '.anjuke.com', this.page);
      await this.setCookie(session, '.vip.58ganji.com', this.page);
      await this.sleep(500)
      //刷新
      for (let index = 0; index < houseIdKeys.length; index++) {
        await this.houseRefreshHandle(Object.assign({
          id: houseIdKeys[index]
        }, {
          type: houseList[houseIdKeys[index]]
        }), user);
      }
    } catch (err) {
      let len = await this.waitElement('.login-mod')
      if (len) {
        this.log('账户session失效')
      }
      this.log(err)
    }
    // console.log('refresh-end');
  }

  /**
   * 查找等待元素出现
   * @param {*} selector
   * @param {*} page
   */
  async waitElement(selector, page) {
    let len = 0;
    try {
      this.log('>>>waitElement');
      this.log(selector)
      if (!page) {
        page = this.page
      }

      let jqueryExist = false;
      do {
        this.log(`do:jqueryExist:${jqueryExist}`)
        await this.sleep()
        jqueryExist = await this.page.evaluate(() => {
          return typeof window.jQuery === 'function'
        })
      } while (!jqueryExist)

      for (let index = 0; index < 10; index++) {
        this.log(`waitElement第${index}次寻找...`)
        await this.sleep(500)
        len = await page.evaluate(selector => {
          return jQuery(selector).length;
        }, selector);
        this.log(`寻找结果${len}`)
        if (len) {
          break;
        }
      }
    } catch (error) {
      console.error(error)
      this.log(error)
    }
    return len;
  }
  /**
   * 从数据库获取房屋信息
   * @param {*} user
   */
  async getHouseListByDB(user) {
    let houseInfo = {
      data0: [],
      data1: [],
      data2: []
    }
    try {
      this.log(`>>>getHouseListByDB`)
      console.log(user);
      let dataManager = {};
      dataManager.db11 = {
        msg: '数据库dianzhijia,刷新，重新推送',
        sql: `SELECT
              url as url
            FROM
              generalizes AS a
              LEFT JOIN sign_details AS b ON a.transfer_store_id = b.transfer_store_id
            WHERE
              (
                a.post_type = 8
                OR a.post_type = 17
              )
              AND b.generalize_handle_status < 3 AND generalize_account = ${user.db1} AND a.end_time > curdate( )
              AND a.url IS NOT NULL`,
        dbIndex: 2, //['datarefresh', 'bjhyty', 'dianzhijia', 'bs']
        type: [0, 1] //0：刷新，1：重新推送，2：精选
      }
      dataManager.db12 = {
        msg: '数据库dianzhijia,刷新，早上9点-10点点击精选，输入15元，确定即可',
        sql: `SELECT
              url as url
            FROM
              generalizes AS a
              LEFT JOIN sign_details AS b ON a.transfer_store_id = b.transfer_store_id
            WHERE
              a.post_type = 9
              AND b.generalize_handle_status < 3 AND generalize_account = ${user.db1} AND a.end_time > curdate( )
              AND a.url IS NOT NULL`,
        dbIndex: 2, //['datarefresh', 'bjhyty', 'dianzhijia', 'bs']
        type: [0, 2] //0：刷新，1：重新推送，2：精选
      }
      dataManager.db21 = {
        msg: '数据库bjhyty,刷新，重新推送',
        sql: `SELECT
              url_58 as url
            FROM
              t_signing
            WHERE
              ( STATUS = 4 OR \`status\` = 2 )
              AND expiry_date > CURDATE( )
              AND promoted_accounts = ${user.db2}
            ORDER BY
              expiry_date`,
        dbIndex: 1, //['datarefresh', 'bjhyty', 'dianzhijia', 'bs']
        type: [0, 1] //0：刷新，1：重新推送，2：精选
      };
      dataManager.db31 = {
        msg: '数据库bjhyty,刷新，早上9点-10点点击精选，输入15元，确定即可',
        sql: `SELECT
              url_58_choiceness as url
            FROM
              t_signing
            WHERE
              ( STATUS = 4 OR \`status\` = 2 )
              AND date_of_maturity > CURDATE( )
              AND do_post_type = ${user.db3}
            ORDER BY
              date_of_maturity`,
        dbIndex: 1, //['datarefresh', 'bjhyty', 'dianzhijia', 'bs']
        type: [0, 2] //0：刷新，1：重新推送，2：精选
      };
      dataManager.db41 = {
        msg: '数据库bs,刷新，重新推送',
        sql: `SELECT
              url as url
            FROM
              generalizes AS a
              LEFT JOIN sign_details AS b ON a.transfer_store_id = b.transfer_store_id
            WHERE
              (
                a.post_type = 8
                OR a.post_type = 17
              )
              AND b.generalize_handle_status < 3 AND generalize_account = ${user.db4} AND a.end_time > curdate( )
              AND a.url IS NOT NULL`,
        dbIndex: 3, //['datarefresh', 'bjhyty', 'dianzhijia', 'bs']
        type: [0, 1] //0：刷新，1：重新推送，2：精选
      };
      dataManager.db42 = {
        msg: '数据库bs,刷新，早上9点-10点点击精选，输入15元，确定即可',
        sql: `SELECT
              url as url
            FROM
              generalizes AS a
              LEFT JOIN sign_details AS b ON a.transfer_store_id = b.transfer_store_id
            WHERE
              a.post_type = 9
              AND b.generalize_handle_status < 3 AND generalize_account = ${user.db4} AND a.end_time > curdate( )
              AND a.url IS NOT NULL`,
        dbIndex: 3, //['datarefresh', 'bjhyty', 'dianzhijia', 'bs']
        type: [0, 2] //0：刷新，1：重新推送，2：精选
      };
      let keys = Object.keys(dataManager);
      for (let i = 0; i < keys.length; i++) {
        let obj = dataManager[keys[i]];
        this.log(obj.msg)
        let list = await this.execSql(obj.dbIndex, obj.sql)
        obj.type.map(i => {
          houseInfo[`data${i}`] = houseInfo[`data${i}`].concat(list || [])
        })
      }
      houseInfo.data0 = this.getHouseIds(houseInfo.data0) || [];
      houseInfo.data1 = this.getHouseIds(houseInfo.data1) || [];
      houseInfo.data2 = this.getHouseIds(houseInfo.data2) || [];

    } catch (error) {
      this.log(error)
    }
    //-----------
    let newHouseIdMap = {}
    try {

      houseInfo.data0.map(id => {
        newHouseIdMap[id] = [0]
      });
      houseInfo.data1.map(id => {
        if (newHouseIdMap[id]) {
          newHouseIdMap[id].push(1)
        } else {
          newHouseIdMap[id] = [1]
        }
      })
    } catch (error) {
      this.log(error)
    }
    return newHouseIdMap;
  }

  getHouseIds(houseList = []) {
    if (houseList && houseList.length) {
      houseList = houseList.map(({
        url
      }) => {
        let houseId = '';
        if (url.includes('.58.com')) {
          houseId = url.match(/\d{10,}/)
        } else {
          this.log('未处理异常：从数据库获取的url不是58.com')
          this.log(url)
        }
        return houseId.toString();
      })
    }
    houseList = this.unique(houseList)
    this.log(houseList)
    return houseList;
  }
  /**
   * 超过十天的帖子 重新发布帖子
   * @param {*} houseId
   * @param {*} user
   */
  async addHouseInfo(houseId, user) {
    this.log(`>>>addHouseInfo:${houseId}`);
    let result = false;
    try {
      await this.waitJquery();
      let status = await this.page.evaluate((houseId) => {
        let status = -1
        try {
          function addDate(date, days) {
            var d = new Date(date);
            d.setDate(d.getDate() + days);
            var m = d.getMonth() + 1;
            return d.getFullYear() + '-' + m + '-' + d.getDate();
          }
          var houseTr = $(`tr[tid=${houseId}]`);
          var time = $(houseTr).find('p:contains(发布)').text().split(' ')[0].replace('发布：', '')
          var month = time.split('-')[0];
          var day = time.split('-')[1];
          var currYear = new Date().getFullYear()
          var currMonth = new Date().getMonth() + 1
          if (month > currMonth) {
            currYear = currYear - 1
          }
          var publishDate = new Date(`${currYear}-${month}-${day}`)
          if (new Date() > new Date(addDate(publishDate, 10))) {
            //超过10天
            console.log('超过10天');
            status = 1400
          } else {
            //未超过10天
            console.log('未超过10天');
            status = 1000
          }
        } catch (error) {
          setInterval(() => {
            console.error(error)
          }, 2000)
          status = -1500
        }
        return status
      }, houseId);
      if (status === -1500) {
        this.log('未处理异常56343')
      } else if (status === 1000) {
        //未超过10天
        this.log('未超过10天');
      } else if (status === 1400) {
        //超过10天
        this.log('超过10天');
        result = true
        let houseDetail = await this.getHouseDetail(houseId);
        this.log(houseDetail)
        await this.addHouseInfoPage(houseDetail, houseId, user)
      }
    } catch (error) {
      this.log(error)
    }
    return result;
  }

  async addHouseInfoPage(houseDetail, houseId, user) {
    this.log(`>>>addHouseInfoPage`)
    try {
      if (!houseDetail || !houseDetail.title) {
        throw new Error('houseDetail对象异常')
      }
      let url = `http://vip.58ganji.com/house/publish/shop/?jpChooseType=2&chooseWeb%5B%5D=2`
      let addHousePage = (await this.browser.pages())[0];
      await addHousePage.bringToFront();
      addHousePage.goto(url, {
        waitUntil: 'domcontentloaded'
      })
      await addHousePage.waitForSelector('#publish_form')
    } catch (error) {
      this.log(error)
    }
  }

  /**
   * 等待jquery
   */
  async waitJquery() {
    this.log(`>>>waitJquery`)
    let jqueryExist = false;
    do {
      this.log(`do:jqueryExist:${jqueryExist}`)
      await this.sleep()
      jqueryExist = await this.page.evaluate(() => {
        return typeof window.jQuery === 'function'
      })
    } while (!jqueryExist)
  }

  /**
   * 获取房屋详情信息
   */
  async getHouseDetail(houseId) {
    this.log(`>>>getHouseDetail:${houseId}`);
    let houseDetailData = {}
    try {
      let houseUrl = await this.page.evaluate((houseId) => {
        var houseTr = $(`tr[tid=${houseId}]`);
        return houseTr.find('.f-cont a:last').attr('href');
      }, houseId)
      if (!houseUrl) {
        throw `houseUrl为空`
      }
      this.log(houseUrl)
      let detailPage = (await this.browser.pages())[0];
      await detailPage.bringToFront();
      detailPage.goto(houseUrl, {
        waitUntil: 'domcontentloaded'
      })
      await detailPage.waitForSelector('.house-title')
      await detailPage.addScriptTag({
        url: 'https://wlasd4622.github.io/lcx58/common/58.js'
      })
      await this.sleep(1000)
      houseDetailData = await detailPage.evaluate(() => {
        try {
          getHouseDetail();
        } catch (error) {
          console.lerror(error)
        }
        return window.houseDetailData;
      })
      console.log(houseDetailData);
    } catch (error) {
      this.log(error)
    }
    return houseDetailData;
  }

  unique(arr) {
    return Array.from(new Set(arr))
  }

  async main() {
    this.log(`>>>main`);
    await this.init()
    await this.task1()
  }
}

new Refresh().main();
