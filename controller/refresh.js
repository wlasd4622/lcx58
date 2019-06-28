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
  }

  async task1() {
    this.log(`>>>task`);
    for (let index = 0; index < this.userList.length; index++) {
      //TODO
      // index = 3
      let user = this.userList[index];
      this.log(user)
      let sql = `select * from gj_user where username='${user.user_name}'`
      try {
        let userList = await this.execSql(0, sql)
        user = Object.assign(user, userList[0])

      } catch (err) {
        this.log(err)
      }
      if (user.session) {
        await this.refreshHandle(user);
      }
    }
  }

  sleep(ms = 300) {
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
    await this.page.setViewport({
      width: 1500,
      height: 800
    })
  }
  async close() {
    this.log('>>>close');
    if (this.browser) await this.browser.close()
  }

  async houseEditHandle(houseId, user) {
    let editPage = null;
    try {
      await this.page.evaluate((houseId) => {
        $(`tr[tid='${houseId}'] a:contains("编辑")`).attr('id', 'edit')
      }, houseId)
      await this.page.click(`tr[tid='${houseId}'] #edit`);
      await this.sleep(1000)
      let pages = await this.browser.pages()
      editPage = pages[2];
      await editPage.bringToFront()
      let len = this.waitElement('#publish-jpshop-add', editPage);
      if (len) {
        await editPage.evaluate(() => {
          window.scrollTo(0, 100000);
        })
        this.sleep(500);
        let url = "";
        do {
          try {
            len = await editPage.evaluate(() => {
              return $('#publish-jpshop-add').length || 0
            })
            if (len) {
              await editPage.click('#publish-jpshop-add');
            }

          } catch (error) {
            this.log(error)
          }
          await this.sleep(500);
          url = await editPage.evaluate(() => {
            return location.href;
          })
          console.log(url);
        } while (!url.includes('publish/result'))

        len = await this.waitElement('.result-title:contains(保存成功)', editPage)
        if (len) {
          //保存成功
          this.log('保存成功')
        } else {
          //保存失败
          this.log('保存失败')

        }
      } else {
        this.log('未处理异常:63453754')
      }
    } catch (error) {
      this.log('未处理异常:23562')
      this.log(error)
    }
    await this.sleep(600)
    await this.page.bringToFront()
    if (editPage) {
      await editPage.close()
    }
  }

  async houseHandle(houseId, user) {
    this.log(`houseId:${houseId}`);
    let result = {
      status: 0,
      msg: ''
    };
    try {
      let url = `http://vip.58ganji.com/jp58/kcfysp58`
      await this.page.goto(url);
      await this.page.waitForSelector('.ui-boxer-title')
      await this.page.evaluate(() => {
        $('#houselist').remove()
      })
      await this.page.type('#search-name', houseId)
      await this.page.click('input[type=submit]')
      await this.page.waitForSelector('#houselist')
      let houseElement = await this.page.$(`tr[tid='${houseId}']`);
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
    //更新数据库 TODO
  }

  async refreshHandle(user) {
    this.log(user)
    try {
      let houseList = await this.queryHouseDate(user);
      //let houseList = ['38442889699469', '38365050411406', '38361927759267', '38361887896469', '38361852484389']
      if (houseList.length === 0) {
        return false;
      }
      await this.runPuppeteer();
      let url = `http://vip.58ganji.com/jp58/kcfysp58`
      let session = decodeURIComponent(user.session)
      await this.setCookie(session, '.58ganji.com', this.page);
      await this.setCookie(session, '.58.com', this.page);
      await this.setCookie(session, '.vip.58.com', this.page);
      await this.setCookie(session, '.anjuke.com', this.page);
      await this.setCookie(session, '.vip.58ganji.com', this.page);
      await this.sleep(500)
      await this.page.goto(url);
      await this.page.waitForSelector('.ui-boxer-title')
      for (let index = 0; index < houseList.length; index++) {
        if (user.status === 306) {
          //余额不足直接退出
          break;
        }
        await this.houseHandle(houseList[index], user);
      }
    } catch (err) {
      let len = await this.waitElement('.login-mod')
      if (len) {
        this.log('账户session失效')
      }
      this.log(err)
    }
    console.log('refresh-end');
  }

  async waitElement(selector, page) {
    let len = 0;
    this.log('>>>waitElement');
    this.log(selector)
    if (!page) {
      page = this.page
    }

    function wait(selector, page) {
      return new Promise((reject, resolve) => {
        setTimeout(async () => {
          try {
            let length = await page.evaluate(selector => {
              return $(selector).length;
            }, selector);
            reject(length || 0);
          } catch (error) {
            //未处理  位置错误
            // this.log(error)
            // resolve(err)
          }
        }, 500)
      })
    }

    for (let index = 0; index < 10; index++) {
      len = await wait(selector, page)
      if (len) {
        break;
      }
    }
    return len;
  }

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
