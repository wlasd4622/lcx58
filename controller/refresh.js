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
    for (let index = 8; index < this.userList.length; index++) {
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
      await this.updateHouseStatus(Object.assign({}, JSON.parse(JSON.stringify(user)), result,{
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

  async houseRefreshHandle(houseId, user) {
    this.log(`houseId:${houseId}`);
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
        await this.houseEditHandle(houseId, user);

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
      let houseList = await this.queryHouseDate(user);
      //let houseList = ['38442889699469', '38365050411406', '38361927759267', '38361887896469', '38361852484389']
      if (houseList.length === 0) {
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
      // await this.page.goto(url, {
      //   waitUntil: 'domcontentloaded'
      // });
      // if (this.userType(user) === 0) {
      //   await this.page.waitForSelector('.ui-boxer-title')
      // } else {
      //   await this.page.waitForSelector('table.ui-table.sydc-table')
      // }

      for (let index = 0; index < houseList.length; index++) {
        // if (user.status === 306) {
        //余额不足直接退出
        //   break;
        // }
        await this.houseRefreshHandle(houseList[index], user);
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
  async queryHouseDate(user) {
    console.log(user);
    let houseList = []
    try {
      // if (user.db1) {
      //   let sql = `SELECT
      //               url
      //             FROM
      //               generalizes AS a
      //               LEFT JOIN sign_details AS b ON a.transfer_store_id = b.transfer_store_id
      //             WHERE
      //               (
      //                 a.post_type = 8
      //                 OR a.post_type = 17
      //               )
      //               AND b.generalize_handle_status < 3 AND generalize_account = ${user.db1} AND a.end_time > curdate( )
      //               AND a.url IS NOT NULL`;
      //   let list = await this.execSql(2, sql);
      //   houseList.push(...(list || []));
      //   sql = `SELECT
      //           url
      //         FROM
      //           generalizes AS a
      //           LEFT JOIN sign_details AS b ON a.transfer_store_id = b.transfer_store_id
      //         WHERE
      //           (
      //             a.post_type = 8
      //             OR a.post_type = 17
      //           )
      //           AND b.generalize_handle_status < 3 AND generalize_account = ${user.db1} AND a.end_time > curdate( )
      //           AND a.url IS NOT NULL`;
      //   list = await this.execSql(3, sql);
      //   houseList.push(...(list || []));
      // }
      if (user.db2) {
        let sql = `SELECT
                    url_58 as url
                  FROM
                    t_signing
                  WHERE
                    ( STATUS = 4 OR \`status\` = 2 )
                    AND expiry_date > CURDATE( )
                    AND promoted_accounts = ${user.db2}
                  ORDER BY
                    expiry_date`;
        let list = await this.execSql(1, sql);
        houseList.push(...(list || []));
      }
      //不进行刷新
      // if (user.db3) {
      //   let sql = `SELECT
      //               url_58_choiceness AS url
      //             FROM
      //               t_signing
      //             WHERE
      //               ( STATUS = 4 OR \`status\` = 2 )
      //               AND date_of_maturity > CURDATE( )
      //               AND do_post_type = ${user.db3}
      //             ORDER BY
      //               date_of_maturity;`;
      //   let list = await this.execSql(1, sql);
      //   houseList.push(...(list || []));
      // }
    } catch (err) {
      this.log(err)
    }
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
