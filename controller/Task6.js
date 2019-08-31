let mysql = require('mysql');
let config = require('../config.js')
let Util = require('../common/util')
let axios = require('axios')
/**
 * 刷新,推送 houseInfo
 */
class Task6 extends Util {
  constructor() {
    super();
    this.taskName = "task6"
    this.userList = config.user;
    this.db = config.db;
  }
  async init() {
    this.log(`>>>init`);
    try {
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
      // if (user.user_name !== '石家庄998') {
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
        // 是否开通全网通套餐的城市x
        this.isServiceCombo = await this.getIsServiceCombo(user);
        //先下架
        await this.sydcdown(user);
        //后上架
        await this.sydcup(user)
      }
    }
    this.log('END')
  }
  async searchHouseIds(user) {
    this.log(`>>>searchHouseIds`)
    let houseIds_1 = [];
    try {
      function getIds(pageIndex = 1) {
        return new Promise((resolve, reject) => {
          let url = `http://vip.58ganji.com/separation/houselist/search?pageIndex=${pageIndex}&pageSize=20&pt=58taocan&tg=no_ecommerce_limit&sp=no_vrvideo_limit&lb=allCategory&bt=&id=&px=updatedesc&cateId=20&searchAction=&_=${new Date().getTime()}`;
          this.log(url);
          try {
            axios.request({
              url,
              headers: {
                cookie: decodeURIComponent(user.session)
              }
            }).then(res => {
              let houseIds = [];
              if (res.data.data && res.data.data.infos && res.data.data.infos.length) {
                res.data.data.infos.map(item => {
                  houseIds.push(item.unityInfoId)
                })
              }
              resolve(houseIds)
            }).catch(err => {
              this.log(err)
              resolve([])
            })
          } catch (err) {
            this.log(err)
            resolve([])
          }
        })
      }

      let _ids = [];
      let pageIndex = 1
      do {
        _ids = await getIds.call(this, pageIndex);
        this.log(_ids)
        pageIndex++;
        houseIds_1 = houseIds_1.concat(_ids)
        await this.sleep(1000)
      } while (_ids.length >= 20)
    } catch (err) {
      this.log(err)
    }
    return houseIds_1;
  }
  async sydcdownRequest(user, houseIds = []) {
    this.log(`>>>sydcdownRequest`)

    function request(houseIds = []) {
      return new Promise((resolve, reject) => {
        //是否套餐服务化城市，兼容新旧接口
        let url = `http://vip.58ganji.com/separation/house/taocan/sydcdown?platform=wb&houseIds=${encodeURIComponent(houseIds.join())}&_=${new Date().getTime()}`;
        if (this.isServiceCombo) {
          url = `http://vip.58ganji.com/separation/house/combo?houseIds=${encodeURIComponent(houseIds.join())}&upPlat=wb&apiType=comboHouseDown&from=jp&_=${new Date().getTime()}`
        }
        console.log(`${url}`);
        try {
          axios.request({
            url,
            headers: {
              cookie: decodeURIComponent(user.session)
            }
          }).then(res => {
            if (res.data.status === 'ok') {
              this.log(res.data.data.wb)
            } else {
              this.log(`未处理异常2:${res.data.message}`)
            }
            resolve(res);
          }).catch(err => {
            resolve();
          })
        } catch (err) {
          this.log(err)
          resolve()
        }
      })
    }
    let houseIdsArr = this.groupArray(houseIds, 20);
    for (let i = 0; i < houseIdsArr.length; i++) {
      await request.call(this, houseIdsArr[i])
      await this.sleep(15000)
    }
  }

  /**
   * 下架
   */
  async sydcdown(user) {
    this.log(`>>>sydcdown`)
    try {
      let houseIds = [];
      let doCount = 0;
      do {
        doCount++;
        houseIds = await this.searchHouseIds(user);
        if (houseIds.length) {
          this.log(`待下架：${houseIds}`)
          await this.sydcdownRequest(user, houseIds)
          await this.sleep(15000);
        }
      } while (houseIds.length && doCount < 6);
    } catch (err) {
      this.log(err);
    }
  }

  /**
   * 从数据库获取houseids
   */
  async getHouseIdsByDB(user) {
    this.log(`>>>getHouseIdsByDB`)
    let houseList = await this.getHouseListByDB(user); //0：刷新，1：重新推送，2：精选
    this.log(houseList)
    let houseIdKeys = Object.keys(houseList);
    if (!houseIdKeys.length) {
      return false;
    }
    //推送|上架
    let sydcupHouseIds = []
    for (let i = 0; i < houseIdKeys.length; i++) {
      if (houseList[houseIdKeys[i]].type.includes(1)) {
        sydcupHouseIds.push(houseList[houseIdKeys[i]].shopId)
      }
    }
    return sydcupHouseIds;
  }

  /**
   * 获取是否开通全网通套餐的城市x
   */
  async getIsServiceCombo(user) {
    this.log(`>>>getIsServiceCombo`)
    let url = `http://vip.58ganji.com/sydchug/list/sydc`
    return new Promise((resolve, reject) => {
      try {
        axios.request({
          url,
          headers: {
            cookie: decodeURIComponent(user.session)
          }
        }).then(res => {
          resolve(res.data.match(/var\sisServiceCombo.*?;/)[0].includes('1'))
        }).catch(err => {
          resolve(false);
        })
      } catch (err) {
        resolve(false)
      }
    })
  }

  /**
   * 上架
   */
  async sydcupRequest(user, houseIds = []) {
    this.log(`>>>sydcupRequest`)
    //是否套餐服务化城市，兼容新旧接口
    let url = `http://vip.58ganji.com/separation/house/taocan/sydcup?platform=wb&pushDay=1&houseIds=${encodeURIComponent(houseIds.join())}&_=${new Date().getTime()}`;
    if (this.isServiceCombo) {
      url = `http://vip.58ganji.com/separation/house/combo?houseIds=${encodeURIComponent(houseIds.join())}&upPlat=wb&paySourceNum=1&apiType=comboHouseUp&from=jp&_=${new Date().getTime()}`
    }
    this.log(`${url}`);
    return new Promise((resolve, reject) => {
      try {
        axios.request({
          url,
          headers: {
            cookie: decodeURIComponent(user.session)
          }
        }).then(res => {
          if (res.data.status === 'ok') {
            this.log(res.data.data)
            if (res.data.data.wb && res.data.data.wb.data && res.data.data.wb.data.errorDataList && res.data.data.wb.data.errorDataList.length) {
              let list = res.data.data.wb.data.errorDataList;
              for (let i = 0; i < list.length; i++) {
                //过滤信息
                if (list[i].errorMessage === '信息状态不合法') {
                  if (!user.filterHouseIds) {
                    user.filterHouseIds = [];
                  }
                  user.filterHouseIds.push(list[i].houseId)
                }
              }
            }
            if (res.data.data.wb.message === '上架套数已满' || res.data.data.wb.message === '您当日上架次数已达上限' || res.data.data.wb.message.includes('检测到您提交的房源中有房源不是您的')) {
              this.log(`上架异常:`)
              this.log(res.data.data.wb.message)
              resolve(-1)
            } else {
              resolve(res);
            }
          } else {
            this.log(`未处理异常:${res.data}`)
            resolve(-1)
          }
        }).catch(err => {
          resolve();
        })
      } catch (err) {
        this.log(`未处理异常3:${err.message}`)
        resolve(-1)
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

  filterHouseIds(houseIds = [], existHouseIds = [], user) {
    this.log(`>>>filterHouseIds`)
    //排除页面上以及存在的上架houseid
    let newHouseIds = [];
    if (houseIds.length) {
      houseIds.map(id => {
        if (!existHouseIds.includes(parseInt(id)) && id && !(user.filterHouseIds || []).includes(parseInt(id))) {
          newHouseIds.push(id)
        }
      })
    }
    return newHouseIds;
  }
  /**
   * 批量上架
   * @param {*} user
   */
  async sydcup(user) {
    this.log(`>>>sydcup`)
    try {
      let houseIds = [];
      //获取待上架的houseids
      houseIds = await this.getHouseIdsByDB(user);
      let flag = true
      do {
        //账户中已经上架的
        let existHouseIds = await this.searchHouseIds(user);
        //过滤已经存在的
        houseIds = await this.filterHouseIds(houseIds, existHouseIds, user)
        if (houseIds.length) {
          let houseIdsArr = this.groupArray(houseIds, 5)
          //调取上架接口（每次上架10条）循环知道上架结束
          for (let i = 0; i < houseIdsArr.length; i++) {
            let result = await this.sydcupRequest(user, houseIdsArr[i])
            if (result === -1) {
              flag = false;
              break;
            }
            await this.sleep(15000)
          }
        }
      } while (houseIds.length && flag);
    } catch (err) {
      this.log(err)
    }
  }

}
module.exports = Task6;
