let puppeteer = require('puppeteer');
let fs = require('fs')
let moment = require('moment');
let config = require('./../config.js')
let mysql = require('mysql');

class Util {
  constructor(args) {
    if (args != 0) {
      this.db = config.db;
      this.userList = config.user;
      this.getUserList();
      this.initDB();
    }
  }

  initDB() {
    let keys = Object.keys(this.db)
    for (let index = 0; index < keys.length; index++) {
      const dbName = keys[index];
      let dbConfig = this.db[dbName]
      dbConfig.useConnectionPooling = true;
      this.db[dbName].pool = mysql.createPool(dbConfig);
    }
  }
  getUserList() {
    this.userList && this.userList.map(user => {
      if (user.db1 && !user.db4) {
        user.db4 = user.db1
      }
      if (user.db1 && !user.db5) {
        user.db5 = user.db1
      }
      return user;
    })
  }
  getConnection(name) {
    let that = this;
    this.log(`>>>getConnection`);
    return new Promise((resolve, reject) => {
      try {
        this.db[name].pool.getConnection(function (err, connection) {
          if (err) {
            that.log(err);
            reject(err)
          } else {
            resolve(connection)
          }
        });
      } catch (error) {
        this.log(error)
        reject(error)
      }
    })
  }

  log(T) {
    let info = ''
    try {
      if (T instanceof Error) {
        console.error(T)
        info = T.message
        if (info != '修改保存异常') {
          debugger;
        }
      } else {
        info = JSON.stringify(T).replace(/^\"+/, '').replace(/\"+$/, '')
      }
      try {
        info = info.replace(/\\n/g, '').replace(/\s+/g, ' ')
      } catch (err) {
        console.log(err);
      }
      info = moment().format('YYYY-MM-DD HH:mm:ss') + ' ' + info
      console.log(info);
      // if (info.length > 200) {
      //   info = info.substr(0, 200) + '...'
      // }
      if (this.taskName) {
        if (!fs.existsSync(`./logs/${this.taskName}/`)) {
          fs.mkdirSync(`./logs/${this.taskName}/`)
        }
        fs.appendFileSync(`./logs/${this.taskName}/${moment().format('YYYY-MM-DD')}.log`, info +
          '\n')
      } else {
        fs.appendFileSync(`./logs/${moment().format('YYYY-MM-DD')}.log`, info + '\n')
      }
    } catch (error) {
      console.error(error);
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


  async runPuppeteer(options = {}) {
    this.log(`>>>runPuppeteer`);
    this.browser = await puppeteer.launch(Object.assign({}, {
      headless: false,
      args: ['--start-maximized', '--disable-infobars']
    }, options));
    this.page = await this.browser.newPage();
    await this.page.setViewport({
      width: 1200,
      height: 800
    })
    return {
      browser: this.browser,
      page: this.page
    }
  }

  async goto(url, selector, page = this.page) {
    await page.goto(url, {
      waitUntil: 'domcontentloaded'
    })
    if (selector) {
      await waitForSelector(selector)
    }
  }

  async closePuppeteer() {
    this.log('>>>closePuppeteer');
    try {
      if (this.browser) {
        await this.browser.close()
      }
    } catch (error) {
      this.log(error)
    }
  }

  async loadJquery(page = this.page) {
    try {
      await page.evaluate(() => {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//cdn.bootcss.com/jquery/2.1.2/jquery.min.js';
        document.getElementsByTagName('head')[0].appendChild(script);
      })
      await this.sleep(1000)
    } catch (err) {
      this.log(err)
    }
  }

  /**
   * 查找等待元素出现
   * @param {*} selector
   * @param {*} page
   */
  async waitElement(selector, page = this.page) {
    let len = 0;
    try {
      this.log('>>>waitElement');
      this.log(selector)
      let jqueryExist = false;
      let doCount = 0
      do {
        doCount++;
        this.log(`do:jqueryExist:${jqueryExist}`)
        await this.sleep()
        jqueryExist = await page.evaluate(() => {
          return typeof window.jQuery === 'function'
        })
        if (doCount > 20) {
          doCount = 0;
          await this.loadJquery(page);
        }
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
      this.log(error)
    }
    return len;
  }



  /**
   * 等待jquery
   */
  async waitJquery(page = this.page) {
    this.log(`>>>waitJquery`)
    let jqueryExist = false;
    let doCount = 0;
    do {
      doCount++;
      this.log(`do:jqueryExist:${jqueryExist}`)
      await sleep()
      jqueryExist = await page.evaluate(() => {
        return typeof window.jQuery === 'function'
      })

      if (doCount > 20) {
        doCount = 0;
        await this.loadJquery(page);
      }
    } while (!jqueryExist)
  }



  unique(arr) {
    return Array.from(new Set(arr))
  }


  /**
   *
   * @param {*} name 0:datarefresh,1:bjhyty,2:dianzhijia,3:bs
   * @param {*} sql
   */
  async execSql(nameIndex, sql) {
    let name = ['datarefresh', 'bjhyty', 'dianzhijia', 'bs', 'pu'][nameIndex];
    this.log('>>>execSql');
    this.log(name);
    this.log(sql)
    let connection = await this.getConnection(name)
    this.log(`threadId:${connection.threadId}`)
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


  async setCookie(cookies_str = "", domain, page = this.page) {
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

  async setPageCookie(session, page = this.page) {
    await this.setCookie(session, '.58ganji.com', page);
    await this.setCookie(session, '.58.com', page);
    await this.setCookie(session, '.vip.58.com', page);
    await this.setCookie(session, '.anjuke.com', page);
    await this.setCookie(session, '.vip.58ganji.com', page);
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
        dbIndex: 2, //['datarefresh', 'bjhyty', 'dianzhijia', 'bs','pu']
        type: [0, 1] //0：刷新，1：重新推送，2：精选
      }
      dataManager.db12 = {
        msg: '数据库dianzhijia,刷新，精选',
        sql: `SELECT
              url as url
            FROM
              generalizes AS a
              LEFT JOIN sign_details AS b ON a.transfer_store_id = b.transfer_store_id
            WHERE
              a.post_type = 9
              AND b.generalize_handle_status < 3 AND generalize_account = ${user.db1} AND a.end_time > curdate( )
              AND a.url IS NOT NULL`,
        dbIndex: 2, //['datarefresh', 'bjhyty', 'dianzhijia', 'bs','pu']
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
        dbIndex: 1, //['datarefresh', 'bjhyty', 'dianzhijia', 'bs','pu']
        type: [0, 1] //0：刷新，1：重新推送，2：精选
      };
      dataManager.db31 = {
        msg: '数据库bjhyty,刷新，精选',
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
        dbIndex: 1, //['datarefresh', 'bjhyty', 'dianzhijia', 'bs','pu']
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
        dbIndex: 3, //['datarefresh', 'bjhyty', 'dianzhijia', 'bs','pu']
        type: [0, 1] //0：刷新，1：重新推送，2：精选
      };
      dataManager.db42 = {
        msg: '数据库bs,刷新，精选',
        sql: `SELECT
              url as url
            FROM
              generalizes AS a
              LEFT JOIN sign_details AS b ON a.transfer_store_id = b.transfer_store_id
            WHERE
              a.post_type = 9
              AND b.generalize_handle_status < 3 AND generalize_account = ${user.db4} AND a.end_time > curdate( )
              AND a.url IS NOT NULL`,
        dbIndex: 3, //['datarefresh', 'bjhyty', 'dianzhijia', 'bs','pu']
        type: [0, 2] //0：刷新，1：重新推送，2：精选
      };
      dataManager.db51 = {
        msg: '数据库pu,刷新，重新推送',
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
              AND b.generalize_handle_status < 3 AND generalize_account = ${user.db5} AND a.end_time > curdate( )
              AND a.url IS NOT NULL`,
        dbIndex: 4, //['datarefresh', 'bjhyty', 'dianzhijia', 'bs','pu']
        type: [0, 1] //0：刷新，1：重新推送，2：精选
      };
      dataManager.db52 = {
        msg: '数据库pu,刷新，精选',
        sql: `SELECT
              url as url
            FROM
              generalizes AS a
              LEFT JOIN sign_details AS b ON a.transfer_store_id = b.transfer_store_id
            WHERE
              a.post_type = 9
              AND b.generalize_handle_status < 3 AND generalize_account = ${user.db5} AND a.end_time > curdate( )
              AND a.url IS NOT NULL`,
        dbIndex: 4, //['datarefresh', 'bjhyty', 'dianzhijia', 'bs','pu']
        type: [0, 2] //0：刷新，1：重新推送，2：精选
      };
      let keys = Object.keys(dataManager);
      for (let i = 0; i < keys.length; i++) {
        let obj = dataManager[keys[i]];
        this.log(obj.msg)
        let list = []
        try {
          list = await this.execSql(obj.dbIndex, obj.sql)
        } catch (error) {
          console.log(error);
        }
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
        newHouseIdMap[id] = {
          type: [0]
        }
      });
      houseInfo.data1.map(id => {
        if (newHouseIdMap[id]) {
          newHouseIdMap[id].type.push(1)
        } else {
          newHouseIdMap[id] = {
            type: [1]
          }
        }
      });
      houseInfo.data2.map(id => {
        if (newHouseIdMap[id]) {
          newHouseIdMap[id].type.push(2)
        } else {
          newHouseIdMap[id] = {
            type: [2]
          }
        }
      });
      //如果是石家庄或者廊坊账号需要转换id
      if (this.userType(user) === 1) {
        for (let key in newHouseIdMap) {
          let houseId = key;
          let sql = `SELECT * from gj_selected
                      where house_id='${houseId}'`;
          let result = await this.execSql(0, sql);
          let shopId = ''
          if (result && result.length) {
            shopId = result[0].gj_id
          }
          newHouseIdMap[key].shopId = shopId;
        }
      }
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
   * 获取用户类型
   * 0：正常用户
   * 1：石家庄，廊坊用户
   * @param {*} user
   */
  userType(user) {
    // let type = 0
    // if (user.user_name.includes('石家庄') || user.user_name.includes('廊坊') || user.user_name.includes('青岛')) {
    //   type = 1
    // }
    return 1;
  }
  readCatch() {
    try {
      if (!this.taskName) {
        throw new Error('taskName为空');
      }
      if (!fs.existsSync('./catch')) {
        fs.mkdirSync('./catch')
      }
      if (!fs.existsSync(`./catch/${this.taskName}.json`)) {
        fs.writeFileSync(`./catch/${this.taskName}.json`, JSON.stringify({}))
      }
    } catch (error) {
      this.log(error)
    }
    return JSON.parse(fs.readFileSync(`./catch/${this.taskName}.json`) || '""');
  }
  writeCatch(data) {
    fs.writeFileSync(`./catch/${this.taskName}.json`, JSON.stringify(data))
  }


    /**
   * 关闭弹窗
   */
  async closeDialog(page = this.page) {
    this.log(`>>>closeDialog`)
    await page.evaluate(() => {
      if ($('div.ui-mask:visible').length) {
        $('div.ui-mask:visible').hide();
        $('div.ui-dialog:visible').hide();
      }
    })
  }

  groupArray(array, subGroupLength) {
    let index = 0;
    let newArray = [];
    while (index < array.length) {
      newArray.push(array.slice(index, index += subGroupLength));
    }
    return newArray;
  }
}
module.exports = Util;
