let Util = require("../common/util");
let wx = require("../common/wx");
let schedule = require('node-schedule');

/**
 * 微信机器人
 */
class Wechaty extends Util {
  constructor() {
    super();
    this.taskName = "wechaty";
  }

  async getData(areaId, index) {
    let LIMIT = `${15*index+(index?1:0)},15`
    let sql = `SELECT store_info_title,telephone from store_for_rents where city_id=${areaId} ORDER BY created_at DESC LIMIT ${LIMIT}`;
    let result = await this.execSql(2, sql);
    return result;
  }
  async getAreaId(areaName) {
    let sql = `SELECT * FROM \`t_area\` WHERE \`area_name\`="${areaName}"`;
    let result = await this.execSql(3, sql);
    if (result && result.length) {
      return result[0].id;
    } else {
      return 0;
    }
  }

  /**
   * 发送消息
   * @param {*} wechaty
   */
  async publishInfo(wechaty) {
    this.log(`>>>publishInfo:${wechaty.name}`)
    this.roomList = [];
    do {
      if (wechaty.name === 'wechaty1') {
        this.roomList = await wx.findAll("店之家", wechaty.bot)
      } else {
        this.roomList = await wx.findAll("商铺网", wechaty.bot)
      }
      await this.sleep(5000);
    } while (this.roomList.length === 0);

    if (this.roomList && this.roomList.length) {
      this.log(
        `>>>${JSON.stringify(this.roomList.map(item => item.payload.topic))}`
      );
      for (let i = 0; i < this.roomList.length; i++) {
        //获取城市名称
        let topic = this.roomList[i].payload.topic;
        let areaName = null;
        try {
          let matchs = topic.match(/(^.*?)(店之家|商铺网)/);
          if (matchs) {
            areaName = topic.match(/(^.*?)(店之家|商铺网)/)[1];
          }
          areaName = areaName.replace(/\d/g, '');
        } catch (err) {
          this.log(err);
        }
        if (areaName) {
          this.log(areaName);
          let areaId = await this.getAreaId(areaName);
          if (areaId) {
            this.log(`${areaName}:${areaId}`);
            //用于limit   上午0 下午1
            //TODO :如果同微信内有多个同城市群，逻辑在这里改
            let index = new Date().getHours() >= 15 ? 1 : 0;
            let data = await this.getData(areaId, index);
            for (let j = 0; j < data.length; j++) {
              let msg = `求租 ${data[j].store_info_title
                .replace(/^求租/, "")
                .replace("其他 其他", "其他")
                .trim()} ${data[j].telephone}`;
              this.log(msg);
              await this.roomList[i].say(msg);
              await this.sleep(2000);
            }
          }
        }
      }
    }
  }

  async main() {
    let that = this;
    this.log(`>>>main`);
    let wechaty1 = await wx.start('wechaty1');
    let wechaty2 = await wx.start('wechaty2');
    //每天10，15点执行
    schedule.scheduleJob('31 14 15 * * *', async function () {
      that.log(`>>>scheduleJob`);
      try {
        await that.publishInfo(wechaty1);
      } catch (err) {
        that.log(err)
      }
      try {
        await that.publishInfo(wechaty2);
      } catch (err) {
        that.log(err)
      }
    });
  }
}

new Wechaty().main();
