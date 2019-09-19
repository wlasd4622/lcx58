let Util = require("../common/util");
let wx = require("../common/wx");

/**
 * 微信机器人
 */
class Wechaty extends Util {
  constructor() {
    super();
    this.taskName = "wechaty";
  }

  async getData(areaId) {
    let sql = `SELECT store_info_title,telephone from store_for_rents where city_id=${areaId} ORDER BY created_at DESC LIMIT 31,30`;
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
  async main() {
    this.log(`>>>main`);
    await wx.start();
    await this.sleep(5000);
    this.roomList = [];
    do {
      this.roomList = await wx.findAll("店之家");
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
          areaName = topic.match(/(^.*?)店之家/)[1];
        } catch (err) {
          this.log(err);
        }
        if (areaName) {
          let areaId = await this.getAreaId(areaName);
          if (areaId) {
            this.log(`${areaName}:${areaId}`);
            let data = await this.getData(areaId);
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
    this.log(`END`);
  }
}

new Wechaty().main();
