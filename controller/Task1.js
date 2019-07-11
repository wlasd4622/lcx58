let puppeteer = require('puppeteer');
let schedule = require('node-schedule');
var mysql = require('mysql');
let fs = require('fs')
let config = require('../config.js')
const moment = require('moment');
let Util = require('../common/util')
class Task1 extends Util {
  constructor() {
    super();
    this.taskName = "task1"
    this.userList = config.user;
    this.db = config.db;
    this.houseMap = {};

  }
  async init() {
    try {
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
      this.houseMap = JSON.parse(fs.readFileSync('./house.json').toString());
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
    let catchDate = this.readCatch();
    if (!catchDate) {
      catchDate = {};
      this.writeCatch(catchDate)
    }
    let forIndex = catchDate['main_for_1_index'] || 0;
    for (let index = forIndex; index < this.userList.length; index++) {
      catchDate = this.readCatch();
      if (catchDate['main_for_1_index'] != index) {
        catchDate['loopHouseHandle_for_1_index'] = 0;
      }
      catchDate['main_for_1_index'] = index;
      this.writeCatch(catchDate)
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
   * 房屋编辑保存
   * @param {*} houseId
   * @param {*} user
   */
  async houseEditHandle(houseId, user, shopId) {
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
      } while (!jqueryExist);
      let editUrl = null;
      if (this.userType(user) === 0) {
        editUrl = await this.page.evaluate((houseId) => {
          return jQuery(`tr[tid='${houseId}'] a:contains("编辑")`).attr('href')
        }, houseId)
      } else {
        editUrl = await this.page.evaluate((shopId) => {
          let url = $(`[data-unityinfoid=${shopId}] .edit-btn`).attr('data-href')
          if (!url) {
            return ''
          }
          return location.origin + url;
        }, shopId)
      }
      if (!editUrl) {
        throw new Error('未处理异常:editUrl为空');
      }
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
        await editPage.waitForSelector('#fieldTypeMod')

        await editPage.evaluate(() => {
          //商铺性质:默认选择二手商铺
          if (!$('[name=params_122]').val()) {
            $('[name=params_122]').val(2)
          }
          //相关费用
          // 物业费
          let value = $('[name="params_218"]').val()
          if (value === '0.0') {
            $('[name="params_218"]').val('')
          }
          //电费
          value = $('[name="params_216"]').val()
          if (value === '0.0') {
            $('[name="params_216"]').val('')
          }
        });

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
    this.log('>>>checkSaveDataHandle')
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
   * 廊坊地区上架
   * @param {*} houseId
   * @param {*} user
   * @param {*} result
   * @param {*} shopId
   */
  async LFHousePushHandle(houseId, user, result, shopId) {
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
          let selectList = [15, 7, 5, 3, 1];
          let selectedDays = 0;
          for (let i = 0; i < selectList.length; i++) {
            let days = selectList[i];
            if (surplusDays >= days) {
              selectedDays = days;
              break;
            }
          }
          if (selectedDays) {
            let trIndex = await this.page.evaluate((days) => {
              let td = $('.on-shelf-table tbody td:contains(58):eq(0)');
              td.parent().find(`[data-val=${days}]`).click();
              // td.parent().find('[type="checkbox"]').click();
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
  /**
   * house push
   * @param {*} houseId
   * @param {*} user
   */
  async housePushHandle(houseId, user, result, shopId) {
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
    if (!['正常推送中', '非正常推送中', '推送成功', '推送失败', '余额不足'].includes(result.msg)) {
      throw new Error('housePushHandle result 未处理异常')
    }
    return result;
  }

  async houseRefreshHandle(houseObj, user) {
    this.log(`>>>houseRefreshHandle`)
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
      let houseElement = null;
      if (this.userType(user) === 0) {
        await this.page.type('#search-name', houseId)
        await this.page.click('input[type=submit]')
        await this.page.waitForSelector('#houselist')
        houseElement = await this.page.$(`tr[tid='${houseId}']`);
      } else {
        houseElement = null;
        if (houseObj.shopId) {
          await this.page.type('#shop_search_num', `${houseObj.shopId}`)
          await this.sleep(1000);
          await this.page.evaluate(() => {
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
          // await this.page.click('button.ui-button.ui-button-small.search-btn')
          await this.page.waitForSelector('table.ui-table.sydc-table')
          houseElement = await this.page.$(`tr[data-unityinfoid='${houseObj.shopId}']`);
        }
      }

      if (houseElement) {
        //重新发布信息
        // let isAdd = await this.addHouseInfo(houseId, user);
        // if (isAdd) {
        //   return false;
        // }
        if (houseObj.type.includes(0)) {
          //编辑保存-->>刷新
          this.log(`编辑保存-->>刷新`)
          await this.houseEditHandle(houseId, user, houseObj.shopId);
        }
        if (houseObj.type.includes(1)) {
          //推送--->重新推送
          this.log(`推送--->重新推送`)
          if (this.userType(user) === 0) {
            result = await this.housePushHandle(houseId, user, result, houseObj.shopId);
          } else {
            result = await this.LFHousePushHandle(houseId, user, result, houseObj.shopId);
          }
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
    this.log(`>>>updateHouseStatus`)
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
        // headless:true
      });
      // let url = `http://vip.58ganji.com/jp58/kcfysp58`
      let session = decodeURIComponent(user.session)
      await this.setCookie(session, '.58ganji.com', this.page);
      await this.setCookie(session, '.58.com', this.page);
      await this.setCookie(session, '.vip.58.com', this.page);
      await this.setCookie(session, '.anjuke.com', this.page);
      await this.setCookie(session, '.vip.58ganji.com', this.page);
      await this.sleep(500)
      //刷新
      let catchData = this.readCatch();
      let forIndex = catchData['loopHouseHandle_for_1_index'] || 0
      for (let index = forIndex; index < houseIdKeys.length; index++) {
        catchData = this.readCatch();
        catchData['loopHouseHandle_for_1_index'] = index;
        this.writeCatch(catchData);
        await this.houseRefreshHandle(Object.assign({
          id: houseIdKeys[index],
          shopId: houseList[houseIdKeys[index]].shopId,
          type: houseList[houseIdKeys[index]].type
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


}
module.exports = Task1
